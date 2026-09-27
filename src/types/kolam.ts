export const ANALYSIS_PRESETS = ['balanced', 'clean-scan', 'phone-photo', 'noisy-background'] as const;
export type AnalysisPreset = (typeof ANALYSIS_PRESETS)[number];

export interface Point {
  x: number;
  y: number;
}

/**
 * A pulli-kolam design on a dot lattice (Gerdes' mirror-curve model).
 * - mask[j][i] is '1' where a dot (pulli) sits in row j, column i.
 * - h[j][i] is the port between dots (i, j) and (i + 1, j); v[j][i] the port between (i, j) and (i, j + 1).
 *   'x' = strands cross, 'p' = strands turn back around each dot, 'j' = strands join the two dots,
 *   '.' = no port (one of the dots is missing). Ports on the outside always turn back.
 */
export interface Design {
  rows: number;
  cols: number;
  mask: string[];
  h: string[];
  v: string[];
}

/** Affine dot lattice in normalised image coordinates: dot (i, j) sits at origin + i·u + j·v. */
export interface Lattice {
  rows: number;
  cols: number;
  origin: Point;
  u: Point;
  v: Point;
  angle: number;
  spacing: number;
  fit: number;
}

export interface ImageSymmetry {
  mirrorVertical: number;
  mirrorHorizontal: number;
  rotation180: number;
  rotation90: number;
  diagonal: number;
}

export interface RadialSymmetry {
  /** N for N-fold rotational symmetry (1 = none, 0 = circular rings). */
  order: number;
  score: number;
  circular: boolean;
}

export interface PaletteEntry {
  hex: string;
  share: number;
  background: boolean;
}

/** A traced area of one colour, as an SVG path in 0–1 image coordinates (fill-rule evenodd). */
export interface ColourLayer {
  color: string;
  path: string;
}

export interface AnalysisResponse {
  width: number;
  height: number;
  dots: Point[];
  preset: AnalysisPreset;
  /** How well the dot grid was read; null for free-hand designs. */
  confidence: number | null;
  message: string;
  lattice: Lattice | null;
  design: Design | null;
  symmetry: ImageSymmetry | null;
  radial: RadialSymmetry | null;
  palette: PaletteEntry[];
  layers: ColourLayer[];
  /** Present when perspective correction changed the image: the corrected image the dots refer to. */
  image?: string;
}

/** The portable `.kolam.json` format. */
export interface KolamFile {
  format: 'kolam';
  version: 1;
  createdAt: string;
  design: Design;
  dots?: Point[];
  lattice?: Lattice | null;
}

export interface SavedKolam extends KolamFile {
  id: string;
}
