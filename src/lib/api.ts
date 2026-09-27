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
  return response.json() as Promise<AnalysisResponse>;
}
