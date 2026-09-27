import { designToSvg } from '../utils/kolamLogic';
import { guideDotColour, radialColours, radialToSvg } from '../utils/radial';
import { tracedBackground, tracedToSvg } from '../utils/traced';
import { geometricColours, geometricToSvg } from '../utils/geometric';
import { isDark } from './colours';
import type { useKolam } from '../components/KolamContext';

type Kolam = ReturnType<typeof useKolam>;

export const kolamDotColour = (background: string) => (isDark(background) ? '#F7F3EA' : '#3B2416');

/** The picture the studio currently shows, as a standalone SVG string. Dot kolams always show their pulli. */
export const artworkSvg = (k: Kolam, { dots = false } = {}) => {
  if (k.mode === 'radial') return radialToSvg(k.radial, 480, { dots });
  // Dots stay part of a straight-line design: the lines run through them.
  if (k.mode === 'geometric') return geometricToSvg(k.geometric, { dots: true, dotColour: guideDotColour(k.geometric.background) });
  if (k.mode === 'traced' && k.traced) return tracedToSvg(k.traced, { dots, dotColour: guideDotColour(tracedBackground(k.traced)) });
  const { background, colors } = k.kolamColours;
  return designToSvg(k.design, { background, stroke: colors, dot: kolamDotColour(background) });
};

/** Ground colour, drawing colours and (for photos) how much of the picture each covers. */
export const artworkColours = (k: Kolam): { background: string; colors: string[]; shares?: number[] } => {
  if (k.mode === 'radial') {
    const [background, ...colors] = radialColours(k.radial);
    return { background, colors };
  }
  if (k.mode === 'geometric') {
    const [background, ...colors] = geometricColours(k.geometric);
    return { background, colors };
  }
  if (k.mode === 'traced' && k.traced) {
    const drawn = k.traced.palette.filter(p => !p.background);
    return { background: tracedBackground(k.traced), colors: drawn.map(p => p.hex), shares: drawn.map(p => p.share) };
  }
  const colors = [...k.kolamColours.colors].slice(0, Math.max(1, Math.min(k.loops, k.kolamColours.colors.length)));
  return { background: k.kolamColours.background, colors };
};
