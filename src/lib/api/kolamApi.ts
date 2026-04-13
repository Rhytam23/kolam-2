import type { AnalysisPreset, AnalysisResponse } from '../../types/kolam';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export interface AnalyzeKolamOptions {
  preset: AnalysisPreset;
  deskew: boolean;
  signal?: AbortSignal;
}

export async function analyzeKolam(file: File, options: AnalyzeKolamOptions): Promise<AnalysisResponse> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('preset', options.preset);
  formData.append('deskew', String(options.deskew));

  const response = await fetch(`${API_BASE_URL}/analyze`, {
    method: 'POST',
    body: formData,
    signal: options.signal,
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => '');
    throw new Error(detail || 'Analysis failed');
  }

  return response.json() as Promise<AnalysisResponse>;
}

