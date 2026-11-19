/*
 * Mehendi (henna) designs: motifs drawn on the silhouette of a hand. Unlike floor art there is no dot
 * grid. A design is a list of strokes (a vine, a petal, a paisley, a dot), grouped in the order they are
 * piped from the cone: the centre first, the fingers next, the wrist band last. Every stroke is a smooth
 * curve through a few waypoints, so the same data draws the picture, the step-by-step guide and practice.
 */

export type MehendiLayout = 'mandala' | 'fingers' | 'bridal';
export type HandSide = 'right' | 'left';

export const MEHENDI_LAYOUTS: Record<MehendiLayout, { label: string; hint: string }> = {
  mandala: { label: 'Mandala palm', hint: 'A round flower of petals at the centre of the palm, with a vine up each finger.' },
  fingers: { label: 'Finger bands', hint: 'A paisley on the palm and fine bands of diamonds and dots along every finger.' },
  bridal: { label: 'Bridal vine', hint: 'One long vine with leaves from the middle finger to the wrist, paisleys on both sides and lattice on the fingers.' },
};

export interface Pt {
  x: number;
  y: number;
}

export interface MehendiStroke {
  /** 'dot' is a single drop of paste; a petal is a closed leaf shape; a line is open or closed. */
  kind: 'line' | 'petal' | 'dot';
  /** The stage it is drawn in (an index into MehendiDesign.groups). */
  group: number;
  /** The waypoints the curve passes through. A dot has one. */
  points: Pt[];
  closed: boolean;
  /** Filled in with paste, not only outlined. */
  filled: boolean;
  /** Radius of a dot. */
  radius?: number;
}

export interface MehendiDesign {
  layout: MehendiLayout;
  density: number;
  side: HandSide;
  strokes: MehendiStroke[];
  /** The name of each stage, in drawing order. */
  groups: string[];
  /** The colour of the skin (the ground) and of the henna. */
  skin: string;
  ink: string;
}

export const MEHENDI_WIDTH = 500;
export const MEHENDI_HEIGHT = 540;
/** A square picture with the hand in the middle (the hand itself is 500 wide). */
export const MEHENDI_VIEWBOX = '-20 0 540 540';
export const MEHENDI_DENSITIES = [1, 2, 3] as const;

// ---------------------------------------------------------------- the hand

const PALM = { x: 250, y: 372 };
const FINGER_X = [173, 221, 269, 317];
const FINGER_TOP = [105, 70, 98, 150];
const FINGER_BASE = 280;
const FINGER_WIDTH = 46;
/** The thumb grows from here, leaning this far to the outside of the hand. */
const THUMB_BASE = { x: 152, y: 412 };
const THUMB_LEAN = (38 * Math.PI) / 180;

interface HandShape {
  x: number;
  y: number;
  w: number;
  h: number;
  rx: number;
  /** Degrees, about (rotateX, rotateY). */
  rotate?: [number, number, number];
}

/** The silhouette of a hand, as rounded rectangles (palm, wrist, four fingers and a thumb) for a right hand. */
const HAND: HandShape[] = [
  { x: 148, y: 268, w: 204, h: 204, rx: 58 },
  { x: 176, y: 440, w: 148, h: 100, rx: 0 },
  ...FINGER_X.map((cx, i) => ({ x: cx - FINGER_WIDTH / 2, y: FINGER_TOP[i], w: FINGER_WIDTH, h: FINGER_BASE + 12 - FINGER_TOP[i], rx: FINGER_WIDTH / 2 })),
  { x: THUMB_BASE.x - 27, y: THUMB_BASE.y - 178, w: 54, h: 200, rx: 27, rotate: [-38, THUMB_BASE.x, THUMB_BASE.y] },
];

const isDarkColour = (hex: string) => {
  const [r, g, b] = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16));
  return 0.299 * r + 0.587 * g + 0.114 * b < 128;
};

/** Whether a point lies on the hand (the skin, not the space around it). */
export const onHand = (p: Pt, side: HandSide, margin = 0): boolean => {
  const q = side === 'left' ? { x: MEHENDI_WIDTH - p.x, y: p.y } : p;
  return HAND.some(s => {
    let { x, y } = q;
    if (s.rotate) {
      const [deg, cx, cy] = s.rotate;
      const a = (-deg * Math.PI) / 180;
      x = cx + (q.x - cx) * Math.cos(a) - (q.y - cy) * Math.sin(a);
      y = cy + (q.x - cx) * Math.sin(a) + (q.y - cy) * Math.cos(a);
    }
    // How far the point is outside the straight part of a rounded rectangle.
    const dx = Math.max(s.x + s.rx - x, 0, x - (s.x + s.w - s.rx));
    const dy = Math.max(s.y + s.rx - y, 0, y - (s.y + s.h - s.rx));
    const inside = x >= s.x && x <= s.x + s.w && y >= s.y && y <= s.y + s.h;
    return inside && Math.hypot(dx, dy) <= s.rx - margin;
  });
};

/** The colour around the hand: a quiet ground that keeps the skin and the henna readable. */
export const mehendiSurround = (skin: string) => (isDarkColour(skin) ? '#16100D' : '#F7EDE0');

/** The hand as SVG: an outline first, then the skin over it, so only the outer edge shows. */
export const handSvg = (skin: string, side: HandSide) => {
  const edge = isDarkColour(skin) ? 'rgba(255,255,255,0.35)' : 'rgba(70,35,15,0.45)';
  const shapes = (extra: string) => HAND.map(s => `<rect x="${s.x}" y="${s.y}" width="${s.w}" height="${s.h}" rx="${s.rx}"${s.rotate ? ` transform="rotate(${s.rotate.join(' ')})"` : ''} ${extra}/>`).join('');
  const body = `${shapes(`fill="${edge}" stroke="${edge}" stroke-width="5"`)}${shapes(`fill="${skin}"`)}`;
  return side === 'left' ? `<g transform="translate(${MEHENDI_WIDTH} 0) scale(-1 1)">${body}</g>` : `<g>${body}</g>`;
};

// ---------------------------------------------------------------- curves

const f = (n: number) => Math.round(n * 10) / 10;

/** Smooth cubic pieces through the waypoints (Catmull-Rom): piece i runs from point i to point i + 1. */
export const curvePieces = (pts: Pt[], closed: boolean): string[] => {
  const n = pts.length;
  const at = (i: number) => (closed ? pts[((i % n) + n) % n] : pts[Math.max(0, Math.min(n - 1, i))]);
  const count = closed ? n : n - 1;
  const pieces: string[] = [];
  for (let i = 0; i < count; i++) {
    const [p0, p1, p2, p3] = [at(i - 1), at(i), at(i + 1), at(i + 2)];
    const c1 = { x: p1.x + (p2.x - p0.x) / 6, y: p1.y + (p2.y - p0.y) / 6 };
    const c2 = { x: p2.x - (p3.x - p1.x) / 6, y: p2.y - (p3.y - p1.y) / 6 };
    pieces.push(`M${f(p1.x)} ${f(p1.y)}C${f(c1.x)} ${f(c1.y)} ${f(c2.x)} ${f(c2.y)} ${f(p2.x)} ${f(p2.y)}`);
  }
  return pieces;
};

export const dotRadius = (s: MehendiStroke) => s.radius ?? 3;

/** A circle as a path, for drawing a dot in one go. */
export const dotPath = (p: Pt, r: number) => `M${f(p.x - r)} ${f(p.y)}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0Z`;

/** The whole stroke as one path. */
export const strokePath = (s: MehendiStroke): string => {
  if (s.kind === 'dot') return dotPath(s.points[0], dotRadius(s));
  const pieces = curvePieces(s.points, s.closed);
  return pieces[0] + pieces.slice(1).map(p => p.slice(p.indexOf('C'))).join('') + (s.closed ? 'Z' : '');
};

// ---------------------------------------------------------------- motifs

const polar = (centre: Pt, angle: number, radius: number): Pt => ({ x: centre.x + Math.cos(angle) * radius, y: centre.y + Math.sin(angle) * radius });

/** A leaf or petal: from `base`, pointing along `angle`, `length` long and `width` across. */
const leaf = (base: Pt, angle: number, length: number, width: number): Pt[] => {
  const along = (t: number, across: number): Pt => ({
    x: base.x + Math.cos(angle) * length * t - Math.sin(angle) * across,
    y: base.y + Math.sin(angle) * length * t + Math.cos(angle) * across,
  });
  return [along(0, 0), along(0.5, width), along(1, 0), along(0.5, -width)];
};

/** A paisley (kairi): a teardrop whose tip curls to one side. */
const paisley = (base: Pt, angle: number, length: number, width: number): Pt[] => {
  const shape: Array<[number, number]> = [[0, 0], [0.18, 0.46], [0.55, 0.52], [0.9, 0.22], [1, -0.3], [0.72, -0.2], [0.38, -0.4], [0.12, -0.34]];
  return shape.map(([u, v]) => ({
    x: base.x + Math.cos(angle) * length * u - Math.sin(angle) * width * v,
    y: base.y + Math.sin(angle) * length * u + Math.cos(angle) * width * v,
  }));
};

const circle = (centre: Pt, radius: number, points = 8): Pt[] => Array.from({ length: points }, (_, i) => polar(centre, (2 * Math.PI * i) / points, radius));

const diamond = (c: Pt, hw: number, hh: number): Pt[] => [{ x: c.x, y: c.y - hh }, { x: c.x + hw, y: c.y }, { x: c.x, y: c.y + hh }, { x: c.x - hw, y: c.y }];

const thumbPoint = (t: number): Pt => ({ x: THUMB_BASE.x - Math.sin(THUMB_LEAN) * t, y: THUMB_BASE.y - Math.cos(THUMB_LEAN) * t });

const clampDensity = (d: number) => Math.max(1, Math.min(3, Math.round(d)));

class Builder {
  readonly strokes: MehendiStroke[] = [];
  readonly groups: string[] = [];
  private group = -1;
  constructor(private readonly side: HandSide) {}

  private mirror(p: Pt): Pt {
    return this.side === 'left' ? { x: MEHENDI_WIDTH - p.x, y: p.y } : p;
  }

  /** Starts the next stage. */
  stage(name: string) {
    this.groups.push(name);
    this.group = this.groups.length - 1;
  }

  line(points: Pt[], { closed = false, filled = false, kind = 'line' as 'line' | 'petal' } = {}) {
    this.strokes.push({ kind, group: this.group, points: points.map(p => this.mirror(p)), closed, filled });
  }

  petal(points: Pt[], filled: boolean) {
    this.line(points, { closed: true, filled, kind: 'petal' });
  }

  dot(p: Pt, radius = 3) {
    this.strokes.push({ kind: 'dot', group: this.group, points: [this.mirror(p)], closed: false, filled: true, radius });
  }
}

/** A vine up a finger, zigzagging with a leaf at each turn and a dot at the tip. */
const fingerVine = (b: Builder, index: number, density: number) => {
  const cx = FINGER_X[index];
  const top = FINGER_TOP[index] + 18;
  const turns = 2 + density;
  const points = Array.from({ length: turns + 1 }, (_, i) => ({ x: cx + (i === 0 || i === turns ? 0 : i % 2 ? -6 : 6), y: FINGER_BASE - 4 - ((FINGER_BASE - 4 - top) * i) / turns }));
  b.line(points);
  points.slice(1, -1).forEach((p, i) => b.petal(leaf(p, -Math.PI / 2 + (i % 2 ? -0.9 : 0.9), 17, 5.5), true));
  b.dot({ x: cx, y: FINGER_TOP[index] + 11 }, 3.2);
};

const thumbVine = (b: Builder, density: number) => {
  const steps = 2 + density;
  const points = Array.from({ length: steps + 1 }, (_, i) => thumbPoint(26 + (i * 108) / steps));
  b.line(points);
  points.slice(1, -1).forEach((p, i) => {
    const angle = -Math.PI / 2 - THUMB_LEAN + (i % 2 ? -0.9 : 0.9);
    b.petal(leaf(p, angle, 15, 5), true);
  });
  b.dot(thumbPoint(150), 3.2);
};

/** Bangle lines round the wrist, with a row of dots between them in the richer designs. */
const wristBands = (b: Builder, density: number) => {
  const band = (y: number) => b.line([190, 220, 250, 280, 310].map((x, i) => ({ x, y: y + (i % 2 ? 2 : -2) })));
  band(488);
  if (density >= 2) band(502);
  if (density >= 3) [200, 225, 250, 275, 300].forEach(x => b.dot({ x, y: 495 }, 2.4));
};

const mandala = (b: Builder, density: number) => {
  const petals = 4 + 2 * density;
  const angle = (i: number, half = 0) => -Math.PI / 2 + ((i + half) * 2 * Math.PI) / petals;

  b.stage('the centre');
  b.line(circle(PALM, 11), { closed: true });
  b.dot(PALM, 3.4);

  b.stage('the petals');
  for (let i = 0; i < petals; i++) b.petal(leaf(polar(PALM, angle(i), 18), angle(i), 34, 11), true);

  b.stage('the outer petals');
  for (let i = 0; i < petals; i++) b.petal(leaf(polar(PALM, angle(i, 0.5), 56), angle(i, 0.5), 27, 9.5), false);

  b.stage('the ring of dots');
  for (let i = 0; i < petals * 2; i++) b.dot(polar(PALM, -Math.PI / 2 + (i * Math.PI) / petals, 91), 2.8);

  b.stage('the fingers');
  FINGER_X.forEach((_, i) => fingerVine(b, i, density));
  thumbVine(b, density);

  b.stage('the wrist');
  wristBands(b, density);
};

const fingers = (b: Builder, density: number) => {
  b.stage('the paisley');
  b.line(paisley({ x: 250, y: 452 }, -Math.PI / 2, 140, 64), { closed: true });
  b.petal(paisley({ x: 250, y: 428 }, -Math.PI / 2, 76, 34), true);
  b.dot({ x: 250, y: 392 }, 3.4);

  b.stage('the palm bands');
  const wave = (y: number) => b.line(Array.from({ length: 9 }, (_, i) => ({ x: 168 + i * 20.5, y: y + (i % 2 ? 5 : -5) })));
  wave(296);
  for (let i = 0; i < 7; i++) b.dot({ x: 170 + i * 27, y: 311 }, 2.6);
  if (density >= 2) wave(462);
  if (density >= 3) for (let i = 0; i < 6; i++) b.dot({ x: 183 + i * 27, y: 450 }, 2.4);

  b.stage('the fingers');
  FINGER_X.forEach((cx, finger) => {
    b.dot({ x: cx, y: FINGER_TOP[finger] + 12 }, 3.2);
    const rows = 2 + density;
    for (let r = 0; r < rows; r++) {
      const y = FINGER_TOP[finger] + 34 + r * 27;
      if (y > FINGER_BASE - 14) break;
      if (r % 2 === 0) b.petal(diamond({ x: cx, y }, 8.5, 11), true);
      else [-10, 0, 10].forEach(dx => b.dot({ x: cx + dx, y }, 2.6));
    }
  });
  for (let i = 0; i < Math.min(2 + density, 4); i++) b.petal(diamond(thumbPoint(36 + i * 32), 8, 10), i % 2 === 0);

  b.stage('the wrist');
  wristBands(b, density);
};

const bridal = (b: Builder, density: number) => {
  const vine: Pt[] = [{ x: 221, y: 92 }, { x: 222, y: 142 }, { x: 220, y: 196 }, { x: 222, y: 248 }, { x: 232, y: 296 }, { x: 262, y: 338 }, { x: 240, y: 390 }, { x: 266, y: 440 }, { x: 250, y: 486 }];

  b.stage('the vine');
  b.line(vine);

  b.stage('the leaves');
  vine.forEach((p, k) => {
    if (k === 0 || k === vine.length - 1) return;
    const up = Math.atan2(vine[k - 1].y - vine[k + 1].y, vine[k - 1].x - vine[k + 1].x);
    // Along the finger the leaves are small, so they stay on it.
    const onFinger = p.y < 275;
    b.petal(leaf(p, up + (k % 2 ? -0.85 : 0.85), onFinger ? 16 : 30, onFinger ? 5 : 9), true);
    if (density >= 2 && !onFinger) b.petal(leaf(p, up + (k % 2 ? 0.95 : -0.95), 20, 6.5), false);
  });
  b.dot({ x: 221, y: 82 }, 3.4);

  b.stage('the paisleys');
  b.line(paisley({ x: 196, y: 452 }, -1.85, 92, 38), { closed: true });
  b.line(paisley({ x: 304, y: 452 }, Math.PI + 1.85, 92, -38), { closed: true });
  if (density >= 2) {
    b.petal(paisley({ x: 196, y: 440 }, -1.85, 50, 21), true);
    b.petal(paisley({ x: 304, y: 440 }, Math.PI + 1.85, 50, -21), true);
  }

  b.stage('the lattice on the fingers');
  [0, 2, 3].forEach(i => {
    const cx = FINGER_X[i];
    const rows = 1 + density;
    for (let r = 0; r < rows; r++) {
      const y = FINGER_TOP[i] + 28 + r * 30;
      if (y + 24 > FINGER_BASE - 6) break;
      b.line([{ x: cx - 14, y }, { x: cx + 14, y: y + 24 }]);
      b.line([{ x: cx + 14, y }, { x: cx - 14, y: y + 24 }]);
    }
    b.dot({ x: cx, y: FINGER_TOP[i] + 12 }, 3);
  });
  for (let i = 0; i < Math.min(2 + density, 4); i++) b.dot(thumbPoint(40 + i * 32), 3);

  b.stage('the dots');
  const spots: Pt[] = [{ x: 188, y: 325 }, { x: 312, y: 318 }, { x: 196, y: 372 }, { x: 304, y: 380 }, { x: 292, y: 420 }, { x: 208, y: 420 }, { x: 180, y: 300 }, { x: 322, y: 296 }, { x: 330, y: 350 }];
  spots.slice(0, 3 + 3 * density).forEach(p => b.dot(p, 2.8));

  b.stage('the wrist');
  wristBands(b, density);
};

// ---------------------------------------------------------------- design

interface MehendiOptions {
  layout: MehendiLayout;
  density: number;
  side: HandSide;
  colors: readonly string[];
  background: string;
}

export const makeMehendi = ({ layout, density, side, colors, background }: MehendiOptions): MehendiDesign => {
  const d = clampDensity(density);
  const builder = new Builder(side);
  if (layout === 'mandala') mandala(builder, d);
  else if (layout === 'fingers') fingers(builder, d);
  else bridal(builder, d);
  return { layout, density: d, side, strokes: builder.strokes, groups: builder.groups, skin: background, ink: colors[0] };
};

/** The skin tone, then the henna. */
export const mehendiColours = (d: MehendiDesign) => [d.skin, d.ink];

/** The waypoints of every stroke, for the small guide marks. */
export const mehendiGuidePoints = (d: MehendiDesign): Pt[] => d.strokes.flatMap(s => (s.kind === 'dot' ? [] : s.points));

const LINE = 3.2;

export const mehendiToSvg = (d: MehendiDesign, size = 540, { guide = false }: { guide?: boolean } = {}) => {
  const body = d.strokes.map(s => {
    if (s.kind === 'dot') return `<circle cx="${f(s.points[0].x)}" cy="${f(s.points[0].y)}" r="${dotRadius(s)}" fill="${d.ink}"/>`;
    return `<path d="${strokePath(s)}" fill="${s.filled ? d.ink : 'none'}" stroke="${d.ink}" stroke-width="${s.kind === 'petal' ? LINE * 0.8 : LINE}" stroke-linecap="round" stroke-linejoin="round"/>`;
  }).join('');
  const marks = guide ? `<g fill="#FFFFFF" stroke="${d.ink}" stroke-width="0.8">${mehendiGuidePoints(d).map(p => `<circle cx="${f(p.x)}" cy="${f(p.y)}" r="1.9"/>`).join('')}</g>` : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${MEHENDI_VIEWBOX}" width="${size}" height="${size}"><rect x="-20" width="540" height="${MEHENDI_HEIGHT}" fill="${mehendiSurround(d.skin)}"/>${handSvg(d.skin, d.side)}${body}${marks}</svg>`;
};

export const MEHENDI_LINE_WIDTH = LINE;
