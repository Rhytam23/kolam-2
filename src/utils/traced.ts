import type { ColourLayer, PaletteEntry } from '../types/kolam';

export interface TracedArt {
  layers: ColourLayer[];
  palette: PaletteEntry[];
  width: number;
  height: number;
}

const TRACE_WIDTH = 1000;

export const tracedSize = (t: TracedArt) => ({ w: TRACE_WIDTH, h: Math.round((TRACE_WIDTH * t.height) / t.width) });

export const tracedBackground = (t: TracedArt) => t.palette.find(p => p.background)?.hex ?? '#FFF8EE';

/** Layers are traced in 0–1 coordinates; this scales them to a TRACE_WIDTH-wide picture. */
export const layerTransform = (t: TracedArt) => {
  const { w, h } = tracedSize(t);
  return `scale(${w} ${h})`;
};

export interface Anchor { x: number; y: number; corner: boolean; /** the line from here to the next anchor is straight */ straight: boolean }

/** The anchor points of every closed outline in a traced path (M x y, then L x y or C c1 c2 end, then Z). */
export const pathAnchors = (path: string): Anchor[][] => {
  type Pt = { x: number; y: number };
  const loops: Anchor[][] = [];
  for (const m of path.matchAll(/M([^MZ]*)Z?/g)) {
    const body = m[0].replace(/[MZ]/g, '');
    const parts = body.split(/(?=[LC])/);
    const first = parts[0].trim().split(/\s+/).map(Number);
    const start: Pt = { x: first[0], y: first[1] };
    // For each anchor: the direction the curve arrives with and leaves with.
    const anchors: Array<{ p: Pt; arrive?: Pt; leave?: Pt; straight?: boolean }> = [{ p: start }];
    for (const part of parts.slice(1)) {
      const cmd = part[0];
      const nums = part.slice(1).trim().split(/\s+/).filter(Boolean).map(Number);
      const step = cmd === 'C' ? 6 : 2;
      for (let i = 0; i + step <= nums.length; i += step) {
        const prev = anchors[anchors.length - 1];
        const end = { x: nums[i + step - 2], y: nums[i + step - 1] };
        const c1 = cmd === 'C' ? { x: nums[i], y: nums[i + 1] } : end;
        const c2 = cmd === 'C' ? { x: nums[i + 2], y: nums[i + 3] } : prev.p;
        // A handle sitting on its own anchor has no direction; fall back to the chord.
        const dir = (to: Pt, from: Pt, alt: Pt) => (Math.hypot(to.x - from.x, to.y - from.y) > 1e-9 ? { x: to.x - from.x, y: to.y - from.y } : alt);
        const chord = { x: end.x - prev.p.x, y: end.y - prev.p.y };
        prev.leave = dir(c1, prev.p, chord);
        // Handles lying along the chord make a straight line, however it was written.
        const len = Math.hypot(chord.x, chord.y) || 1;
        const off = (q: Pt) => Math.abs((q.x - prev.p.x) * chord.y - (q.y - prev.p.y) * chord.x) / len;
        prev.straight = cmd === 'L' || (off(c1) < 1e-4 && off(c2) < 1e-4);
        anchors.push({ p: end, arrive: dir(end, c2, chord) });
      }
    }
    // A closed curve ends where it began: merge the last anchor into the first.
    const last = anchors[anchors.length - 1];
    if (anchors.length > 1 && last.p.x === start.x && last.p.y === start.y) {
      anchors[0].arrive = last.arrive;
      anchors.pop();
    }
    // Z closes a loop with a straight line back to the start.
    if (anchors.length > 1 && anchors[anchors.length - 1].straight === undefined) anchors[anchors.length - 1].straight = true;
    loops.push(anchors.map(a => {
      let corner = false;
      if (a.arrive && a.leave) {
        const a1 = Math.atan2(a.arrive.y, a.arrive.x), a2 = Math.atan2(a.leave.y, a.leave.x);
        corner = Math.abs(Math.atan2(Math.sin(a2 - a1), Math.cos(a2 - a1))) > 0.6; // sharper than about 35 degrees
      }
      return { x: a.p.x, y: a.p.y, corner, straight: !!a.straight };
    }));
  }
  return loops;
};

/**
 * Guide dots for copying a free-hand design, in TRACE units. They sit on the design's real structure:
 * every sharp corner is a dot, and curves get one only often enough to follow them, so a person puts
 * down a few meaningful marks and joins them with curves instead of marking an arbitrary even grid.
 */
export const tracedDots = (t: TracedArt, maxDots = 220): Array<{ x: number; y: number }> => {
  const { w, h } = tracedSize(t);
  const loops = t.layers.flatMap(layer => pathAnchors(layer.path)).map(loop => loop.map(a => ({ ...a, x: a.x * w, y: a.y * h })));
  const perimeter = (pts: Anchor[]) =>
    pts.reduce((sum, p, i) => sum + Math.hypot(pts[(i + 1) % pts.length].x - p.x, pts[(i + 1) % pts.length].y - p.y), 0);
  const total = loops.reduce((sum, l) => sum + perimeter(l), 0);
  const spacing = Math.max(w * 0.03, total / maxDots);

  const dots: Array<{ x: number; y: number }> = [];
  for (const loop of loops) {
    if (loop.length < 3 || perimeter(loop) < spacing) continue;
    let last: Anchor | null = null;
    const along = (from: Anchor, to: Anchor) => {
      // Long straight runs get evenly spaced dots too, so a ruler-straight line can be laid by eye.
      const gap = Math.hypot(to.x - from.x, to.y - from.y);
      for (let d = spacing; d < gap - spacing * 0.5; d += spacing) {
        dots.push({ x: from.x + ((to.x - from.x) * d) / gap, y: from.y + ((to.y - from.y) * d) / gap });
      }
    };
    loop.forEach((a, i) => {
      if (last && !a.corner && Math.hypot(a.x - last.x, a.y - last.y) < spacing) return;
      if (last && a.corner && Math.hypot(a.x - last.x, a.y - last.y) < spacing * 0.35) return;
      if (last && loop[i - 1]?.straight && last === loop[i - 1]) along(last, a);
      dots.push({ x: a.x, y: a.y });
      last = a;
    });
    if (last && loop[loop.length - 1].straight && last === loop[loop.length - 1]) along(last, loop[0]);
  }
  return dots;
};

export interface TracedStroke {
  /** Guide dots on this outline, in drawing order; the first is repeated at the end (the outline closes). */
  dots: Array<{ x: number; y: number }>;
  /** pieces[i] is the true curve (or straight line) from dots[i] to dots[i + 1], in TRACE units. */
  pieces: string[];
  /** The whole outline, in TRACE units. */
  path: string;
  /** The index of the colour layer this outline belongs to. */
  layer: number;
}

/**
 * The outlines of a traced design as strokes to draw: each outline is walked from the anchor nearest
 * the centre of the picture, with guide dots only where the line needs them (corners, and often
 * enough along curves and long straight runs), and the real curve between each pair of dots.
 */
export const tracedStrokes = (t: TracedArt, maxDots = 220): TracedStroke[] => {
  const { w, h } = tracedSize(t);
  const loops: Array<{ layer: number; anchors: Anchor[]; segs: string[] }> = [];
  t.layers.forEach((layer, li) => {
    for (const m of layer.path.matchAll(/M([^MZ]*)Z?/g)) {
      const anchors = pathAnchors(m[0])[0];
      if (!anchors || anchors.length < 3) continue;
      // One drawing command per anchor-to-next-anchor piece, scaled to TRACE units.
      const body = m[0].replace(/[MZ]/g, '');
      const parts = body.split(/(?=[LC])/);
      const nums = (str: string) => str.replace(/[LC]/g, ' ').trim().split(/\s+/).filter(Boolean).map(Number);
      const first = nums(parts[0]);
      let at = { x: first[0] * w, y: first[1] * h };
      const segs: string[] = [];
      for (const part of parts.slice(1)) {
        const n = nums(part);
        const step = part[0] === 'C' ? 6 : 2;
        for (let i = 0; i + step <= n.length; i += step) {
          const pts = Array.from({ length: step / 2 }, (_, k) => ({ x: n[i + 2 * k] * w, y: n[i + 2 * k + 1] * h }));
          segs.push(`M${at.x.toFixed(1)} ${at.y.toFixed(1)}${part[0]}${pts.map(p => `${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ')}`);
          at = pts[pts.length - 1];
        }
      }
      // The closing line back to the start, when the outline was not already closed by a curve.
      if (segs.length < anchors.length) segs.push(`M${at.x.toFixed(1)} ${at.y.toFixed(1)}L${(first[0] * w).toFixed(1)} ${(first[1] * h).toFixed(1)}`);
      loops.push({ layer: li, anchors: anchors.map(a => ({ ...a, x: a.x * w, y: a.y * h })), segs });
    }
  });
  const perimeter = (pts: Anchor[]) =>
    pts.reduce((sum, p, i) => sum + Math.hypot(pts[(i + 1) % pts.length].x - p.x, pts[(i + 1) % pts.length].y - p.y), 0);
  const total = loops.reduce((sum, l) => sum + perimeter(l.anchors), 0);
  const spacing = Math.max(w * 0.03, total / maxDots);

  const strokes: TracedStroke[] = [];
  for (const { layer, anchors, segs } of loops) {
    if (perimeter(anchors) < spacing) continue;
    // Start at the anchor nearest the middle of the picture, so drawing works outwards from the centre.
    const start = anchors.reduce((best, a, i) => (Math.hypot(a.x - w / 2, a.y - h / 2) < Math.hypot(anchors[best].x - w / 2, anchors[best].y - h / 2) ? i : best), 0);
    const n = anchors.length;
    const order = Array.from({ length: n }, (_, i) => (start + i) % n);
    // Keep an anchor as a guide dot when it is a corner, or far enough from the last kept dot.
    const kept: number[] = [order[0]];
    for (const i of order.slice(1)) {
      const last = anchors[kept[kept.length - 1]];
      const gap = Math.hypot(anchors[i].x - last.x, anchors[i].y - last.y);
      if (gap >= spacing || (anchors[i].corner && gap >= spacing * 0.35)) kept.push(i);
    }
    if (kept.length < 3) continue;
    const dots = kept.map(i => ({ x: anchors[i].x, y: anchors[i].y }));
    const pieces = kept.map((from, k) => {
      const to = kept[(k + 1) % kept.length];
      const run: string[] = [];
      for (let i = from; i !== to; i = (i + 1) % n) run.push(segs[i]);
      // Join the pieces of one run into a single path: keep the first M, and drop the later ones.
      return run.map((seg, j) => (j === 0 ? seg : seg.replace(/^M[^LC]*/, ''))).join('');
    });
    strokes.push({ dots: [...dots, dots[0]], pieces, path: segs.map((seg, j) => (j === 0 ? seg : seg.replace(/^M[^LC]*/, ''))).join('') + 'Z', layer });
  }
  return strokes;
};

export const tracedToSvg = (t: TracedArt, { dots = false, dotColour = '#3B2416' } = {}) => {
  const { w, h } = tracedSize(t);
  const layers = t.layers
    .map(l => `<path d="${l.path}" fill="${l.color}" fill-rule="evenodd"/>`)
    .join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">`
    + `<rect width="${w}" height="${h}" fill="${tracedBackground(t)}"/>`
    + `<g transform="${layerTransform(t)}">${layers}</g>`
    + (dots ? `<g fill="${dotColour}">${tracedDots(t).map(p => `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="${(w * 0.005).toFixed(1)}"/>`).join('')}</g>` : '')
    + '</svg>';
};
