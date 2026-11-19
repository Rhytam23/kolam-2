import { describe, expect, it } from 'vitest';
import { expectedDots, finishGroup, geometricPlan, isFinished, kolamPlan, mehendiPlan, radialPlan, tracedPlan, startPractice, tapDot, currentGroup, type PracticePlan, type PracticeState } from './practice';
import { diamondDesign, makeSingleLine, squareDesign } from './kolamLogic';
import { makeRadial } from './radial';
import { makeGeometric, GEOMETRIC_PATTERNS, type GeometricPattern } from './geometric';
import { PALETTES } from '../lib/colours';
import { MEHENDI_LAYOUTS, makeMehendi, type MehendiLayout } from './mehendi';

/** Plays the whole design by always tapping the first expected dot. */
const playThrough = (plan: PracticePlan) => {
    let state: PracticeState = startPractice(plan);
    let taps = 0;
    while (!isFinished(state) && taps < 10000) {
        const result = tapDot(plan, state, expectedDots(plan, state)[0]);
        expect(result.ok).toBe(true);
        state = result.state;
        taps++;
    }
    return { state, taps };
};

describe('practice', () => {
    it('draws a sikku kolam one bend at a time, from the marked start', () => {
        const plan = kolamPlan(makeSingleLine(diamondDesign(5)));
        expect(plan.strokes).toHaveLength(1);
        const start = startPractice(plan);
        expect(expectedDots(plan, start)).toEqual([plan.strokes[0].dots[0]]);
        const wrong = plan.dots.findIndex((_, i) => i !== plan.strokes[0].dots[0]);
        expect(tapDot(plan, start, wrong).ok).toBe(false);
        const { state, taps } = playThrough(plan);
        expect(taps).toBe(plan.strokes[0].dots.length);
        expect(state.drawn).toHaveLength(taps);
    });

    it('draws each line of a kolam with several lines in turn', () => {
        const plan = kolamPlan(squareDesign(3));
        expect(plan.groups).toHaveLength(3);
        expect(isFinished(playThrough(plan).state)).toBe(true);
    });

    it('lets a petal be drawn either way round, and any petal of the ring be started', () => {
        const plan = radialPlan(makeRadial({ petals: 8, layers: 2, style: 'lotus', ...PALETTES.pongal }));
        const s0 = startPractice(plan);
        const firstRing = plan.strokes.filter(s => s.group === 0);
        expect(expectedDots(plan, s0)).toHaveLength(firstRing.length);
        const petal = plan.strokes[0];
        const started = tapDot(plan, s0, petal.dots[0]);
        expect(started.ok).toBe(true);
        // Either neighbour of the first dot is a correct next tap.
        const both = expectedDots(plan, started.state);
        expect(both).toEqual(expect.arrayContaining([petal.dots[1], petal.dots[petal.dots.length - 2]]));
        let state = tapDot(plan, started.state, petal.dots[petal.dots.length - 2]).state;
        expect(state.active?.reverse).toBe(true);
        for (const dot of [...petal.dots.slice(1, -2)].reverse().concat(petal.dots[0])) state = tapDot(plan, state, dot).state;
        expect(state.done[0]).toBe(true);
        expect(state.drawn).toHaveLength(petal.pieces.length);
    });

    it('works through every radial style, ring by ring from the centre', () => {
        for (const style of ['lotus', 'alpana', 'curls', 'festival', 'star', 'marigold'] as const) {
            const plan = radialPlan(makeRadial({ petals: 8, layers: 2, style, ...PALETTES.festival }));
            const { state } = playThrough(plan);
            expect(isFinished(state)).toBe(true);
        }
    });

    it('can finish a ring for the visitor', () => {
        const plan = radialPlan(makeRadial({ petals: 8, layers: 3, style: 'curls', ...PALETTES.darkFloor }));
        const state = finishGroup(plan, startPractice(plan));
        expect(currentGroup(plan, state)).toBe(1);
    });

    it('draws every straight-line design dot by dot along its edges', () => {
        for (const pattern of Object.keys(GEOMETRIC_PATTERNS) as GeometricPattern[]) {
            const plan = geometricPlan(makeGeometric({ pattern, size: 9, ...PALETTES.sankranti }));
            // Each step of a line goes to a neighbouring dot, straight or diagonally.
            for (const stroke of plan.strokes) {
                stroke.dots.slice(1).forEach((dot, k) => {
                    const a = plan.dots[stroke.dots[k]];
                    const b = plan.dots[dot];
                    expect(Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y))).toBe(40);
                });
            }
            expect(isFinished(playThrough(plan).state)).toBe(true);
        }
    });
});

describe('practice with a design read from a photo', () => {
    // Two outlines in two colours: a square, and a circle made of four curves.
    const K = 0.5523 * 0.1;
    const square = 'M0.1 0.1L0.4 0.1L0.4 0.4L0.1 0.4Z';
    const circle = `M0.8 0.7C0.8 ${0.7 + K} ${0.7 + K} 0.8 0.7 0.8C${0.7 - K} 0.8 0.6 ${0.7 + K} 0.6 0.7C0.6 ${0.7 - K} ${0.7 - K} 0.6 0.7 0.6C${0.7 + K} 0.6 0.8 ${0.7 - K} 0.8 0.7Z`;
    const art = { layers: [{ color: '#ffffff', path: square }, { color: '#C62839', path: circle }], palette: [], width: 1000, height: 1000 };

    it('makes one stroke per outline, grouped by colour layer', () => {
        const plan = tracedPlan(art);
        expect(plan.kind).toBe('traced');
        expect(plan.strokes).toHaveLength(2);
        expect(plan.groups).toHaveLength(2);
        expect(plan.strokes.map(s => s.group)).toEqual([0, 1]);
    });

    it('draws the real curve between guide dots', () => {
        const plan = tracedPlan(art);
        expect(plan.strokes[1].pieces.some(piece => piece.includes('C'))).toBe(true);
        plan.strokes.forEach(s => expect(s.pieces).toHaveLength(s.dots.length - 1));
    });

    it('can be drawn from start to finish by tapping the dots in order', () => {
        const { state } = playThrough(tracedPlan(art));
        expect(isFinished(state)).toBe(true);
    });
});

import { dotPlace, focusMessage, keyboardStep, practiceKey } from './practice';

describe('practice with the keyboard', () => {
    it('maps keys to actions, and lets Tab leave the drawing at either end', () => {
        expect(practiceKey('Enter', false, 0, 3)).toBe('tap');
        expect(practiceKey(' ', false, 0, 3)).toBe('tap');
        expect(practiceKey('ArrowRight', false, 0, 3)).toBe('next');
        expect(practiceKey('ArrowDown', false, 0, 3)).toBe('next');
        expect(practiceKey('ArrowLeft', false, 0, 3)).toBe('previous');
        expect(practiceKey('ArrowUp', false, 0, 3)).toBe('previous');
        expect(practiceKey('Tab', false, 0, 3)).toBe('next');
        expect(practiceKey('Tab', false, 2, 3)).toBeNull(); // last dot: Tab moves on to the buttons
        expect(practiceKey('Tab', true, 0, 3)).toBeNull(); // first dot: Shift+Tab moves back out
        expect(practiceKey('Tab', true, 2, 3)).toBe('previous');
        expect(practiceKey('Tab', false, 0, 1)).toBeNull(); // a single valid dot never traps Tab
        expect(practiceKey('a', false, 0, 3)).toBeNull();
    });

    it('chooses between the valid dots only, wrapping with the arrow keys', () => {
        const plan = radialPlan(makeRadial({ petals: 8, layers: 2, style: 'lotus', ...PALETTES.pongal }));
        const state = startPractice(plan);
        const valid = expectedDots(plan, state);
        expect(valid.length).toBeGreaterThan(1);
        const forward = keyboardStep(plan, state, 0, 'ArrowRight');
        expect(forward).toMatchObject({ cursor: 1, handled: true });
        expect(keyboardStep(plan, state, valid.length - 1, 'ArrowRight').cursor).toBe(0);
        expect(keyboardStep(plan, state, 0, 'ArrowLeft').cursor).toBe(valid.length - 1);
        expect(keyboardStep(plan, state, 0, 'x').handled).toBe(false);
    });

    it('taps the chosen dot with Enter or Space, exactly like a tap with a finger', () => {
        const plan = kolamPlan(makeSingleLine(diamondDesign(5)));
        const state = startPractice(plan);
        const out = keyboardStep(plan, state, 0, 'Enter');
        expect(out.tap?.dot).toBe(expectedDots(plan, state)[0]);
        expect(out.tap?.result).toEqual(tapDot(plan, state, out.tap!.dot));
        expect(out.state.drawn).toHaveLength(1);
        expect(keyboardStep(plan, state, 0, ' ').tap?.result.ok).toBe(true);
    });

    it('can never tap a wrong dot', () => {
        const plan = kolamPlan(squareDesign(3));
        let state = startPractice(plan);
        for (let n = 0; n < 500 && !isFinished(state); n++) {
            const out = keyboardStep(plan, state, 99, 'Enter'); // a stale cursor is clamped
            expect(out.tap?.result.ok).toBe(true);
            state = out.state;
        }
        expect(isFinished(state)).toBe(true);
    });

    const keyboardPass = (plan: PracticePlan) => {
        let state = startPractice(plan);
        let cursor = 0;
        let presses = 0;
        while (!isFinished(state) && presses < 20000) {
            // Wander to the last valid dot with the arrow keys, then tap it with Space.
            const count = expectedDots(plan, state).length;
            for (let i = 0; i < count - 1; i++) cursor = keyboardStep(plan, state, cursor, 'ArrowRight').cursor;
            const out = keyboardStep(plan, state, cursor, ' ');
            expect(out.tap?.result.ok).toBe(true);
            state = out.state;
            cursor = out.cursor;
            presses++;
        }
        return state;
    };

    it('completes a full practice pass using only keys, on every kind of design, henna included', () => {
        const plans = [
            kolamPlan(makeSingleLine(diamondDesign(5))),
            kolamPlan(squareDesign(3)),
            radialPlan(makeRadial({ petals: 8, layers: 2, style: 'lotus', ...PALETTES.pongal })),
            radialPlan(makeRadial({ petals: 8, layers: 3, style: 'curls', ...PALETTES.darkFloor })),
            ...(Object.keys(GEOMETRIC_PATTERNS) as GeometricPattern[]).map(p => geometricPlan(makeGeometric({ pattern: p, size: 9, ...PALETTES.sankranti }))),
            ...(Object.keys(MEHENDI_LAYOUTS) as MehendiLayout[]).flatMap(layout => [1, 3].map(density => mehendiPlan(makeMehendi({ layout, density, side: 'left', ...PALETTES.henna })))),
        ];
        for (const plan of plans) {
            const state = keyboardPass(plan);
            expect(isFinished(state)).toBe(true);
            expect(state.done.every(Boolean)).toBe(true);
            // Nothing further is choosable once the design is finished.
            expect(keyboardStep(plan, state, 0, 'Enter').handled).toBe(false);
        }
    });

    it('says where each valid dot is, in words', () => {
        const plan = kolamPlan(squareDesign(3));
        const places = plan.dots.map((_, i) => dotPlace(plan, i));
        expect(places).toContain('top left');
        expect(places).toContain('bottom right');
        expect(places).toContain('centre');
        const start = startPractice(plan);
        expect(focusMessage(plan, start, 0)).toMatch(/^Start at the dot at the .+Press Enter or Space/);
        const next = keyboardStep(plan, start, 0, 'Enter').state;
        expect(focusMessage(plan, next, 0)).toMatch(/^Next dot /);
        expect(focusMessage(plan, { ...next, done: next.done.map(() => true) }, 0)).toBe('The design is finished.');
    });
});
