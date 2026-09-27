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

export const tracedToSvg = (t: TracedArt) => {
  const { w, h } = tracedSize(t);
  const layers = t.layers
    .map(l => `<path d="${l.path}" fill="${l.color}" fill-rule="evenodd"/>`)
    .join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">`
    + `<rect width="${w}" height="${h}" fill="${tracedBackground(t)}"/>`
    + `<g transform="${layerTransform(t)}">${layers}</g></svg>`;
};
