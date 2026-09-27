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

/**
 * Guide dots spaced evenly along every traced outline, in TRACE units: the dots a person puts down
 * first when copying a free-hand design, before joining them into lines.
 */
export const tracedDots = (t: TracedArt, maxDots = 360): Array<{ x: number; y: number }> => {
  const { w, h } = tracedSize(t);
  const polygons = t.layers.flatMap(layer => layer.path.split('M').filter(Boolean).map(part => {
    const nums = part.replace(/[LZ]/g, ' ').trim().split(/\s+/).map(Number);
    const pts: Array<{ x: number; y: number }> = [];
    for (let i = 0; i + 1 < nums.length; i += 2) pts.push({ x: nums[i] * w, y: nums[i + 1] * h });
    return pts;
  }));
  const perimeter = (pts: Array<{ x: number; y: number }>) =>
    pts.reduce((sum, p, i) => sum + Math.hypot(pts[(i + 1) % pts.length].x - p.x, pts[(i + 1) % pts.length].y - p.y), 0);
  const total = polygons.reduce((sum, p) => sum + perimeter(p), 0);
  const spacing = Math.max(w * 0.03, total / maxDots);

  const dots: Array<{ x: number; y: number }> = [];
  for (const pts of polygons) {
    if (pts.length < 3 || perimeter(pts) < spacing) continue;
    let carry = 0;
    pts.forEach((a, i) => {
      const b = pts[(i + 1) % pts.length];
      const len = Math.hypot(b.x - a.x, b.y - a.y);
      for (let d = carry; d < len; d += spacing) dots.push({ x: a.x + ((b.x - a.x) * d) / len, y: a.y + ((b.y - a.y) * d) / len });
      carry = (carry - len) % spacing;
      if (carry < 0) carry += spacing;
    });
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
