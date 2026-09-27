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
  /** Draw a second, smaller outline inside each motif, as alpana petals are painted. */
  double?: boolean;
}

export interface RadialDesign {
  rings: RadialRing[];
  centre: string;
  background: string;
  outline: string;
}

export const RADIAL_STYLES: Record<RadialStyle, { label: string; hint: string }> = {
  lotus: { label: 'Lotus', hint: 'Layers of filled lotus petals, as in many rangolis.' },
  alpana: { label: 'Alpana', hint: 'Double-outlined lotus petals and dots, as painted with rice paste in Bengal.' },
  marigold: { label: 'Marigold', hint: 'Many small rounded petals, like a flower-petal rangoli (pookalam).' },
  star: { label: 'Star', hint: 'Pointed leaves with a ring of dots at the edge.' },
};

const MOTIFS: Record<Exclude<RadialStyle, 'alpana'>, Motif[]> = {
  lotus: ['lotus', 'lotus', 'leaf', 'lotus'],
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

/**
 * Alpana: a border of dots, then bands of double-outlined petals that touch their neighbours, with
 * teardrops on the outside and lotus petals towards the centre.
 */
const makeAlpana = ({ petals, layers, colors, background }: RadialOptions): RadialDesign => {
  const rings: RadialRing[] = [{ motif: 'dot', count: petals * 2, inner: 0.95, outer: 1, width: 1, color: colors[0], filled: true, offset: false }];
  const band = 0.77 / layers;
  for (let k = 0; k < layers; k++) {
    const outer = 0.9 - k * band;
    const inner = Math.max(0.13, outer - band * 1.3);
    const motif: Motif = k === 0 && layers > 1 ? 'drop' : 'lotus';
    const gap = (2 * Math.PI * ((inner + outer) / 2)) / petals;
    rings.push({
      motif,
      count: petals,
      inner,
      outer,
      width: Math.min(motif === 'drop' ? 0.9 : 1.1, (1.05 * gap) / (outer - inner)),
      color: colors[k % colors.length],
      filled: false,
      offset: k % 2 === 0,
      double: true,
    });
  }
  return { rings, centre: colors[0], background, outline: colors[0] };
};

export const makeRadial = (options: RadialOptions): RadialDesign => {
  const { petals, layers, style, colors, background } = options;
  if (style === 'alpana') return makeAlpana(options);
  const rings: RadialRing[] = [];
  const band = 0.82 / layers;
  const outline = '#FFFFFF';
  if (style === 'star') {
    rings.push({ motif: 'dot', count: petals * 2, inner: 0.94, outer: 1, width: 1, color: colors[0], filled: true, offset: false });
  }
  // How much of the space between neighbouring motifs each motif fills.
  const fullness = { lotus: 0.95, marigold: 0.8, star: 0.8 }[style];
  for (let k = 0; k < layers; k++) {
    const outer = (style === 'star' ? 0.9 : 1) - k * band;
    const inner = Math.max(0.12, outer - band * 1.6);
    const count = style === 'marigold' ? petals * (k === 0 ? 2 : 1) : petals;
    const gap = (2 * Math.PI * ((inner + outer) / 2)) / count;
    rings.push({
      motif: MOTIFS[style][k % 4],
      count,
      inner,
      outer,
      width: Math.min(0.9, (fullness * gap) / (outer - inner)),
      color: colors[(k + 1) % colors.length],
      filled: true,
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
  // The inner outline of a double motif: a little shorter and narrower, sitting inside the first.
  const inset = (ring.outer - ring.inner) * 0.17;
  const inner = ring.double ? motifSegments(ring.motif, ring.inner + inset * 1.4, ring.outer - inset, ring.width * 0.8) : [];
  let path = '';
  for (let i = 0; i < ring.count; i++) {
    const angle = i * step + (ring.offset ? step / 2 : 0) - Math.PI / 2;
    path += rotate(base, angle);
    if (ring.double) path += rotate(inner, angle);
  }
  return path;
};

/**
 * The small guide dots a person puts down before drawing a ring, the way rangoli and alpana are
 * started: for every petal a dot where it starts, one at each side and one at its tip. The drawn
 * outline passes through every one of these dots.
 */
export const ringDots = (ring: RadialRing): Array<{ x: number; y: number }> => {
  const step = (2 * Math.PI) / ring.count;
  const local: Array<[number, number]> = [];
  if (ring.motif === 'dot') {
    local.push([(ring.inner + ring.outer) / 2, 0]);
  } else {
    let cur: [number, number] = [0, 0];
    for (const seg of motifSegments(ring.motif, ring.inner, ring.outer, ring.width)) {
      if (seg[0] === 'M') {
        cur = [seg[1], seg[2]];
        local.push(cur);
      } else if (seg[0] === 'C') {
        const [, x1, y1, x2, y2, x, y] = seg;
        // Loops get a dot at each quarter; petals also at the widest point of each side.
        if (ring.motif !== 'loop') local.push([(cur[0] + 3 * x1 + 3 * x2 + x) / 8, (cur[1] + 3 * y1 + 3 * y2 + y) / 8]);
        cur = [x, y];
        local.push(cur);
      }
    }
  }
  const unique = local.filter((p, i) => local.findIndex(q => Math.hypot(p[0] - q[0], p[1] - q[1]) < 1e-6) === i);
  const dots: Array<{ x: number; y: number }> = [];
  for (let i = 0; i < ring.count; i++) {
    const angle = i * step + (ring.offset ? step / 2 : 0) - Math.PI / 2;
    const c = Math.cos(angle);
    const sn = Math.sin(angle);
    unique.forEach(([x, y]) => dots.push({ x: x * c - y * sn, y: x * sn + y * c }));
  }
  return dots;
};

export const DOT_RADIUS = 0.016;

/**
 * All the guide dots of a design, from the centre outwards. Where two rings meet, one dot serves
 * both, as it would on the floor. `ring` is the index (centre-out) of the ring that first needs it.
 */
export const radialGuideDots = (design: RadialDesign) => {
  const dots: Array<{ x: number; y: number; ring: number }> = [{ x: 0, y: 0, ring: -1 }];
  [...design.rings].reverse().forEach((ring, index) => {
    for (const p of ringDots(ring)) {
      if (!dots.some(d => Math.hypot(d.x - p.x, d.y - p.y) < 0.035)) dots.push({ ...p, ring: index });
    }
  });
  return dots;
};

/** Dot colour that shows up on the ground. */
export const guideDotColour = (background: string) => {
  const [r, g, b] = [1, 3, 5].map(i => parseInt(background.slice(i, i + 2), 16));
  return 0.299 * r + 0.587 * g + 0.114 * b < 128 ? '#F7F3EA' : '#3B2416';
};

export const ringStyle = (design: RadialDesign, ring: RadialRing) => ({
  fill: ring.filled ? ring.color : 'none',
  stroke: ring.filled ? design.outline : ring.color,
  strokeWidth: ring.filled ? 0.012 : 0.022,
});

export const radialToSvg = (design: RadialDesign, size = 480, { dots = false } = {}) => {
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
    + (dots
      ? `<g fill="${guideDotColour(design.background)}">`
        + radialGuideDots(design).map(p => `<circle cx="${fmt(p.x)}" cy="${fmt(p.y)}" r="${DOT_RADIUS}"/>`).join('')
        + '</g>'
      : '')
    + '</svg>';
};

export const radialColours = (design: RadialDesign) =>
  [...new Set([design.background, ...design.rings.map(r => r.color), design.centre])];
