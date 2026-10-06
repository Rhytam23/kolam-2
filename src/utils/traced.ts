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

export interface Anchor { x: number; y: number; corner: boolean }

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
    const anchors: Array<{ p: Pt; arrive?: Pt; leave?: Pt }> = [{ p: start }];
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
        anchors.push({ p: end, arrive: dir(end, c2, chord) });
      }
    }
    // A closed curve ends where it began: merge the last anchor into the first.
    const last = anchors[anchors.length - 1];
    if (anchors.length > 1 && last.p.x === start.x && last.p.y === start.y) {
      anchors[0].arrive = last.arrive;
      anchors.pop();
    }
    loops.push(anchors.map(a => {
      let corner = false;
      if (a.arrive && a.leave) {
        const a1 = Math.atan2(a.arrive.y, a.arrive.x), a2 = Math.atan2(a.leave.y, a.leave.x);
        corner = Math.abs(Math.atan2(Math.sin(a2 - a1), Math.cos(a2 - a1))) > 0.6; // sharper than about 35 degrees
      }
      return { x: a.p.x, y: a.p.y, corner };
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
    for (const a of loop) {
      if (last && !a.corner && Math.hypot(a.x - last.x, a.y - last.y) < spacing) continue;
      if (last && a.corner && Math.hypot(a.x - last.x, a.y - last.y) < spacing * 0.35) continue;
      dots.push({ x: a.x, y: a.y });
      last = a;
    }
  }
  return dots;
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
