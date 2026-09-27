import { describe, expect, it } from 'vitest';
import { makeRadial, radialColours, radialGuideDots, radialToSvg, ringDots, ringPath, RADIAL_STYLES, type RadialStyle } from './radial';
import { designToSvg, squareDesign } from './kolamLogic';
import { PALETTES, nearestTraditional } from '../lib/colours';

describe('radial designs', () => {
  it('repeats each motif once per petal and stays inside the unit circle', () => {
    for (const style of Object.keys(RADIAL_STYLES) as RadialStyle[]) {
      const design = makeRadial({ petals: 7, layers: 3, style, ...PALETTES.pongal });
      for (const ring of design.rings) {
        expect(ringPath(ring).split('M').length - 1).toBe(ring.count);
        const numbers = ringPath(ring).match(/-?\d+(\.\d+)?/g)!.map(Number);
        for (let i = 0; i < numbers.length; i += 2) expect(Math.hypot(numbers[i], numbers[i + 1])).toBeLessThanOrEqual(1.25);
      }
      expect(radialToSvg(design)).toContain('<svg');
    }
  });

  it('gives every petal its own guide dots, and the outline passes through them', () => {
    const [ring] = makeRadial({ petals: 6, layers: 1, style: 'lotus', ...PALETTES.kaavi }).rings;
    const dots = ringDots(ring);
    expect(dots).toHaveLength(6 * 4); // base, two sides, tip
    // The tips are points the outline is drawn through.
    const numbers = ringPath(ring).match(/-?\d+(\.\d+)?/g)!.map(Number);
    const endpoints: Array<{ x: number; y: number }> = [];
    for (let i = 0; i < numbers.length; i += 2) endpoints.push({ x: numbers[i], y: numbers[i + 1] });
    const tips = dots.filter(d => Math.abs(Math.hypot(d.x, d.y) - ring.outer) < 1e-3);
    expect(tips).toHaveLength(6);
    expect(tips.every(t => endpoints.some(e => Math.hypot(e.x - t.x, e.y - t.y) < 2e-3))).toBe(true);
  });

  it('shares one dot where two rings meet', () => {
    const dots = radialGuideDots(makeRadial({ petals: 8, layers: 3, style: 'lotus', ...PALETTES.pongal }));
    for (let i = 0; i < dots.length; i++) {
      for (let j = i + 1; j < dots.length; j++) expect(Math.hypot(dots[i].x - dots[j].x, dots[i].y - dots[j].y)).toBeGreaterThanOrEqual(0.035);
    }
    expect(dots[0]).toMatchObject({ x: 0, y: 0 });
  });

  it('lists the ground first among its colours', () => {
    expect(radialColours(makeRadial({ petals: 8, layers: 2, style: 'lotus', ...PALETTES.riceFlour }))[0]).toBe(PALETTES.riceFlour.background);
  });
});

describe('colours', () => {
  it('names colours after traditional materials', () => {
    expect(nearestTraditional('#FAFAFA').name).toBe('Rice-flour white');
    expect(nearestTraditional('#E0B000').name).toBe('Turmeric yellow');
    expect(nearestTraditional('#9B3520').name).toBe('Kaavi red');
  });

  it('colours each kolam loop separately when given several colours', () => {
    const svg = designToSvg(squareDesign(3), { stroke: ['#111111', '#222222', '#333333'] });
    expect(svg.match(/<path /g)).toHaveLength(3);
    expect(svg).toContain('#333333');
  });
});

describe('grounds', () => {
  it('names grounds as floors', async () => {
    const { nearestGround } = await import('../lib/colours');
    expect(nearestGround('#FFF8EE').name).toBe('Light floor');
    expect(nearestGround('#8E3B24').name).toBe('Red-earth floor');
    expect(nearestGround('#1F1A3A').name).toBe('Dark floor');
  });
});

describe('traced guide dots', () => {
  it('spaces dots evenly along each outline', async () => {
    const { tracedDots } = await import('./traced');
    // A 0.4 × 0.4 square in a square picture: perimeter 1.6 of the width.
    const art = { layers: [{ color: '#C62839', path: 'M0.3 0.3L0.7 0.3L0.7 0.7L0.3 0.7Z' }], palette: [], width: 100, height: 100 };
    const dots = tracedDots(art);
    expect(dots.length).toBeGreaterThanOrEqual(50);
    expect(dots.length).toBeLessThanOrEqual(56);
    dots.forEach(d => {
      const onEdge = [d.x, d.y].some(v => Math.abs(v - 300) < 1e-6 || Math.abs(v - 700) < 1e-6);
      expect(onEdge).toBe(true);
    });
  });
});
