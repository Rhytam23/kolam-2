import React, { createContext, useEffect, useMemo, useState, useContext } from 'react';
import { generateDots, generateKolamPath } from '../utils/kolamLogic';
import type {
  AnalysisSummary,
  Point,
  WorkspaceImportPayload,
  WorkspaceSnapshot,
} from '../types/kolam';
import {
  loadSavedWorkspaces,
  normalizeGridSize,
  persistSavedWorkspaces,
  sanitizeWorkspacePayload,
} from '../lib/storage/workspaceStorage';

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
  savedWorkspaces: WorkspaceSnapshot[];
  saveWorkspace: () => void;
  loadWorkspace: (id: string) => void;
  removeWorkspace: (id: string) => void;
  exportDots: () => void;
  importWorkspace: (payload: WorkspaceImportPayload) => void;
  snapDotsToGrid: () => void;
}

const KolamContext = createContext<KolamContextValue | null>(null);

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
  return anchors.reduce(
    (closest, anchor) => Math.abs(anchor - value) < Math.abs(closest - value) ? anchor : closest,
    anchors[0],
  );
};

export const KolamProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [gridSize, setGridSizeState] = useState(5);
  const [analyzerDots, setAnalyzerDots] = useState<Point[]>([]);
  const [selectedDots, setSelectedDots] = useState<Point[]>([]);
  const [analysisSummary, setAnalysisSummary] = useState<AnalysisSummary | null>(null);
  const [savedWorkspaces, setSavedWorkspaces] = useState<WorkspaceSnapshot[]>(() => loadSavedWorkspaces());

  useEffect(() => {
    persistSavedWorkspaces(savedWorkspaces);
  }, [savedWorkspaces]);

  const normalizedGridSize = normalizeGridSize(gridSize);
  const generatedDots = useMemo(() => generateDots(normalizedGridSize, 500, 500), [normalizedGridSize]);
  const generatedPath = useMemo(() => generateKolamPath(normalizedGridSize, 500, 500), [normalizedGridSize]);

  const setGridSize = (size: number) => {
    setGridSizeState(normalizeGridSize(size));
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
    const snapped = analyzerDots.map(dot => ({
      x: snapPoint(dot.x, xAnchors),
      y: snapPoint(dot.y, yAnchors),
    }));
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
    const snapshot: WorkspaceSnapshot = {
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

  const importWorkspace = (payload: WorkspaceImportPayload) => {
    const normalized = sanitizeWorkspacePayload(payload);
    setGridSizeState(normalized.gridSize);
    setAnalyzerDots(normalized.analyzerDots);
    setSelectedDots(normalized.selectedDots.length ? normalized.selectedDots : normalized.analyzerDots);
    setAnalysisSummary(normalized.summary);
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

