import type { AnalysisPreset, AnalysisResponse, Point } from '../types/kolam';

// Empty means "same origin": the FastAPI server serves both the app and /api in production,
// and Vite proxies /api in development. Set VITE_API_BASE_URL only when the API lives elsewhere.
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '');

export const MAX_UPLOAD_MB = 8;
export const ACCEPTED_TYPES = ['image/png', 'image/jpeg', 'image/webp'];

export interface AnalyzeOptions {
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
      throw new Error('Could not reach the analysis server. Check your connection and try again.');
    }
    if (response.status === 503 && attempt < BUSY_RETRIES) {
      // Many people are reading photos at once: wait a little, then ask again.
      const seconds = Math.min(30, Math.max(3, Number(response.headers.get('Retry-After')) || 10)) + attempt * 2;
      onBusy?.(seconds, attempt + 1);
      await wait(seconds * 1000, signal);
      continue;
    }
    if (!response.ok) {
      const body = await response.json().catch(() => null) as { detail?: unknown } | null;
      throw new Error(typeof body?.detail === 'string' ? body.detail : `Analysis failed (HTTP ${response.status}).`);
    }
    return sanitize(await response.json() as AnalysisResponse);
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
