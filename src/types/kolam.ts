export const ANALYSIS_PRESETS = [
  'balanced',
  'clean-scan',
  'phone-photo',
  'noisy-background',
] as const;

export type AnalysisPreset = (typeof ANALYSIS_PRESETS)[number];

export interface Point {
  x: number;
  y: number;
}

export interface AnalysisResponse {
  width: number;
  height: number;
  dots: Point[];
  message: string;
  preset?: string;
  confidence?: number;
}

export interface AnalysisSummary {
  message: string;
  source: 'upload' | 'generator' | 'manual';
}

export interface WorkspaceSnapshot {
  id: string;
  createdAt: string;
  gridSize: number;
  analyzerDots: Point[];
  selectedDots: Point[];
  summary: AnalysisSummary | null;
}

export interface WorkspaceImportPayload {
  gridSize?: number;
  analyzerDots?: Point[];
  selectedDots?: Point[];
  summary?: AnalysisSummary | null;
}

