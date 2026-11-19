import type { AnalysisPreset, AnalysisResponse, Point } from '../types/kolam';

// Empty means "same origin": the FastAPI server serves both the app and /api in production,
// and Vite proxies /api in development. Set VITE_API_BASE_URL only when the API lives elsewhere.
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '');

export const MAX_UPLOAD_MB = 8;
export const ACCEPTED_TYPES = ['image/png', 'image/jpeg', 'image/webp'];

interface AnalyzeOptions {
  preset: AnalysisPreset;
  deskew: boolean;
  /** Use these (corrected) dots instead of detecting them again. */
  dots?: Point[];
  /** false: the design has no dot grid (alpana, pookalam, mandana…), so do not look for one. */
  grid?: boolean;
  signal?: AbortSignal;
  /** Called when the server is busy and the photo will be sent again after `seconds`. */
  onBusy?: (seconds: number, attempt: number) => void;
}

export type AnalysisErrorKind = 'network' | 'busy' | 'rate-limit' | 'file-too-large' | 'file-type' | 'file-unreadable' | 'server' | 'unknown';

/** Plain, friendly wording for each way reading a photo can fail. Never shows status codes or server text. */
export const ANALYSIS_MESSAGES: Record<AnalysisErrorKind, string> = {
  network: 'We could not reach the photo reader. Check your internet connection, then try again.',
  busy: 'The photo reader is very busy right now. Please wait a minute, then try again.',
  'rate-limit': 'That is a lot of photos in a short time. Please wait a minute, then try again.',
  'file-too-large': `That photo is too large. Try a smaller one (under ${MAX_UPLOAD_MB} MB), or take it again at a lower quality.`,
  'file-type': 'That file type cannot be read. Please use a PNG, JPEG or WebP photo.',
  'file-unreadable': 'We could not read that photo. Try another one, with the design in good light and filling most of the picture.',
  server: 'Something went wrong on our side while reading your photo. Please try again in a moment.',
  unknown: 'Something went wrong while reading your photo. Please try again.',
};

/** Which kind of failure an HTTP status is (null: the request never got an answer). */
export const analysisErrorKind = (status: number | null): AnalysisErrorKind => {
  if (status === null) return 'network';
  if (status === 429) return 'rate-limit';
  if (status === 503) return 'busy';
  if (status === 413) return 'file-too-large';
  if (status === 415) return 'file-type';
  if (status >= 400 && status < 500) return 'file-unreadable';
  if (status >= 500) return 'server';
  return 'unknown';
};

export const analysisErrorMessage = (status: number | null) => ANALYSIS_MESSAGES[analysisErrorKind(status)];

/** A failed reading, with a message that is safe to show and a kind the screen can act on. */
export class AnalysisError extends Error {
  readonly kind: AnalysisErrorKind;
  constructor(status: number | null) {
    super(analysisErrorMessage(status));
    this.name = 'AnalysisError';
    this.kind = analysisErrorKind(status);
  }
}

const wait = (ms: number, signal?: AbortSignal) => new Promise<void>((resolve, reject) => {
  const timer = setTimeout(resolve, ms);
  signal?.addEventListener('abort', () => { clearTimeout(timer); reject(new DOMException('Aborted', 'AbortError')); }, { once: true });
});

/** How many times a busy server (503) is asked again before giving up. */
const BUSY_RETRIES = 3;

export async function analyzeKolam(file: File, { preset, deskew, dots, grid, signal, onBusy }: AnalyzeOptions): Promise<AnalysisResponse> {
  const form = new FormData();
  form.append('file', file);
  form.append('preset', preset);
  form.append('deskew', String(deskew));
  if (dots) form.append('dots', JSON.stringify(dots));
  if (grid === false) form.append('grid', 'false');

  for (let attempt = 0; ; attempt++) {
    let response: Response;
    try {
      response = await fetch(`${API_BASE_URL}/api/analyze`, { method: 'POST', body: form, signal });
    } catch (err) {
      if ((err as Error).name === 'AbortError') throw err;
      throw new AnalysisError(null);
    }
    if (response.status === 503 && attempt < BUSY_RETRIES) {
      // Many people are reading photos at once: wait a little, then ask again.
      const seconds = Math.min(30, Math.max(3, Number(response.headers.get('Retry-After')) || 10)) + attempt * 2;
      onBusy?.(seconds, attempt + 1);
      await wait(seconds * 1000, signal);
      continue;
    }
    if (!response.ok) {
      throw new AnalysisError(response.status);
    }
    try {
      return sanitize(await response.json() as AnalysisResponse);
    } catch {
      throw new AnalysisError(500); // a reply that is not the expected data is a server fault
    }
  }
}

const HEX = /^#[0-9a-f]{6}$/i;
const PATH = /^[MLCZ0-9. -]*$/;

/** Traced layers end up inside inline SVG, so accept only plain colours and path numbers. */
const sanitize = (data: AnalysisResponse): AnalysisResponse => ({
  ...data,
  palette: (data.palette ?? []).filter(p => HEX.test(p.hex)),
  layers: (data.layers ?? []).filter(l => HEX.test(l.color) && PATH.test(l.path)),
  tidied: (data.tidied ?? []).filter(l => HEX.test(l.color) && PATH.test(l.path)),
  radial: data.radial ?? null,
});

/** Phone photos are often 5–8 MB; 1600 px is plenty for analysis and uploads far faster. */
export async function shrinkImage(file: File, maxSide = 1600): Promise<File> {
  try {
    const bitmap = await createImageBitmap(file);
    const scale = maxSide / Math.max(bitmap.width, bitmap.height);
    if (scale >= 1) return file;
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext('2d')!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.9));
    return blob ? new File([blob], file.name.replace(/\.\w+$/, '') + '.jpg', { type: 'image/jpeg' }) : file;
  } catch {
    return file; // the server can still take the original
  }
}
