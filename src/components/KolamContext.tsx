import React, { createContext, useEffect, useMemo, useState, useContext } from 'react';
import { generateDots, generateKolamPath, Point } from '../utils/kolamLogic';

interface AnalysisSummary {
  message: string;
  source: 'upload' | 'generator' | 'manual';
}

interface SavedWorkspace {
  id: string;
  createdAt: string;
  gridSize: number;
  analyzerDots: Point[];
  selectedDots: Point[];
  summary: AnalysisSummary | null;
}

interface ImportPayload {
  gridSize?: number;
  analyzerDots?: Point[];
  selectedDots?: Point[];
  summary?: AnalysisSummary | null;
}

interface KolamContextValue {
  gridSize: number;
  setGridSize: (size: number) => void;
  generatedDots: Point[];
  generatedPath: string;
  analyzerDots: Point[];
  setAnalyzerDots: (dots: Point[]) => void;
  selectedDots: Point[];
  setSelectedDots: (dots: Point[]) => void;
  analysisSummary: AnalysisSummary | null;
  setAnalysisSummary: (summary: AnalysisSummary | null) => void;
  syncAnalyzerToGenerator: () => void;
  resetWorkspace: () => void;
  savedWorkspaces: SavedWorkspace[];
  saveWorkspace: () => void;
  loadWorkspace: (id: string) => void;
  removeWorkspace: (id: string) => void;
  exportDots: () => void;
  importWorkspace: (payload: ImportPayload) => void;
  snapDotsToGrid: () => void;
}

const KolamContext = createContext<KolamContextValue | null>(null);
const STORAGE_KEY = 'solvix_kolam_workspace_v1';

const clusterCoordinates = (values: number[], tolerance = 0.03) => {
  const sorted = [...values].sort((a, b) => a - b);
  const clusters: number[][] = [];

  sorted.forEach((value) => {
    const current = clusters[clusters.length - 1];
    if (!current || Math.abs(current[current.length - 1] - value) > tolerance) {
      clusters.push([value]);
    } else {
      current.push(value);
    }
  });

  return clusters.map(cluster => cluster.reduce((sum, v) => sum + v, 0) / cluster.length);
};

const snapPoint = (value: number, anchors: number[]) => {
  if (!anchors.length) return value;
  return anchors.reduce((closest, anchor) => Math.abs(anchor - value) < Math.abs(closest - value) ? anchor : closest, anchors[0]);
};

export const KolamProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [gridSize, setGridSizeState] = useState(5);
  const [analyzerDots, setAnalyzerDots] = useState<Point[]>([]);
  const [selectedDots, setSelectedDots] = useState<Point[]>([]);
  const [analysisSummary, setAnalysisSummary] = useState<AnalysisSummary | null>(null);
  const [savedWorkspaces, setSavedWorkspaces] = useState<SavedWorkspace[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(savedWorkspaces));
  }, [savedWorkspaces]);

  const normalizedGridSize = gridSize % 2 === 0 ? gridSize + 1 : gridSize;
  const generatedDots = useMemo(() => generateDots(normalizedGridSize, 500, 500), [normalizedGridSize]);
  const generatedPath = useMemo(() => generateKolamPath(normalizedGridSize, 500, 500), [normalizedGridSize]);

  const setGridSize = (size: number) => {
    const safeOdd = size % 2 === 0 ? size + 1 : size;
    setGridSizeState(Math.min(15, Math.max(3, safeOdd)));
  };

  const syncAnalyzerToGenerator = () => {
    if (!analyzerDots.length) return;
    setSelectedDots(analyzerDots);
    setAnalysisSummary({
      message: `Synced ${analyzerDots.length} detected dots into the workspace reference layer.`,
      source: 'manual',
    });
  };

  const snapDotsToGrid = () => {
    if (!analyzerDots.length) return;
    const xAnchors = clusterCoordinates(analyzerDots.map(dot => dot.x));
    const yAnchors = clusterCoordinates(analyzerDots.map(dot => dot.y));
    const snapped = analyzerDots.map(dot => ({ x: snapPoint(dot.x, xAnchors), y: snapPoint(dot.y, yAnchors) }));
    setAnalyzerDots(snapped);
    setSelectedDots(snapped);
    setAnalysisSummary({
      message: `Snapped ${snapped.length} dots into a cleaner lattice alignment.`,
      source: 'manual',
    });
  };

  const resetWorkspace = () => {
    setAnalyzerDots([]);
    setSelectedDots([]);
    setAnalysisSummary(null);
    setGridSizeState(5);
  };

  const saveWorkspace = () => {
    const snapshot: SavedWorkspace = {
      id: `${Date.now()}`,
      createdAt: new Date().toISOString(),
      gridSize: normalizedGridSize,
      analyzerDots,
      selectedDots,
      summary: analysisSummary,
    };
    setSavedWorkspaces(prev => [snapshot, ...prev].slice(0, 10));
  };

  const loadWorkspace = (id: string) => {
    const found = savedWorkspaces.find(item => item.id === id);
    if (!found) return;
    setGridSizeState(found.gridSize);
    setAnalyzerDots(found.analyzerDots);
    setSelectedDots(found.selectedDots);
    setAnalysisSummary(found.summary);
  };

  const importWorkspace = (payload: ImportPayload) => {
    setGridSizeState(payload.gridSize ?? 5);
    setAnalyzerDots(payload.analyzerDots ?? []);
    setSelectedDots(payload.selectedDots ?? payload.analyzerDots ?? []);
    setAnalysisSummary(payload.summary ?? { message: 'Imported workspace from JSON.', source: 'manual' });
  };

  const removeWorkspace = (id: string) => {
    setSavedWorkspaces(prev => prev.filter(item => item.id !== id));
  };

  const exportDots = () => {
    const payload = {
      exportedAt: new Date().toISOString(),
      gridSize: normalizedGridSize,
      analyzerDots,
      selectedDots,
      summary: analysisSummary,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `kolam-workspace-${Date.now()}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const value = useMemo(
    () => ({
      gridSize: normalizedGridSize,
      setGridSize,
      generatedDots,
      generatedPath,
      analyzerDots,
      setAnalyzerDots,
      selectedDots,
      setSelectedDots,
      analysisSummary,
      setAnalysisSummary,
      syncAnalyzerToGenerator,
      resetWorkspace,
      savedWorkspaces,
      saveWorkspace,
      loadWorkspace,
      removeWorkspace,
      exportDots,
      importWorkspace,
      snapDotsToGrid,
    }),
    [normalizedGridSize, generatedDots, generatedPath, analyzerDots, selectedDots, analysisSummary, savedWorkspaces],
  );

  return <KolamContext.Provider value={value}>{children}</KolamContext.Provider>;
};

export const useKolam = () => {
  const context = useContext(KolamContext);
  if (!context) {
    throw new Error('useKolam must be used inside KolamProvider');
  }
  return context;
};
