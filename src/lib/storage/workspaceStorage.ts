import type { WorkspaceImportPayload, WorkspaceSnapshot } from '../../types/kolam';

const STORAGE_KEY = 'solvix_kolam_workspace_v1';
const MAX_SAVED_WORKSPACES = 10;

const isFiniteNumber = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value);

const isPoint = (value: unknown): value is { x: number; y: number } => {
  return !!value && typeof value === 'object' && isFiniteNumber((value as { x?: unknown }).x) && isFiniteNumber((value as { y?: unknown }).y);
};

const isAnalysisSummary = (value: unknown): value is WorkspaceSnapshot['summary'] => {
  if (value === null) return true;
  if (!value || typeof value !== 'object') return false;
  const summary = value as { message?: unknown; source?: unknown };
  return typeof summary.message === 'string' && (summary.source === 'upload' || summary.source === 'generator' || summary.source === 'manual');
};

export const normalizeGridSize = (size: number) => {
  const safeOdd = size % 2 === 0 ? size + 1 : size;
  return Math.min(15, Math.max(3, safeOdd));
};

export const loadSavedWorkspaces = (): WorkspaceSnapshot[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];

    return parsed.filter((item): item is WorkspaceSnapshot => {
      if (!item || typeof item !== 'object') return false;
      const workspace = item as Partial<WorkspaceSnapshot>;
      return (
        typeof workspace.id === 'string' &&
        typeof workspace.createdAt === 'string' &&
        isFiniteNumber(workspace.gridSize) &&
        Array.isArray(workspace.analyzerDots) &&
        workspace.analyzerDots.every(isPoint) &&
        Array.isArray(workspace.selectedDots) &&
        workspace.selectedDots.every(isPoint) &&
        isAnalysisSummary(workspace.summary)
      );
    });
  } catch {
    return [];
  }
};

export const persistSavedWorkspaces = (workspaces: WorkspaceSnapshot[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(workspaces.slice(0, MAX_SAVED_WORKSPACES)));
};

export const sanitizeWorkspacePayload = (payload: WorkspaceImportPayload) => ({
  gridSize: normalizeGridSize(payload.gridSize ?? 5),
  analyzerDots: Array.isArray(payload.analyzerDots) ? payload.analyzerDots.filter(isPoint) : [],
  selectedDots: Array.isArray(payload.selectedDots) ? payload.selectedDots.filter(isPoint) : [],
  summary: isAnalysisSummary(payload.summary) ? payload.summary : { message: 'Imported workspace from JSON.', source: 'manual' as const },
});

