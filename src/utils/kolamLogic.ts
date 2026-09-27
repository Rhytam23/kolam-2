import type { Design, Lattice, Point } from '../types/kolam';

/*
 * Kolam engine based on the mirror-curve model (Gerdes, 1989).
 *
 * Coordinates are "doubled" so everything stays integral: dot (i, j) sits at (2i, 2j) and the
 * port between two neighbouring dots at the odd coordinate in between. A strand moves diagonally
 * from port to port around each dot, so every dot is enclosed by a diamond of four strand
 * segments. At each port the strand either crosses straight through ('x') or is reflected by a
 * mirror: 'p' turns it back around the dot it came from, 'j' sends it on around the neighbouring
 * dot. Ports facing the outside of the design always turn back.
 */

type Port = 'x' | 'p' | 'j' | 'b';

export interface LoopPoint {
  X: number;
  Y: number;
  inX: number;
  inY: number;
  outX: number;
  outY: number;
  state: Port;
}

// ---------------------------------------------------------------- construction

export const makeDesign = (rows: number, cols: number, occupied: (i: number, j: number) => boolean): Design => {
  const mask = Array.from({ length: rows }, (_, j) =>
    Array.from({ length: cols }, (_, i) => (occupied(i, j) ? '1' : '0')).join(''));
  const on = (i: number, j: number) => mask[j]?.[i] === '1';
  const h = Array.from({ length: rows }, (_, j) =>
    Array.from({ length: cols - 1 }, (_, i) => (on(i, j) && on(i + 1, j) ? 'x' : '.')).join(''));
  const v = Array.from({ length: rows - 1 }, (_, j) =>
    Array.from({ length: cols }, (_, i) => (on(i, j) && on(i, j + 1) ? 'x' : '.')).join(''));
  return { rows, cols, mask, h, v };
};

export const squareDesign = (n: number) => makeDesign(n, n, () => true);

/** Diamond arrangement such as 1-3-5-3-1 (always an odd size). */
export const diamondDesign = (n: number) => {
  const size = n % 2 ? n : n + 1;
  const c = (size - 1) / 2;
  return makeDesign(size, size, (i, j) => Math.abs(i - c) + Math.abs(j - c) <= c);
};

// ---------------------------------------------------------------- lookups

const isDot = (d: Design, i: number, j: number) =>
  j >= 0 && j < d.rows && i >= 0 && i < d.cols && d.mask[j][i] === '1';

/** State of the port at doubled coordinates (X, Y), or null if no dot touches it. */
const portAt = (d: Design, X: number, Y: number): Port | null => {
  const horizontal = (X & 1) === 1;
  const i = horizontal ? (X - 1) / 2 : X / 2;
  const j = horizontal ? Y / 2 : (Y - 1) / 2;
  const a = isDot(d, i, j);
  const b = horizontal ? isDot(d, i + 1, j) : isDot(d, i, j + 1);
  if (a && b) return (horizontal ? d.h[j][i] : d.v[j][i]) as Port;
  return a || b ? 'b' : null;
};

/** Mask value for a dot or state for a port, used to compare designs under symmetry. */
const cellAt = (d: Design, X: number, Y: number) =>
  (X & 1) === 0 && (Y & 1) === 0 ? (isDot(d, X / 2, Y / 2) ? '1' : '0') : portAt(d, X, Y) ?? '.';

const setPort = (d: Design, X: number, Y: number, state: string) => {
  const replace = (row: string, i: number) => row.slice(0, i) + state + row.slice(i + 1);
  if (X & 1) d.h[Y / 2] = replace(d.h[Y / 2], (X - 1) / 2);
  else d.v[(Y - 1) / 2] = replace(d.v[(Y - 1) / 2], X / 2);
};

const internalPorts = (d: Design): Array<[number, number]> => {
  const ports: Array<[number, number]> = [];
  d.h.forEach((row, j) => [...row].forEach((s, i) => s !== '.' && ports.push([2 * i + 1, 2 * j])));
  d.v.forEach((row, j) => [...row].forEach((s, i) => s !== '.' && ports.push([2 * i, 2 * j + 1])));
  return ports;
};

// ---------------------------------------------------------------- tracing

const reflect = (X: number, dx: number, dy: number, state: Port): [number, number] => {
  const horizontal = (X & 1) === 1;
  if (state === 'x') return [dx, dy];
  if (state === 'j') return horizontal ? [dx, -dy] : [-dx, dy];
  return horizontal ? [-dx, dy] : [dx, -dy];
};

/** Segment key from its midpoint in quadrupled coordinates (direction independent). */
const segmentKey = (mx: number, my: number) => (mx + 8) * 4096 + (my + 8);

const trace = (d: Design) => {
  const owner = new Map<number, number>();
  const loops: LoopPoint[][] = [];
  for (let j = 0; j < d.rows; j++) {
    for (let i = 0; i < d.cols; i++) {
      if (!isDot(d, i, j)) continue;
      const X = 2 * i;
      const Y = 2 * j;
      const sides: Array<[number, number, number, number]> = [
        [X, Y - 1, 1, 1], [X + 1, Y, -1, 1], [X, Y + 1, -1, -1], [X - 1, Y, 1, -1],
      ];
      for (const [sx, sy, sdx, sdy] of sides) {
        if (owner.has(segmentKey(2 * sx + sdx, 2 * sy + sdy))) continue;
        const loop: LoopPoint[] = [];
        let [x, y, dx, dy] = [sx, sy, sdx, sdy];
        while (!owner.has(segmentKey(2 * x + dx, 2 * y + dy))) {
          owner.set(segmentKey(2 * x + dx, 2 * y + dy), loops.length);
          const nx = x + dx;
          const ny = y + dy;
          const state = portAt(d, nx, ny) as Port;
          const [ox, oy] = reflect(nx, dx, dy, state);
          loop.push({ X: nx, Y: ny, inX: dx, inY: dy, outX: ox, outY: oy, state });
          [x, y, dx, dy] = [nx, ny, ox, oy];
        }
        loops.push(loop);
      }
    }
  }
  return { loops, owner };
};

export const traceLoops = (d: Design) => trace(d).loops;
export const countLoops = (d: Design) => trace(d).loops.length;

// ---------------------------------------------------------------- symmetry

export type SymmetryName = 'mirrorVertical' | 'mirrorHorizontal' | 'rotation180' | 'rotation90' | 'diagonal' | 'antiDiagonal';

const transforms = (d: Design): Array<[SymmetryName, (X: number, Y: number) => [number, number]]> => {
  const W = 2 * (d.cols - 1);
  const H = 2 * (d.rows - 1);
  const list: Array<[SymmetryName, (X: number, Y: number) => [number, number]]> = [
    ['mirrorVertical', (X, Y) => [W - X, Y]],
    ['mirrorHorizontal', (X, Y) => [X, H - Y]],
    ['rotation180', (X, Y) => [W - X, H - Y]],
  ];
  if (d.rows === d.cols) {
    list.push(
      ['rotation90', (X, Y) => [H - Y, X]],
      ['diagonal', (X, Y) => [Y, X]],
      ['antiDiagonal', (X, Y) => [H - Y, W - X]],
    );
  }
  return list;
};

export const symmetries = (d: Design): SymmetryName[] => {
  const cells: Array<[number, number]> = [];
  for (let Y = 0; Y <= 2 * (d.rows - 1); Y++) {
    for (let X = 0; X <= 2 * (d.cols - 1); X++) if ((X & 1) + (Y & 1) < 2) cells.push([X, Y]);
  }
  return transforms(d)
    .filter(([, t]) => cells.every(([X, Y]) => cellAt(d, X, Y) === cellAt(d, ...t(X, Y))))
    .map(([name]) => name);
};

// ---------------------------------------------------------------- single line (sikku)

const cloneDesign = (d: Design): Design => ({ ...d, mask: [...d.mask], h: [...d.h], v: [...d.v] });

/**
 * Turns crossings into mirrors until the design is drawn with one continuous line, the way a
 * sikku kolam is. Changing a crossing where two different loops meet always merges them. Whole
 * symmetry orbits are tried first so the result keeps the design's symmetry where possible.
 */
export const makeSingleLine = (input: Design): Design => {
  const d = cloneDesign(input);
  let { loops, owner } = trace(d);
  if (loops.length <= 1) return d;

  const kept = symmetries(d);
  const byName = new Map(transforms(d));
  const cx = d.cols - 1;
  const cy = d.rows - 1;
  const ports = internalPorts(d).sort((a, b) => Math.hypot(a[0] - cx, a[1] - cy) - Math.hypot(b[0] - cx, b[1] - cy));
  const joinsTwoLoops = ([X, Y]: [number, number]) =>
    portAt(d, X, Y) === 'x' && owner.get(segmentKey(2 * X - 1, 2 * Y - 1)) !== owner.get(segmentKey(2 * X - 1, 2 * Y + 1));
  const orbitOf = (port: [number, number], group: Array<(X: number, Y: number) => [number, number]>) => {
    const orbit = new Map([[port.join(','), port]]);
    for (const p of orbit.values()) {
      for (const t of group) {
        const q = t(...p);
        if (!orbit.has(q.join(','))) orbit.set(q.join(','), q);
      }
    }
    return [...orbit.values()];
  };

  // Largest symmetry group first, then smaller ones, then no symmetry at all.
  const groups = [kept, ['rotation90'], ['rotation180'], ['mirrorVertical'], ['mirrorHorizontal'], ['diagonal']]
    .filter(names => names.length && names.every(n => kept.includes(n as SymmetryName)))
    .map(names => names.map(n => byName.get(n as SymmetryName)!));

  for (const group of groups) {
    for (const port of ports) {
      if (loops.length === 1) break;
      if (!joinsTwoLoops(port)) continue;
      const orbit = orbitOf(port, group);
      if (orbit.some(([X, Y]) => portAt(d, X, Y) !== 'x')) continue;

      let best: { state: string; count: number } | null = null;
      for (const state of ['j', 'p']) {
        orbit.forEach(([X, Y]) => setPort(d, X, Y, state));
        const count = countLoops(d);
        if (count < loops.length && (!best || count < best.count)) best = { state, count };
        orbit.forEach(([X, Y]) => setPort(d, X, Y, 'x'));
      }
      if (best) {
        const state = best.state;
        orbit.forEach(([X, Y]) => setPort(d, X, Y, state));
        ({ loops, owner } = trace(d));
      }
    }
  }

  while (loops.length > 1) {
    const port = ports.find(joinsTwoLoops);
    if (!port) break; // the dots form separate islands
    setPort(d, port[0], port[1], 'j');
    ({ loops, owner } = trace(d));
  }
  return d;
};

// ---------------------------------------------------------------- rendering

const MIRROR_GAP = 0.13;
const BOUNDARY_BULGE = 0.06;
const fmt = (n: number) => String(Math.round(n * 100) / 100);

/** Where a strand passes a port, in lattice units, plus its direction there. */
const passPoint = (p: LoopPoint) => {
  const tx = p.inX + p.outX;
  const ty = p.inY + p.outY;
  const tl = Math.hypot(tx, ty);
  let x = p.X / 2;
  let y = p.Y / 2;
  if (p.state !== 'x') {
    const bx = p.inX - p.outX;
    const by = p.inY - p.outY;
    const bl = Math.hypot(bx, by);
    const offset = p.state === 'b' ? BOUNDARY_BULGE : -MIRROR_GAP;
    x += (bx / bl) * offset;
    y += (by / bl) * offset;
  }
  return { x, y, tx: tx / tl, ty: ty / tl };
};

/** One SVG path per loop; lattice point (i, j) maps to ((pad + i)·unit, (pad + j)·unit). */
export const loopPaths = (d: Design, unit = 1, pad = 0) => {
  const at = (v: number) => fmt((pad + v) * unit);
  return traceLoops(d).map(loop => {
    const pts = loop.map(passPoint);
    let path = `M${at(pts[0].x)} ${at(pts[0].y)}`;
    pts.forEach((a, k) => {
      const b = pts[(k + 1) % pts.length];
      const handle = 0.39 * Math.hypot(b.x - a.x, b.y - a.y);
      path += `C${at(a.x + a.tx * handle)} ${at(a.y + a.ty * handle)} ${at(b.x - b.tx * handle)} ${at(b.y - b.ty * handle)} ${at(b.x)} ${at(b.y)}`;
    });
    return `${path}Z`;
  });
};

export const designPath = (d: Design, unit = 1, pad = 0) => loopPaths(d, unit, pad).join('');

/** One bend of a line: the stretch that curves round a single dot. */
export interface Bend {
  dot: Point;
  path: string;
}

/**
 * Each line split into its bends, in drawing order. A line in a pulli kolam passes between the
 * dots, curving round one dot and then the next; drawing it by hand means following those bends.
 */
export const loopBends = (d: Design, unit = 1, pad = 0): Bend[][] => {
  const at = (v: number) => fmt((pad + v) * unit);
  return traceLoops(d).map(loop => {
    const pts = loop.map(passPoint);
    const n = loop.length;
    // The dot a segment curves round is the even-even corner between its two ports.
    const dotOf = (k: number) => {
      const a = loop[k];
      const b = loop[(k + 1) % n];
      const [X, Y] = (a.X & 1) === 0 && (b.Y & 1) === 0 ? [a.X, b.Y] : [b.X, a.Y];
      return { x: X / 2, y: Y / 2 };
    };
    const same = (p: Point, q: Point) => p.x === q.x && p.y === q.y;
    // Start at the beginning of a bend, so no bend is split across the end of the loop.
    let first = 0;
    while (first < n && n > 1 && same(dotOf((first + n - 1) % n), dotOf(first))) first++;
    if (first === n) first = 0;
    const bends: Bend[] = [];
    for (let i = 0; i < n; i++) {
      const k = (first + i) % n;
      const a = pts[k];
      const b = pts[(k + 1) % n];
      const handle = 0.39 * Math.hypot(b.x - a.x, b.y - a.y);
      const curve = `C${at(a.x + a.tx * handle)} ${at(a.y + a.ty * handle)} ${at(b.x - b.tx * handle)} ${at(b.y - b.ty * handle)} ${at(b.x)} ${at(b.y)}`;
      const dot = dotOf(k);
      const last = bends[bends.length - 1];
      if (last && same(last.dot, dot)) last.path += curve;
      else bends.push({ dot, path: `M${at(a.x)} ${at(a.y)}${curve}` });
    }
    return bends;
  });
};

export const designDots = (d: Design): Point[] => {
  const dots: Point[] = [];
  for (let j = 0; j < d.rows; j++) for (let i = 0; i < d.cols; i++) if (isDot(d, i, j)) dots.push({ x: i, y: j });
  return dots;
};

export interface SvgOptions {
  unit?: number;
  background?: string;
  /** One colour, or a list used loop by loop (as in coloured festival kolams). */
  stroke?: string | readonly string[];
  dot?: string;
}

export const designToSvg = (d: Design, { unit = 40, background, stroke = '#A63A1E', dot = '#3B2416' }: SvgOptions = {}) => {
  const pad = 1;
  const width = (d.cols - 1 + 2 * pad) * unit;
  const height = (d.rows - 1 + 2 * pad) * unit;
  const dots = designDots(d)
    .map(p => `<circle cx="${fmt((pad + p.x) * unit)}" cy="${fmt((pad + p.y) * unit)}" r="${fmt(unit * 0.08)}" fill="${dot}"/>`)
    .join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${fmt(width)} ${fmt(height)}" width="${fmt(width)}" height="${fmt(height)}">`
    + (background ? `<rect width="100%" height="100%" fill="${background}"/>` : '')
    + loopPaths(d, unit, pad)
      .map((path, k) => `<path d="${path}" fill="none" stroke="${typeof stroke === 'string' ? stroke : stroke[k % stroke.length]}" stroke-width="${fmt(unit * 0.07)}" stroke-linecap="round" stroke-linejoin="round"/>`)
      .join('')
    + dots
    + '</svg>';
};

// ---------------------------------------------------------------- principles

export const portCounts = (d: Design) => {
  const ports = d.h.join('') + d.v.join('');
  const count = (c: string) => ports.split(c).length - 1;
  return { crossings: count('x'), turns: count('p'), joins: count('j') };
};

export const rowPattern = (d: Design) => d.mask.map(row => [...row].filter(c => c === '1').length).join('-');

export const SYMMETRY_LABELS: Record<SymmetryName, string> = {
  mirrorVertical: 'Mirror (vertical axis)',
  mirrorHorizontal: 'Mirror (horizontal axis)',
  rotation180: '2-fold rotation',
  rotation90: '4-fold rotation',
  diagonal: 'Mirror (diagonal)',
  antiDiagonal: 'Mirror (anti-diagonal)',
};

// ---------------------------------------------------------------- lattice ↔ image

export const latticeToImage = (l: Lattice, i: number, j: number): Point => ({
  x: l.origin.x + i * l.u.x + j * l.v.x,
  y: l.origin.y + i * l.u.y + j * l.v.y,
});

export const imageToLattice = (l: Lattice, p: Point): Point => {
  const det = l.u.x * l.v.y - l.v.x * l.u.y;
  const dx = p.x - l.origin.x;
  const dy = p.y - l.origin.y;
  return { x: (dx * l.v.y - l.v.x * dy) / det, y: (l.u.x * dy - dx * l.u.y) / det };
};

export const snapToLattice = (l: Lattice, dots: Point[]): Point[] => {
  const seen = new Set<string>();
  return dots.flatMap(p => {
    const q = imageToLattice(l, p);
    const i = Math.round(q.x);
    const j = Math.round(q.y);
    if (seen.has(`${i},${j}`)) return [];
    seen.add(`${i},${j}`);
    return [latticeToImage(l, i, j)];
  });
};
