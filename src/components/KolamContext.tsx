import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { countLoops, diamondDesign, makeSingleLine, squareDesign, symmetries, type SymmetryName } from '../utils/kolamLogic';
import { makeRadial, type RadialDesign, type RadialStyle } from '../utils/radial';
import { PALETTES, type PaletteName } from '../lib/colours';
import type { Design, KolamFile, Lattice, PaletteEntry, Point, SavedKolam } from '../types/kolam';
import type { TracedArt } from '../utils/traced';
import { loadSaved, persistSaved, toKolamFile } from '../lib/kolamFile';

export type Shape = 'square' | 'diamond';
/** What the generator and the drawing guide are showing. */
export type Mode = 'kolam' | 'radial' | 'traced';
export type GuideView = 'steps' | 'practice';

/** A kolam read from a photo (or loaded from a file): the design plus where its dots sit in the image. */
export interface Scan {
  design: Design;
  lattice: Lattice | null;
}

/** A free-hand drawing traced from a photo, one filled layer per colour. */
export type Traced = TracedArt;

export interface Colours {
  background: string;
  colors: readonly string[];
}

interface KolamContextValue {
  mode: Mode;
  setMode: (mode: Mode) => void;

  // dot kolam
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
  design: Design;
  loops: number;
  symmetry: SymmetryName[];
  kolamColours: Colours;
  kolamPalette: PaletteName;
  setKolamPalette: (name: PaletteName) => void;

  // radial rangoli / alpana
  petals: number;
  setPetals: (n: number) => void;
  layers: number;
  setLayers: (n: number) => void;
  radialStyle: RadialStyle;
  setRadialStyle: (style: RadialStyle) => void;
  radialColours: Colours;
  setRadialPalette: (name: PaletteName) => void;
  radial: RadialDesign;
  /** Starts a radial design that matches a photographed one: same symmetry and colours. */
  makeSimilar: (order: number, palette: PaletteEntry[]) => void;

  /** Whether the drawing guide shows the steps or lets the visitor practise. */
  guideView: GuideView;
  setGuideView: (view: GuideView) => void;

  // traced free-hand drawing
  traced: Traced | null;
  setTraced: (traced: Traced | null) => void;

  saved: SavedKolam[];
  save: () => void;
  remove: (id: string) => void;
  open: (file: KolamFile) => void;
  currentFile: () => KolamFile;
}

const KolamContext = createContext<KolamContextValue | null>(null);

export const KolamProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setMode] = useState<Mode>('kolam');
  const [size, setSize] = useState(5);
  const [shape, setShape] = useState<Shape>('square');
  const [singleLine, setSingleLine] = useState(true);
  const [scan, setScanState] = useState<Scan | null>(null);
  const [useScan, setUseScan] = useState(false);
  const [dots, setDots] = useState<Point[]>([]);
  const [kolamPalette, setKolamPalette] = useState<PaletteName>('kaavi');
  const [petals, setPetals] = useState(8);
  const [layers, setLayers] = useState(3);
  const [radialStyle, setRadialStyle] = useState<RadialStyle>('lotus');
  const [radialColours, setRadialColours] = useState<Colours>(PALETTES.pongal);
  const [traced, setTracedState] = useState<Traced | null>(null);
  const [guideView, setGuideView] = useState<GuideView>('steps');
  const [saved, setSaved] = useState<SavedKolam[]>(loadSaved);

  useEffect(() => persistSaved(saved), [saved]);

  const setScan = useCallback((next: Scan | null) => {
    setScanState(next);
    setUseScan(!!next);
    if (next) {
      // Show a scanned kolam as it was drawn; the user can still join it into one line.
      setSingleLine(false);
      setMode('kolam');
    }
  }, []);

  const setTraced = useCallback((next: Traced | null) => {
    setTracedState(next);
    if (next) setMode('traced');
    else setMode(m => (m === 'traced' ? 'kolam' : m));
  }, []);

  const makeSimilar = useCallback((order: number, palette: PaletteEntry[]) => {
    const background = palette.find(p => p.background)?.hex ?? '#FFF8EE';
    const colors = palette.filter(p => !p.background).slice(0, 5).map(p => p.hex);
    setPetals(order >= 3 && order <= 16 ? order : 8);
    setRadialColours({ background, colors: colors.length ? colors : PALETTES.pongal.colors });
    setRadialStyle(colors.length > 1 ? 'lotus' : 'alpana');
    setMode('radial');
  }, []);

  const design = useMemo(() => {
    const base = useScan && scan ? scan.design : shape === 'square' ? squareDesign(size) : diamondDesign(size);
    return singleLine ? makeSingleLine(base) : base;
  }, [useScan, scan, shape, size, singleLine]);
  const loops = useMemo(() => countLoops(design), [design]);
  const symmetry = useMemo(() => symmetries(design), [design]);
  const radial = useMemo(
    () => makeRadial({ petals, layers, style: radialStyle, ...radialColours }),
    [petals, layers, radialStyle, radialColours],
  );

  const currentFile = useCallback(() => toKolamFile(design, dots, useScan ? scan?.lattice ?? null : null), [design, dots, useScan, scan]);

  const value = useMemo<KolamContextValue>(() => ({
    mode, setMode,
    size, setSize, shape, setShape, singleLine, setSingleLine,
    scan, setScan, useScan, setUseScan, dots, setDots,
    design, loops, symmetry,
    kolamColours: PALETTES[kolamPalette], kolamPalette, setKolamPalette,
    petals, setPetals, layers, setLayers, radialStyle, setRadialStyle,
    radialColours, setRadialPalette: name => setRadialColours(PALETTES[name]), radial, makeSimilar,
    guideView, setGuideView,
    traced, setTraced,
    saved,
    save: () => setSaved(prev => [{ ...currentFile(), id: `${Date.now()}` }, ...prev].slice(0, 10)),
    remove: id => setSaved(prev => prev.filter(item => item.id !== id)),
    open: file => {
      setScan({ design: file.design, lattice: file.lattice ?? null });
      setDots(file.dots ?? []);
    },
    currentFile,
  }), [mode, size, shape, singleLine, scan, setScan, useScan, dots, design, loops, symmetry, kolamPalette,
    petals, layers, radialStyle, radialColours, radial, makeSimilar, guideView, traced, setTraced, saved, currentFile]);

  return <KolamContext.Provider value={value}>{children}</KolamContext.Provider>;
};

export const useKolam = () => {
  const context = useContext(KolamContext);
  if (!context) throw new Error('useKolam must be used inside KolamProvider');
  return context;
};
