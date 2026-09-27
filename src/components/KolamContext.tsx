import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { countLoops, diamondDesign, makeSingleLine, squareDesign, symmetries, type SymmetryName } from '../utils/kolamLogic';
import type { Design, KolamFile, Lattice, Point, SavedKolam } from '../types/kolam';
import { loadSaved, persistSaved, toKolamFile } from '../lib/kolamFile';

export type Shape = 'square' | 'diamond';

/** A kolam read from a photo (or loaded from a file): the design plus where its dots sit in the image. */
export interface Scan {
  design: Design;
  lattice: Lattice | null;
}

interface KolamContextValue {
  size: number;
  setSize: (size: number) => void;
  shape: Shape;
  setShape: (shape: Shape) => void;
  singleLine: boolean;
  setSingleLine: (on: boolean) => void;
  scan: Scan | null;
  setScan: (scan: Scan | null) => void;
  useScan: boolean;
  setUseScan: (on: boolean) => void;
  dots: Point[];
  setDots: (dots: Point[]) => void;
  /** What the generator and walkthrough show. */
  design: Design;
  loops: number;
  symmetry: SymmetryName[];
  saved: SavedKolam[];
  save: () => void;
  remove: (id: string) => void;
  open: (file: KolamFile) => void;
  currentFile: () => KolamFile;
}

const KolamContext = createContext<KolamContextValue | null>(null);

export const KolamProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [size, setSize] = useState(5);
  const [shape, setShape] = useState<Shape>('square');
  const [singleLine, setSingleLine] = useState(true);
  const [scan, setScanState] = useState<Scan | null>(null);
  const [useScan, setUseScan] = useState(false);
  const [dots, setDots] = useState<Point[]>([]);
  const [saved, setSaved] = useState<SavedKolam[]>(loadSaved);

  useEffect(() => persistSaved(saved), [saved]);

  const setScan = useCallback((next: Scan | null) => {
    setScanState(next);
    setUseScan(!!next);
    // Show a scanned kolam as it was drawn; the user can still join it into one line.
    if (next) setSingleLine(false);
  }, []);

  const design = useMemo(() => {
    const base = useScan && scan ? scan.design : shape === 'square' ? squareDesign(size) : diamondDesign(size);
    return singleLine ? makeSingleLine(base) : base;
  }, [useScan, scan, shape, size, singleLine]);
  const loops = useMemo(() => countLoops(design), [design]);
  const symmetry = useMemo(() => symmetries(design), [design]);

  const currentFile = useCallback(() => toKolamFile(design, dots, useScan ? scan?.lattice ?? null : null), [design, dots, useScan, scan]);

  const value = useMemo<KolamContextValue>(() => ({
    size, setSize, shape, setShape, singleLine, setSingleLine,
    scan, setScan, useScan, setUseScan, dots, setDots,
    design, loops, symmetry,
    saved,
    save: () => setSaved(prev => [{ ...currentFile(), id: `${Date.now()}` }, ...prev].slice(0, 10)),
    remove: id => setSaved(prev => prev.filter(item => item.id !== id)),
    open: file => {
      setScan({ design: file.design, lattice: file.lattice ?? null });
      setDots(file.dots ?? []);
    },
    currentFile,
  }), [size, shape, singleLine, scan, setScan, useScan, dots, design, loops, symmetry, saved, currentFile]);

  return <KolamContext.Provider value={value}>{children}</KolamContext.Provider>;
};

export const useKolam = () => {
  const context = useContext(KolamContext);
  if (!context) throw new Error('useKolam must be used inside KolamProvider');
  return context;
};
