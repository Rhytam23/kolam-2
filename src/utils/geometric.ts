import type { Point } from '../types/kolam';

/*
 * Straight-line floor designs: muggulu stars, Aipan chowkis, Chittara bands, Chowk Purana squares
 * and Mandana. The dots are laid out in a square grid first; every line then runs straight from dot
 * to dot, and the shapes it makes are filled with colour at the end. A design is the dot grid plus
 * polygons whose corners are dots.
 */

export type GeometricPattern = 'star' | 'chowki' | 'bands' | 'chowk' | 'mandana';

export const GEOMETRIC_PATTERNS: Record<GeometricPattern, { label: string; hint: string }> = {
  star: { label: 'Star', hint: 'A square and a diamond laid over each other make an eight-pointed star, nested inwards, as in many muggulu.' },
  chowki: { label: 'Chowki', hint: 'Squares and diamonds nested inside each other, with rows of dots between the lines, as in Aipan.' },
  bands: { label: 'Bands', hint: 'Rows of triangles and diamonds in bands, as in Chittara.' },
  chowk: { label: 'Chowk', hint: 'A square filled with triangles round a central star, as in Chowk Purana.' },
  mandana: { label: 'Mandana', hint: 'A saw-tooth border round a star, as in Mandana.' },
};

export interface GeometricShape {
  /** Corners, as indexes into the design's dots, in drawing order. */
  corners: number[];
  fill: string | null;
  /** Shapes are drawn group by group; see GeometricDesign.groups. */
  group: number;
}

export interface GeometricDesign {
  pattern: GeometricPattern;
  /** Dots per side of the square grid. */
  size: number;
  /** Grid positions, row by row: dot (i, j) is at index j * size + i. */
  dots: Point[];
  shapes: GeometricShape[];
  /** What is drawn in each group, as an instruction, e.g. "the outer square". */
  groups: string[];
  background: string;
  line: string;
}

export interface GeometricOptions {
  pattern: GeometricPattern;
  size: number;
  /** The line colour first, then the fill colours. */
  colors: readonly string[];
  background: string;
}

/** Sizes each pattern can be drawn at: odd, and for a chowk one more than a multiple of four. */
export const geometricSize = (pattern: GeometricPattern, size: number) => {
  const odd = Math.max(pattern === 'mandana' || pattern === 'bands' ? 7 : 5, Math.min(13, size % 2 ? size : size + 1));
  return pattern === 'chowk' ? Math.max(5, Math.min(13, Math.round((odd - 1) / 4) * 4 + 1)) : odd;
};

export const makeGeometric = ({ pattern, size: wanted, colors, background }: GeometricOptions): GeometricDesign => {
  const n = geometricSize(pattern, wanted);
  const c = (n - 1) / 2;
  const line = colors[0];
  const fills = colors.length > 1 ? colors.slice(1) : [line];
  const fill = (k: number) => fills[k % fills.length];
  const dots: Point[] = [];
  for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) dots.push({ x: i, y: j });
  const at = (i: number, j: number) => j * n + i;
  const shapes: GeometricShape[] = [];
  const groups: string[] = [];
  const group = (title: string) => groups.push(title) - 1;
  const add = (g: number, corners: Array<[number, number]>, colour: string | null) => shapes.push({ corners: corners.map(([i, j]) => at(i, j)), fill: colour, group: g });
  // The square of an eight-pointed star: small enough for the diamond's points to show past it.
  const starSquare = (r: number) => Math.min(r - 1, Math.max(1, Math.round(r * 0.7)));
  const square = (h: number): Array<[number, number]> => [[c - h, c - h], [c + h, c - h], [c + h, c + h], [c - h, c + h]];
  const diamond = (r: number): Array<[number, number]> => [[c, c - r], [c + r, c], [c, c + r], [c - r, c]];

  if (pattern === 'star') {
    // Nested eight-pointed stars: a square with a larger diamond over it, then the same again inside.
    let r = c;
    let k = 0;
    while (r >= 2) {
      const h = starSquare(r);
      if (h >= 1) {
        const g = group(k === 0 ? 'the square, then the diamond over it, to make the outer star' : 'the next star inside, square first, then diamond');
        add(g, square(h), fill(2 * k));
        add(g, diamond(r), fill(2 * k + 1));
      } else {
        add(group('a diamond in the middle'), diamond(r), fill(2 * k));
      }
      r = h - 1;
      k++;
    }
    if (r === 1) add(group('a small diamond round the centre dot'), diamond(1), fill(2 * k));
  } else if (pattern === 'chowki') {
    // Squares and diamonds, each drawn through the corners of the one outside it.
    let h = c;
    let k = 0;
    while (h >= 1) {
      add(group(k === 0 ? 'the outer square' : 'the next square'), square(h), k === 0 ? null : null);
      add(group('a diamond touching the middle of each side'), diamond(h), null);
      h = Math.floor(h / 2);
      k++;
    }
    // The centre is filled, as the seat (chowki) of the design.
    shapes[shapes.length - 1].fill = fill(0);
  } else if (pattern === 'bands') {
    add(group('the outer frame'), square(c), null);
    // Bands from the middle outwards, mirrored: diamonds across three rows, triangles across two.
    const bands: Array<{ kind: 'diamonds' | 'triangles'; top: number }> = [];
    let above = c - 1;
    let below = c + 1;
    bands.push({ kind: 'diamonds', top: c - 1 });
    let k = 0;
    while (above > 0) {
      const kind = k % 2 === 0 ? 'triangles' : 'diamonds';
      const rows = Math.min(kind === 'diamonds' ? 2 : 1, above);
      const use = rows === 2 ? 'diamonds' : 'triangles';
      bands.push({ kind: use, top: above - rows }, { kind: use, top: below });
      above -= rows;
      below += rows;
      k++;
    }
    bands.forEach((band, b) => {
      const g = group(band.kind === 'diamonds' ? 'a band of diamonds' : 'a band of triangles');
      const { top } = band;
      if (band.kind === 'diamonds') {
        for (let i = 0; i + 2 <= n - 1; i += 2) add(g, [[i + 1, top], [i + 2, top + 1], [i + 1, top + 2], [i, top + 1]], fill(b % 2 === 0 ? 2 : 0));
      } else {
        // Triangles point towards the middle of the design.
        const up = top >= c;
        for (let i = 0; i + 2 <= n - 1; i += 2) {
          add(g, up ? [[i, top + 1], [i + 1, top], [i + 2, top + 1]] : [[i, top], [i + 2, top], [i + 1, top + 1]], fill(i % 4 === 0 ? 0 : 1));
        }
      }
    });
  } else if (pattern === 'chowk') {
    // The square (chowk), its corner triangles, a diamond, an inner square and a star at the heart.
    const h = c / 2;
    const g1 = group('the square of the chowk');
    add(g1, square(c), null);
    const g2 = group('a triangle in each corner, meeting at the middle of each side');
    add(g2, [[0, 0], [c, 0], [0, c]], fill(0));
    add(g2, [[n - 1, 0], [n - 1, c], [c, 0]], fill(0));
    add(g2, [[n - 1, n - 1], [c, n - 1], [n - 1, c]], fill(0));
    add(g2, [[0, n - 1], [0, c], [c, n - 1]], fill(0));
    const g3 = group('the inner square, with a triangle between it and each side of the diamond');
    add(g3, [[c, 0], [c + h, c - h], [c - h, c - h]], fill(1));
    add(g3, [[n - 1, c], [c + h, c + h], [c + h, c - h]], fill(1));
    add(g3, [[c, n - 1], [c - h, c + h], [c + h, c + h]], fill(1));
    add(g3, [[0, c], [c - h, c - h], [c - h, c + h]], fill(1));
    add(g3, square(h), fill(2));
    if (h >= 2) add(group('a diamond at the heart'), diamond(h), fill(0));
    else add(group('a small diamond at the heart'), diamond(1), fill(0));
  } else {
    // Mandana: a frame with a saw-tooth border of triangles, round a star.
    const g1 = group('the frame');
    add(g1, square(c), null);
    const g2 = group('the saw-tooth border, one triangle after another along each side');
    for (let i = 0; i + 2 <= n - 1; i += 2) {
      add(g2, [[i, 0], [i + 2, 0], [i + 1, 1]], fill(0));
      add(g2, [[n - 1, i], [n - 1, i + 2], [n - 2, i + 1]], fill(0));
      add(g2, [[i + 2, n - 1], [i, n - 1], [i + 1, n - 2]], fill(0));
      add(g2, [[0, i + 2], [0, i], [1, i + 1]], fill(0));
    }
    const r = c - 1;
    const hs = starSquare(r);
    const g3 = group('the star: a square, then a diamond over it');
    add(g3, square(hs), fill(1));
    add(g3, diamond(r), fill(2));
    if (hs - 1 >= 1) add(group('a diamond in the middle'), diamond(hs - 1), fill(1));
  }
  return { pattern, size: n, dots, shapes, groups, background, line };
};

// ---------------------------------------------------------------- drawing

const fmt = (v: number) => String(Math.round(v * 100) / 100);

/** Every dot a straight line from dot a to dot b passes through, in order (including both ends). */
export const dotsAlong = (d: GeometricDesign, a: number, b: number): number[] => {
  const [pa, pb] = [d.dots[a], d.dots[b]];
  const dx = pb.x - pa.x;
  const dy = pb.y - pa.y;
  const gcd = (x: number, y: number): number => (y === 0 ? x : gcd(y, x % y));
  const steps = gcd(Math.abs(dx), Math.abs(dy)) || 1;
  return Array.from({ length: steps + 1 }, (_, k) => (pa.y + (dy * k) / steps) * d.size + pa.x + (dx * k) / steps);
};

/** A shape's outline as it is drawn: through every dot on its edges, back to where it began. */
export const outlineDots = (d: GeometricDesign, shape: GeometricShape) => {
  const out: number[] = [shape.corners[0]];
  shape.corners.forEach((corner, k) => {
    const next = shape.corners[(k + 1) % shape.corners.length];
    out.push(...dotsAlong(d, corner, next).slice(1));
  });
  return out;
};

export const geometricPoint = (d: GeometricDesign, index: number, unit: number, pad = 1) =>
  ({ x: (pad + d.dots[index].x) * unit, y: (pad + d.dots[index].y) * unit });

export const shapePath = (d: GeometricDesign, shape: GeometricShape, unit: number, pad = 1) =>
  `${shape.corners.map((corner, k) => { const p = geometricPoint(d, corner, unit, pad); return `${k ? 'L' : 'M'}${fmt(p.x)} ${fmt(p.y)}`; }).join('')}Z`;

export const geometricColours = (d: GeometricDesign) =>
  [...new Set([d.background, d.line, ...d.shapes.map(s => s.fill).filter((f): f is string => !!f)])];

export const geometricToSvg = (d: GeometricDesign, { unit = 40, dots = true, dotColour }: { unit?: number; dots?: boolean; dotColour?: string } = {}) => {
  const side = (d.size + 1) * unit;
  const shapes = d.shapes.map(s => `<path d="${shapePath(d, s, unit)}" fill="${s.fill ?? 'none'}" stroke="${d.line}" stroke-width="${fmt(unit * 0.06)}" stroke-linejoin="round"/>`).join('');
  const points = dots
    ? `<g fill="${dotColour ?? d.line}">${d.dots.map((_, i) => { const p = geometricPoint(d, i, unit); return `<circle cx="${fmt(p.x)}" cy="${fmt(p.y)}" r="${fmt(unit * 0.07)}"/>`; }).join('')}</g>`
    : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${side} ${side}" width="${side}" height="${side}"><rect width="100%" height="100%" fill="${d.background}"/>${shapes}${points}</svg>`;
};
