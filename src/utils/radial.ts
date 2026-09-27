/*
 * Radial floor designs: rangoli, alpana, and the lotus centres of many kolams. A design is a set of
 * rings, each repeating one motif N times around the centre, so it has N-fold symmetry by construction.
 */

export type Motif = 'lotus' | 'leaf' | 'drop' | 'loop' | 'dot' | 'curl';
export type RadialStyle = 'lotus' | 'alpana' | 'marigold' | 'star' | 'curls' | 'festival';

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
  /** Point the motif towards the centre instead of away from it. */
  flip?: boolean;
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
  festival: { label: 'Festival', hint: 'Many bands of lotus petals, leaves and teardrops, as in large Diwali and Pongal rangolis.' },
  curls: { label: 'Curls', hint: 'Rings of curls, each drawn round its own dot, with coloured dots, as in many pulli kolams.' },
};

const MOTIFS: Record<Exclude<RadialStyle, 'alpana' | 'curls' | 'festival'>, Motif[]> = {
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

/** Distance from the centre of the dot that a curl's spiral winds round. */
const curlDot = (ring: RadialRing) => {
  const r = ((ring.outer - ring.inner) * ring.width) / 2;
  return ring.flip ? ring.outer - r : ring.inner + r;
};

/**
 * A circle of curls, as drawn in many pulli kolams: each band is a chain of teardrops, one pointing
 * out and the next pointing in, each with a spiral wound round a dot. The dots of the inward curls
 * are coloured at the end, and a border of coloured dots goes round the outside.
 */
const makeCurls = ({ petals, layers, colors, background }: RadialOptions): RadialDesign => {
  const line = colors[0];
  const accents = colors.length > 1 ? colors.slice(1) : [colors[0]];
  const accent = (i: number) => accents[i % accents.length];
  const dotRing = (count: number, radius: number, size: number, color: string, offset: boolean): RadialRing =>
    ({ motif: 'dot', count, inner: radius - size / 2, outer: radius + size / 2, width: 1, color, filled: true, offset });
  const border = petals * 2 ** (layers - 1);
  const rings: RadialRing[] = [dotRing(border, 0.975, 0.034, accent(1), false), dotRing(border, 0.975, 0.034, accent(0), true)];
  // Bands are packed from the outside in. Each inner band has half as many curls as the one
  // outside it, so the curls stay about the same size, and each is as big as its band allows.
  let top = 0.93;
  for (let k = 0; k < layers; k++) {
    const count = petals * 2 ** (layers - 1 - k);
    const fit = (0.95 * Math.PI) / (2 * count); // round-end radius per unit of band radius
    const rc = top / (1 + 1.75 * fit);
    const R = fit * rc;
    const length = R * 2.7;
    const width = (2 * R) / length;
    rings.push({ motif: 'curl', count, inner: rc - R * 0.95, outer: rc - R * 0.95 + length, width, color: line, filled: false, offset: false });
    const inward: RadialRing = { motif: 'curl', count, inner: rc + R * 0.95 - length, outer: rc + R * 0.95, width, color: line, filled: false, offset: true, flip: true };
    rings.push(inward, dotRing(count, curlDot(inward), R * 0.62, accent(k), true));
    top = rc - 1.75 * R - 0.03;
  }
  // A plain circle round the centre.
  const r = Math.min(0.24, Math.max(0.08, top - 0.04));
  rings.push({ motif: 'loop', count: 1, inner: -r, outer: r, width: 1, color: line, filled: false, offset: false });
  return { rings, centre: accent(1), background, outline: line };
};

/**
 * A large festival rangoli: from the centre, a small lotus, a ring of teardrops, two bands of lotus
 * petals set between each other, a band of leaves and a band of small teardrops, with a dotted edge.
 * `layers` adds bands from the centre outwards.
 */
const makeFestival = ({ petals, layers, colors, background }: RadialOptions): RadialDesign => {
  const n = petals;
  // [motif, count, inner, outer, fullness, offset], from the centre outwards, on a 0..1 scale.
  const bands: Array<[Motif, number, number, number, number, boolean]> = [
    ['lotus', n, 0.08, 0.3, 1.0, false],
    ['drop', 2 * n, 0.2, 0.4, 0.75, true],
    ['lotus', n, 0.3, 0.58, 1.05, true],
    ['lotus', n, 0.42, 0.72, 1.05, false],
    ['leaf', n, 0.55, 0.86, 0.9, true],
    ['drop', 2 * n, 0.74, 0.95, 0.7, false],
  ];
  const used = bands.slice(0, Math.min(bands.length, layers + 2));
  const scale = 0.93 / used[used.length - 1][3];
  const rings: RadialRing[] = [
    { motif: 'dot', count: 4 * n, inner: 0.965, outer: 0.995, width: 1, color: colors[colors.length - 1], filled: true, offset: false },
  ];
  used.map(([motif, count, a, b, full, offset], k) => {
    const inner = a * scale;
    const outer = b * scale;
    const gap = (2 * Math.PI * ((inner + outer) / 2)) / count;
    return { motif, count, inner, outer, width: Math.min(1.1, (full * gap) / (outer - inner)), color: colors[k % colors.length], filled: true, offset };
  }).reverse().forEach(r => rings.push(r));
  return { rings, centre: colors[(used.length + 1) % colors.length], background, outline: '#FFFFFF' };
};

export const makeRadial = (options: RadialOptions): RadialDesign => {
  const { petals, layers, style, colors, background } = options;
  if (style === 'alpana') return makeAlpana(options);
  if (style === 'curls') return makeCurls(options);
  if (style === 'festival') return makeFestival(options);
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

/**
 * Cubic Bézier segments along a curve whose radius changes evenly from r0 to r1 as the angle goes
 * from a0 to a1 (a circular arc when r0 = r1), in quarter turns at most.
 */
const spiral = (at: (phi: number, r: number) => [number, number], a0: number, a1: number, r0: number, r1: number): Segment[] => {
  const parts = Math.max(1, Math.ceil(Math.abs(a1 - a0) / (Math.PI / 2)));
  const dPhi = (a1 - a0) / parts;
  const dr = (r1 - r0) / parts;
  const tangent = (phi: number, r: number): [number, number] => {
    // Derivative of at(phi, r(phi)) with respect to phi, numerically.
    const e = 1e-4;
    const [x0, y0] = at(phi - e, r - (dr / dPhi) * e);
    const [x1, y1] = at(phi + e, r + (dr / dPhi) * e);
    return [(x1 - x0) / (2 * e), (y1 - y0) / (2 * e)];
  };
  const segments: Segment[] = [];
  for (let i = 0; i < parts; i++) {
    const p0 = a0 + i * dPhi;
    const q0 = r0 + i * dr;
    const [x0, y0] = at(p0, q0);
    const [x1, y1] = at(p0 + dPhi, q0 + dr);
    const [dx0, dy0] = tangent(p0, q0);
    const [dx1, dy1] = tangent(p0 + dPhi, q0 + dr);
    const k = (4 / 3) * Math.tan(dPhi / 4); // the handle length that makes a circular arc exact
    segments.push(['C', x0 + dx0 * k, y0 + dy0 * k, x1 - dx1 * k, y1 - dy1 * k, x1, y1]);
  }
  return segments;
};

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
    case 'curl': {
      // A teardrop: the round end at `a` holds a spiral, the point at `b`. Its width sets the
      // radius of the round end.
      const sign = Math.sign(len) || 1;
      const R = Math.abs(len) * widthRatio / 2;
      const c = a + sign * R;
      const reach = Math.abs(b - c);
      const theta = Math.acos(Math.min(1, R / reach));
      const at = (phi: number, r: number): [number, number] => [c + sign * r * Math.cos(phi), r * Math.sin(phi)];
      const t1 = at(theta, R);
      const t2 = at(-theta, R);
      // Each side bows gently outwards and meets the round end along its tangent.
      const side = (t: [number, number]): [Segment, Segment] => {
        const out = Math.sign(t[1]);
        const p1: [number, number] = [b + (t[0] - b) * 0.35, t[1] * 0.35 + out * R * 0.2];
        const p2: [number, number] = [t[0] + (b - t[0]) * 0.3, t[1] * 0.7];
        return [['C', p1[0], p1[1], p2[0], p2[1], t[0], t[1]], ['C', p2[0], p2[1], p1[0], p1[1], b, 0]];
      };
      const [toT1] = side(t1);
      const [, fromT2] = side(t2);
      const tip: Segment[] = [['M', b, 0], toT1, ...spiral(at, theta, 2 * Math.PI - theta, R, R), fromT2];
      // The spiral starts from the round end and winds one and a quarter turns inwards.
      const start = at(Math.PI, R * 0.68);
      return [...tip, ['M', start[0], start[1]], ...spiral(at, Math.PI, Math.PI - 2.5 * Math.PI, R * 0.68, R * 0.14)];
    }
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

/** One motif of a ring, before it is turned into place. */
const ringSegments = (ring: RadialRing) =>
  ring.flip ? motifSegments(ring.motif, ring.outer, ring.inner, ring.width) : motifSegments(ring.motif, ring.inner, ring.outer, ring.width);

/** SVG path (centre at 0,0, radius 1) of one whole ring. */
export const ringPath = (ring: RadialRing) => {
  const step = (2 * Math.PI) / ring.count;
  const base = ringSegments(ring);
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
  } else if (ring.motif === 'curl') {
    // A curl is drawn round a single dot rather than through dots.
    local.push([curlDot(ring), 0]);
  } else {
    let cur: [number, number] = [0, 0];
    for (const seg of ringSegments(ring)) {
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
/** Guide dots closer than this are put down as one. */
const MERGE = 0.05;

export const radialGuideDots = (design: RadialDesign) => {
  const dots: Array<{ x: number; y: number; ring: number }> = [{ x: 0, y: 0, ring: -1 }];
  [...design.rings].reverse().forEach((ring, index) => {
    for (const p of ringDots(ring)) {
      if (!dots.some(d => Math.hypot(d.x - p.x, d.y - p.y) < MERGE)) dots.push({ ...p, ring: index });
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
  stroke: ring.motif === 'dot' ? 'none' : ring.filled ? design.outline : ring.color,
  // Curls are small and close together, so their line is finer.
  strokeWidth: ring.filled ? 0.012 : ring.motif === 'curl' ? 0.011 : 0.022,
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

// ---------------------------------------------------------------- practice

type Pt = [number, number];
type Cubic = [Pt, Pt, Pt, Pt];

/** Splits a cubic Bézier in two at t = 0.5. */
const halve = ([p0, p1, p2, p3]: Cubic): [Cubic, Cubic] => {
  const mid = (a: Pt, b: Pt): Pt => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  const a = mid(p0, p1), b = mid(p1, p2), c = mid(p2, p3);
  const d = mid(a, b), e = mid(b, c), m = mid(d, e);
  return [[p0, a, d, m], [m, e, c, p3]];
};

const cubicPath = ([p0, p1, p2, p3]: Cubic) =>
  `M${fmt(p0[0])} ${fmt(p0[1])}C${[p1, p2, p3].map(p => `${fmt(p[0])} ${fmt(p[1])}`).join(' ')}`;

/** One shape of a ring, ready to be drawn dot by dot. */
export interface MotifStroke {
  /** The dots the line passes through, in drawing order (a closed shape ends where it began). */
  dots: Pt[];
  /** The line from dots[i] to dots[i + 1]. */
  pieces: string[];
  /** Drawn as soon as the shape is started, for shapes drawn round a single dot (curls). */
  whole?: string;
  /** Drawn once the shape is finished: the inner line of a double outline. */
  finish?: string;
  closed: boolean;
}

/** Every shape of a ring, split at its guide dots so it can be drawn one dot at a time. */
export const ringStrokes = (ring: RadialRing): MotifStroke[] => {
  if (ring.motif === 'dot') return [];
  const step = (2 * Math.PI) / ring.count;
  const base = ringSegments(ring);
  const inset = (ring.outer - ring.inner) * 0.17;
  const inner = ring.double ? motifSegments(ring.motif, ring.inner + inset * 1.4, ring.outer - inset, ring.width * 0.8) : [];
  const strokes: MotifStroke[] = [];
  for (let i = 0; i < ring.count; i++) {
    const angle = i * step + (ring.offset ? step / 2 : 0) - Math.PI / 2;
    const c = Math.cos(angle);
    const s = Math.sin(angle);
    const turn = (x: number, y: number): Pt => [x * c - y * s, x * s + y * c];
    if (ring.motif === 'curl') {
      const centre = curlDot(ring);
      strokes.push({ dots: [turn(centre, 0)], pieces: [], whole: rotate(base, angle), closed: false });
      continue;
    }
    const dots: Pt[] = [];
    const pieces: string[] = [];
    let cur: Pt = [0, 0];
    for (const seg of base) {
      if (seg[0] === 'M') {
        cur = turn(seg[1], seg[2]);
        dots.push(cur);
      } else if (seg[0] === 'C') {
        const cubic: Cubic = [cur, turn(seg[1], seg[2]), turn(seg[3], seg[4]), turn(seg[5], seg[6])];
        // Loops are joined quarter by quarter; petals also through the middle of each side.
        const parts = ring.motif === 'loop' ? [cubic] : halve(cubic);
        for (const part of parts) {
          pieces.push(cubicPath(part));
          dots.push(part[3]);
        }
        cur = cubic[3];
      }
    }
    strokes.push({ dots, pieces, finish: ring.double ? rotate(inner, angle) : undefined, closed: true });
  }
  return strokes;
};
