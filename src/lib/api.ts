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
  signal?: AbortSignal;
}

export async function analyzeKolam(file: File, { preset, deskew, dots, signal }: AnalyzeOptions): Promise<AnalysisResponse> {
  const form = new FormData();
  form.append('file', file);
  form.append('preset', preset);
  form.append('deskew', String(deskew));
  if (dots) form.append('dots', JSON.stringify(dots));

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}/api/analyze`, { method: 'POST', body: form, signal });
  } catch (err) {
    if ((err as Error).name === 'AbortError') throw err;
    throw new Error('Could not reach the analysis server. Is the backend running?');
  }
  if (!response.ok) {
    const body = await response.json().catch(() => null) as { detail?: unknown } | null;
    throw new Error(typeof body?.detail === 'string' ? body.detail : `Analysis failed (HTTP ${response.status}).`);
  }
  return sanitize(await response.json() as AnalysisResponse);
}

const HEX = /^#[0-9a-f]{6}$/i;
const PATH = /^[MLZ0-9. -]*$/;

/** Traced layers end up inside inline SVG, so accept only plain colours and path numbers. */
const sanitize = (data: AnalysisResponse): AnalysisResponse => ({
  ...data,
  palette: (data.palette ?? []).filter(p => HEX.test(p.hex)),
  layers: (data.layers ?? []).filter(l => HEX.test(l.color) && PATH.test(l.path)),
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
