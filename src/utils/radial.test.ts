import { describe, expect, it } from 'vitest';
import { makeRadial, radialColours, radialToSvg, ringGuidePoints, ringPath, RADIAL_STYLES, type RadialStyle } from './radial';
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

  it('places the guide points evenly', () => {
    const [ring] = makeRadial({ petals: 6, layers: 1, style: 'lotus', ...PALETTES.kaavi }).rings;
    const pts = ringGuidePoints(ring);
    expect(pts).toHaveLength(6);
    const gaps = pts.map((p, i) => Math.hypot(p.x - pts[(i + 1) % 6].x, p.y - pts[(i + 1) % 6].y));
    gaps.forEach(g => expect(g).toBeCloseTo(gaps[0]));
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
