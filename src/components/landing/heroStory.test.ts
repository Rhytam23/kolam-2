import { describe, expect, it } from 'vitest';
import { heroStory } from './heroStory';
import { countLoops, makeDesign } from '../../utils/kolamLogic';

describe('heroStory', () => {
    it('starts on an empty floor and lays the dots first', () => {
        const s = heroStory(0, 0);
        expect(s.scene).toBe(0);
        expect(s.kolam).toEqual({ dots: 0, lines: 0, colour: 0 });
        expect(heroStory(0, 1).kolam.dots).toBe(1);
    });

    it('never draws a line before all its dots are down', () => {
        for (let p = 0; p <= 1; p += 0.01) {
            const s = heroStory(p, 0);
            if (s.kolam.lines > 0) expect(s.kolam.dots).toBe(1);
            if (s.rangoli.lines > 0) expect(s.rangoli.dots).toBe(1);
            if (s.rangoli.colour > 0) expect(s.rangoli.lines).toBe(1);
        }
    });

    it('moves on from the kolam to the finished rangoli', () => {
        expect(heroStory(0.3, 1)).toMatchObject({ scene: 0, step: 1 });
        expect(heroStory(0.7, 1)).toMatchObject({ scene: 1, step: 1 });
        const end = heroStory(1, 1);
        expect(end).toMatchObject({ scene: 1, step: 2, mix: 1 });
        expect(end.rangoli).toEqual({ dots: 1, lines: 1, colour: 1 });
    });
});

describe('border kolam', () => {
    it('a single row of dots always closes into one line', () => {
        for (const n of [5, 12, 21]) expect(countLoops(makeDesign(1, n, () => true))).toBe(1);
    });
});
