/*
 * Radial floor designs: rangoli, alpana, and the lotus centres of many kolams. A design is a set of
 * rings, each repeating one motif N times around the centre, so it has N-fold symmetry by construction.
 */

export type Motif = 'lotus' | 'leaf' | 'drop' | 'loop' | 'dot';
export type RadialStyle = 'lotus' | 'alpana' | 'marigold' | 'star';

export interface RadialRing {
  motif: Motif;
  count: number;
  inner: number;
  outer: number;
  /** Width of the motif relative to its length. */
  width: number;
  color: string;
  filled: boolean;
  /** Turn the ring by half a step so its motifs sit between the ones of the ring outside it. */
  offset: boolean;
}

export interface RadialDesign {
  rings: RadialRing[];
  centre: string;
  background: string;
  outline: string;
}

export const RADIAL_STYLES: Record<RadialStyle, { label: string; hint: string }> = {
  lotus: { label: 'Lotus', hint: 'Layers of filled lotus petals, as in many rangolis.' },
  alpana: { label: 'Alpana', hint: 'White outlined petals and dots, as painted with rice paste in Bengal.' },
  marigold: { label: 'Marigold', hint: 'Many small rounded petals, like a flower-petal rangoli (pookalam).' },
  star: { label: 'Star', hint: 'Pointed leaves with a ring of dots at the edge.' },
};

const MOTIFS: Record<RadialStyle, Motif[]> = {
  lotus: ['lotus', 'lotus', 'leaf', 'lotus'],
  alpana: ['loop', 'lotus', 'loop', 'lotus'],
  marigold: ['drop', 'drop', 'drop', 'drop'],
  star: ['leaf', 'leaf', 'lotus', 'leaf'],
};

export interface RadialOptions {
  petals: number;
  layers: number;
  style: RadialStyle;
  colors: readonly string[];
  background: string;
}

export const makeRadial = ({ petals, layers, style, colors, background }: RadialOptions): RadialDesign => {
  const rings: RadialRing[] = [];
  const band = 0.82 / layers;
  const outline = style === 'alpana' ? colors[0] : '#FFFFFF';
  if (style === 'star' || style === 'alpana') {
    rings.push({ motif: 'dot', count: petals * 2, inner: 0.94, outer: 1, width: 1, color: colors[0], filled: true, offset: false });
  }
  // How much of the space between neighbouring motifs each motif fills.
  const fullness = { lotus: 0.95, alpana: 0.75, marigold: 0.8, star: 0.8 }[style];
  for (let k = 0; k < layers; k++) {
    const outer = (style === 'star' || style === 'alpana' ? 0.9 : 1) - k * band;
    const inner = Math.max(0.12, outer - band * 1.6);
    const count = style === 'marigold' ? petals * (k === 0 ? 2 : 1) : petals;
    const gap = (2 * Math.PI * ((inner + outer) / 2)) / count;
    rings.push({
      motif: MOTIFS[style][k % 4],
      count,
      inner,
      outer,
      width: Math.min(0.9, (fullness * gap) / (outer - inner)),
      color: colors[(k + (style === 'alpana' ? 0 : 1)) % colors.length],
      filled: style !== 'alpana',
      offset: k % 2 === 1,
    });
  }
  return { rings, centre: colors[colors.length > 1 ? 1 : 0], background, outline };
};

// ---------------------------------------------------------------- geometry

type Segment = ['M' | 'L', number, number] | ['C', number, number, number, number, number, number] | ['Z'];

const K = 0.5523; // cubic Bézier handle for a quarter circle

/** One motif pointing along +x, from radius `a` to radius `b`, as Bézier segments. */
const motifSegments = (motif: Motif, a: number, b: number, widthRatio: number): Segment[] => {
  const len = b - a;
  const w = (len * widthRatio) / 2;
  const mid = (a + b) / 2;
  switch (motif) {
    case 'lotus':
      return [['M', a, 0], ['C', a + len * 0.25, w * 1.1, b - len * 0.3, w * 0.9, b, 0], ['C', b - len * 0.3, -w * 0.9, a + len * 0.25, -w * 1.1, a, 0], ['Z']];
    case 'leaf':
      return [['M', a, 0], ['C', a + len * 0.35, w * 1.3, b - len * 0.35, w * 1.3, b, 0], ['C', b - len * 0.35, -w * 1.3, a + len * 0.35, -w * 1.3, a, 0], ['Z']];
    case 'drop':
      return [['M', a, 0], ['C', a + len * 0.45, w * 0.3, b, w * 1.1, b, 0], ['C', b, -w * 1.1, a + len * 0.45, -w * 0.3, a, 0], ['Z']];
    case 'loop':
    case 'dot': {
      const rx = motif === 'dot' ? len / 2 : len / 2;
      const ry = motif === 'dot' ? len / 2 : w;
      return [
        ['M', mid + rx, 0],
        ['C', mid + rx, ry * K, mid + rx * K, ry, mid, ry],
        ['C', mid - rx * K, ry, mid - rx, ry * K, mid - rx, 0],
        ['C', mid - rx, -ry * K, mid - rx * K, -ry, mid, -ry],
        ['C', mid + rx * K, -ry, mid + rx, -ry * K, mid + rx, 0],
        ['Z'],
      ];
    }
  }
};

const fmt = (n: number) => String(Math.round(n * 1000) / 1000);

const rotate = (segments: Segment[], angle: number) => {
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  return segments.map(seg => {
    if (seg[0] === 'Z') return 'Z';
    const [cmd, ...nums] = seg;
    const pts: string[] = [];
    for (let i = 0; i < nums.length; i += 2) pts.push(`${fmt(nums[i] * c - nums[i + 1] * s)} ${fmt(nums[i] * s + nums[i + 1] * c)}`);
    return cmd + pts.join(' ');
  }).join('');
};

/** SVG path (centre at 0,0, radius 1) of one whole ring. */
export const ringPath = (ring: RadialRing) => {
  const step = (2 * Math.PI) / ring.count;
  const base = motifSegments(ring.motif, ring.inner, ring.outer, ring.width);
  let path = '';
  for (let i = 0; i < ring.count; i++) path += rotate(base, i * step + (ring.offset ? step / 2 : 0) - Math.PI / 2);
  return path;
};

/** Guide points where each motif of a ring starts and ends, for drawing by hand. */
export const ringGuidePoints = (ring: RadialRing) => {
  const step = (2 * Math.PI) / ring.count;
  return Array.from({ length: ring.count }, (_, i) => {
    const angle = i * step + (ring.offset ? step / 2 : 0) - Math.PI / 2;
    return { x: Math.cos(angle) * ring.outer, y: Math.sin(angle) * ring.outer };
  });
};

export const ringStyle = (design: RadialDesign, ring: RadialRing) => ({
  fill: ring.filled ? ring.color : 'none',
  stroke: ring.filled ? design.outline : ring.color,
  strokeWidth: ring.filled ? 0.012 : 0.022,
});

export const radialToSvg = (design: RadialDesign, size = 480) => {
  const rings = design.rings
    .map(ring => {
      const s = ringStyle(design, ring);
      return `<path d="${ringPath(ring)}" fill="${s.fill}" stroke="${s.stroke}" stroke-width="${s.strokeWidth}" stroke-linejoin="round"/>`;
    })
    .join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-1.1 -1.1 2.2 2.2" width="${size}" height="${size}">`
    + `<rect x="-1.1" y="-1.1" width="2.2" height="2.2" fill="${design.background}"/>`
    + rings
    + `<circle r="0.09" fill="${design.centre}" stroke="${design.outline}" stroke-width="0.012"/>`
    + '</svg>';
};

export const radialColours = (design: RadialDesign) =>
  [...new Set([design.background, ...design.rings.map(r => r.color), design.centre])];
