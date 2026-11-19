import { describe, expect, it } from 'vitest';
import { MEHENDI_LAYOUTS, MEHENDI_VIEWBOX, curvePieces, makeMehendi, mehendiGuidePoints, mehendiToSvg, onHand, strokePath, type HandSide, type MehendiLayout } from './mehendi';
import { currentGroup, expectedDots, isFinished, mehendiPlan, startPractice, tapDot, type PracticeState } from './practice';

const LAYOUTS = Object.keys(MEHENDI_LAYOUTS) as MehendiLayout[];
const SIDES: HandSide[] = ['right', 'left'];
const colours = { colors: ['#3F4A1F'], background: '#E8BE98' };
const make = (layout: MehendiLayout, density = 2, side: HandSide = 'right') => makeMehendi({ layout, density, side, ...colours });

describe('henna designs', () => {
  it('stay on the hand, for every layout, richness and side', () => {
    for (const layout of LAYOUTS) {
      for (const side of SIDES) {
        for (const density of [1, 2, 3]) {
          const d = make(layout, density, side);
          for (const s of d.strokes) for (const p of s.points) expect(onHand(p, side), `${layout} ${side} ${density} at ${p.x},${p.y}`).toBe(true);
        }
      }
    }
  });

  it('are the same on the left hand as on the right, turned over', () => {
    for (const layout of LAYOUTS) {
      const right = make(layout, 2, 'right');
      const left = make(layout, 2, 'left');
      expect(left.strokes).toHaveLength(right.strokes.length);
      right.strokes.forEach((s, i) => s.points.forEach((p, j) => {
        expect(left.strokes[i].points[j].x).toBeCloseTo(500 - p.x, 5);
        expect(left.strokes[i].points[j].y).toBeCloseTo(p.y, 5);
      }));
    }
  });

  it('are piped in stages, in order, and no stage is empty', () => {
    for (const layout of LAYOUTS) {
      const d = make(layout);
      expect(d.groups.length).toBeGreaterThanOrEqual(4);
      d.groups.forEach((_, g) => expect(d.strokes.some(s => s.group === g), `${layout} stage ${g}`).toBe(true));
      const order = d.strokes.map(s => s.group);
      expect(order).toEqual([...order].sort((a, b) => a - b));
      expect(d.groups.at(-1)).toBe('the wrist');
    }
  });

  it('get richer, never poorer, as richness goes up', () => {
    for (const layout of LAYOUTS) {
      const counts = [1, 2, 3].map(n => make(layout, n).strokes.length);
      expect(counts[1], layout).toBeGreaterThanOrEqual(counts[0]);
      expect(counts[2], layout).toBeGreaterThanOrEqual(counts[1]);
      expect(counts[2], layout).toBeGreaterThan(counts[0]);
    }
  });

  it('keep richness in range, and mix dots with lines or shapes', () => {
    expect(make('mandala', 99).density).toBe(3);
    expect(make('mandala', -4).density).toBe(1);
    for (const layout of LAYOUTS) {
      const kinds = new Set(make(layout).strokes.map(s => s.kind));
      expect(kinds.has('dot'), layout).toBe(true);
      expect(kinds.has('line') || kinds.has('petal'), layout).toBe(true);
    }
    expect(new Set(make('mandala').strokes.map(s => s.kind))).toEqual(new Set(['dot', 'line', 'petal']));
  });

  it('draw a mandala with the same number of petals in every ring', () => {
    for (const density of [1, 2, 3]) {
      const d = make('mandala', density);
      const petals = (g: number) => d.strokes.filter(s => s.group === g && s.kind === 'petal').length;
      expect(petals(1)).toBe(4 + 2 * density);
      expect(petals(2)).toBe(petals(1));
      expect(d.strokes.filter(s => s.group === 3 && s.kind === 'dot')).toHaveLength(2 * petals(1));
    }
  });

  it('turn waypoints into smooth pieces that join up', () => {
    const waypoints = [{ x: 0, y: 0 }, { x: 10, y: 5 }, { x: 20, y: 0 }];
    expect(curvePieces(waypoints, false)).toHaveLength(2);
    const closed = curvePieces(waypoints, true);
    expect(closed).toHaveLength(3);
    expect(closed[2]).toMatch(/^M20 0C.* 0 0$/);
    for (const layout of LAYOUTS) for (const s of make(layout).strokes) expect(strokePath(s)).toMatch(/^M[-\d.]+ [-\d.]+[AaCc]/);
  });

  it('draw as a square picture of the hand in the henna colour', () => {
    const svg = mehendiToSvg(make('bridal'));
    expect(svg).toContain(`viewBox="${MEHENDI_VIEWBOX}"`);
    expect(svg).toContain('#3F4A1F');
    expect(svg).not.toContain('NaN');
    expect(mehendiToSvg(make('bridal'), 540, { guide: true }).length).toBeGreaterThan(svg.length);
    expect(mehendiGuidePoints(make('mandala')).length).toBeGreaterThan(40);
  });
});

describe('practising henna', () => {
  /** Taps every stroke through, the way the visitor would. */
  const playThrough = (layout: MehendiLayout, density: number) => {
    const plan = mehendiPlan(make(layout, density));
    let state: PracticeState = startPractice(plan);
    let taps = 0;
    while (!isFinished(state) && taps < 5000) {
      const result = tapDot(plan, state, expectedDots(plan, state)[0]);
      expect(result.ok).toBe(true);
      state = result.state;
      taps++;
    }
    return { plan, state, taps };
  };

  it('has a stroke for every part of the design, joined waypoint to waypoint', () => {
    for (const layout of LAYOUTS) {
      const d = make(layout);
      const plan = mehendiPlan(d);
      expect(plan.strokes).toHaveLength(d.strokes.length);
      plan.strokes.forEach((s, i) => {
        const source = d.strokes[i];
        if (source.kind === 'dot') {
          expect(s.dots).toHaveLength(1);
          expect(s.start).toBeTruthy();
          return;
        }
        expect(s.pieces, `${layout} ${i}`).toHaveLength(s.dots.length - 1);
        if (source.closed) expect(s.dots.at(-1)).toBe(s.dots[0]);
        s.dots.forEach(id => expect(plan.dots[id]).toBeTruthy());
      });
      expect(plan.groups).toEqual(d.groups);
    }
  });

  it('can be finished by tapping the waypoints in order, stage by stage', () => {
    for (const layout of LAYOUTS) {
      const { plan, state, taps } = playThrough(layout, 1);
      expect(isFinished(state), layout).toBe(true);
      expect(currentGroup(plan, state)).toBe(plan.groups.length);
      expect(taps).toBeGreaterThan(plan.strokes.length);
    }
  });

  it('refuses a waypoint that is not next', () => {
    const plan = mehendiPlan(make('mandala'));
    const state = startPractice(plan);
    const wrong = plan.dots.findIndex((_, i) => !expectedDots(plan, state).includes(i));
    expect(tapDot(plan, state, wrong).ok).toBe(false);
  });
});
