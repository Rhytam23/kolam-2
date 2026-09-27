import { designToSvg, diamondDesign, makeSingleLine, squareDesign } from '../utils/kolamLogic';
import { makeRadial, radialToSvg, type RadialDesign, type RadialStyle } from '../utils/radial';
import { geometricToSvg, makeGeometric, type GeometricDesign, type GeometricPattern } from '../utils/geometric';
import { guideDotColour } from '../utils/radial';
import { PALETTES, type PaletteName } from '../lib/colours';
import { kolamDotColour } from '../lib/artwork';
import type { Design } from '../types/kolam';
import type { useKolam } from '../components/KolamContext';

/** Everything needed to make a design again: which drawing mode, its settings and its colours. */
export type DesignSpec =
  | { mode: 'kolam'; shape: 'square' | 'diamond'; size: number; singleLine: boolean; palette: PaletteName }
  | { mode: 'radial'; style: RadialStyle; petals: number; layers: number; palette: PaletteName }
  | { mode: 'geometric'; pattern: GeometricPattern; size: number; palette: PaletteName };

export interface DesignPreset {
  title: string;
  /** A short label for the card, e.g. "Dot kolam". */
  kind: string;
  detail: string;
  spec: DesignSpec;
}

export type BuiltDesign =
  | { mode: 'kolam'; design: Design; spec: Extract<DesignSpec, { mode: 'kolam' }> }
  | { mode: 'radial'; design: RadialDesign; spec: Extract<DesignSpec, { mode: 'radial' }> }
  | { mode: 'geometric'; design: GeometricDesign; spec: Extract<DesignSpec, { mode: 'geometric' }> };

export const buildDesign = (spec: DesignSpec): BuiltDesign => {
  if (spec.mode === 'kolam') {
    const base = spec.shape === 'square' ? squareDesign(spec.size) : diamondDesign(spec.size);
    return { mode: 'kolam', design: spec.singleLine ? makeSingleLine(base) : base, spec };
  }
  if (spec.mode === 'radial') {
    return { mode: 'radial', design: makeRadial({ style: spec.style, petals: spec.petals, layers: spec.layers, ...PALETTES[spec.palette] }), spec };
  }
  return { mode: 'geometric', design: makeGeometric({ pattern: spec.pattern, size: spec.size, ...PALETTES[spec.palette] }), spec };
};

export const presetBackground = (spec: DesignSpec) => PALETTES[spec.palette].background;

export const presetSvg = (spec: DesignSpec) => {
  const built = buildDesign(spec);
  if (built.mode === 'kolam') {
    const { background, colors } = PALETTES[spec.palette];
    return designToSvg(built.design, { background, stroke: colors, dot: kolamDotColour(background) });
  }
  if (built.mode === 'radial') return radialToSvg(built.design);
  return geometricToSvg(built.design, { dotColour: guideDotColour(built.design.background) });
};

/** Opens a design in the studio. */
export const applyPreset = (k: ReturnType<typeof useKolam>, spec: DesignSpec) => {
  if (spec.mode === 'kolam') {
    k.setUseScan(false);
    k.setShape(spec.shape);
    k.setSize(spec.size);
    k.setSingleLine(spec.singleLine);
    k.setKolamPalette(spec.palette);
  } else if (spec.mode === 'radial') {
    k.setRadialStyle(spec.style);
    k.setPetals(spec.petals);
    k.setLayers(spec.layers);
    k.setRadialPalette(spec.palette);
  } else {
    k.setGeoPattern(spec.pattern);
    k.setGeoSize(spec.size);
    k.setGeoPalette(spec.palette);
  }
  k.setMode(spec.mode);
};

/** The designs offered in the general studio. */
export const STUDIO_PRESETS: DesignPreset[] = [
  { title: 'Sikku kolam', kind: 'Kolam', detail: '13 dots, one unbroken line', spec: { mode: 'kolam', shape: 'diamond', size: 5, singleLine: true, palette: 'kaavi' } },
  { title: 'Festival rangoli', kind: 'Rangoli', detail: 'Six bands of petals, leaves and teardrops', spec: { mode: 'radial', style: 'festival', petals: 12, layers: 4, palette: 'festival' } },
  { title: 'Pookalam', kind: 'Pookalam', detail: 'Rings of Onam flowers', spec: { mode: 'radial', style: 'pookalam', petals: 12, layers: 3, palette: 'onam' } },
  { title: 'Muggu star', kind: 'Muggulu', detail: 'Straight lines from dot to dot', spec: { mode: 'geometric', pattern: 'star', size: 9, palette: 'sankranti' } },
  { title: 'Alpana', kind: 'Alpana', detail: 'Rice paste on red earth', spec: { mode: 'radial', style: 'alpana', petals: 8, layers: 3, palette: 'alpana' } },
  { title: 'Chittara bands', kind: 'Chittara', detail: 'Triangles and diamonds in bands', spec: { mode: 'geometric', pattern: 'bands', size: 9, palette: 'chittara' } },
];
