import type { Design, Point } from '../types/kolam';
import { designDots, loopBends } from './kolamLogic';
import { radialGuideDots, ringStrokes, type RadialDesign } from './radial';
import { geometricPoint, outlineDots, type GeometricDesign } from './geometric';

/*
 * Practice: the visitor draws a design by tapping its dots in order. A design is a list of strokes
 * (a line of a kolam, or one shape of a rangoli ring); each stroke is a list of dots, with a piece
 * of line between each dot and the next. Tapping the right dot draws the piece that leads to it.
 */

export interface Stroke {
    /** Indexes into PracticePlan.dots, in drawing order. */
    dots: number[];
    /** pieces[i] is the line from dots[i] to dots[i + 1]. */
    pieces: string[];
    /** Drawn when the stroke is started (a whole curl, or a kolam's first bend). */
    start?: string;
    /** Drawn when the stroke is finished (the inner line of a double outline). */
    finish?: string;
    /** A closed shape may be drawn either way round from its first dot. */
    closed: boolean;
    /** Strokes are drawn group by group: a ring of a rangoli, or one line of a kolam. */
    group: number;
}

export interface PracticePlan {
    kind: 'kolam' | 'radial' | 'geometric';
    /** Ring the dot where the next line starts, when its start is not obvious. */
    showStart: boolean;
    viewBox: string;
    dots: Point[];
    /** The colour each dot is put down in, where the design's dots are coloured from the start. */
    dotColours: Array<string | undefined>;
    /** The radius of each dot, where it differs from dotRadius. */
    dotSizes: Array<number | undefined>;
    dotRadius: number;
    lineWidth: number;
    strokes: Stroke[];
    /** Name of each group, e.g. "ring 2" or "line 1". */
    groups: string[];
    /** Whether a new stroke may start at any of its group's unfinished strokes, or only at the next. */
    anyOrder: boolean;
    /** What the visitor is drawing in each group, e.g. "curls" or "petals". */
    shapes: string[];
}

export const KOLAM_UNIT = 40;
const PAD = 1;

export const kolamPlan = (design: Design): PracticePlan => {
    const dots = designDots(design);
    const index = new Map(dots.map((d, i) => [`${d.x},${d.y}`, i]));
    const strokes: Stroke[] = loopBends(design, KOLAM_UNIT, PAD).map((bends, group) => ({
        // Tapping the first dot draws its bend; each later tap draws the bend round that dot.
        dots: bends.map(b => index.get(`${b.dot.x},${b.dot.y}`)!),
        start: bends[0].path,
        pieces: bends.slice(1).map(b => b.path),
        closed: false,
        group,
    }));
    return {
        kind: 'kolam',
        showStart: true,
        viewBox: `0 0 ${(design.cols - 1 + 2 * PAD) * KOLAM_UNIT} ${(design.rows - 1 + 2 * PAD) * KOLAM_UNIT}`,
        dots: dots.map(d => ({ x: (PAD + d.x) * KOLAM_UNIT, y: (PAD + d.y) * KOLAM_UNIT })),
        dotColours: dots.map(() => undefined),
        dotSizes: dots.map(() => undefined),
        dotRadius: KOLAM_UNIT * 0.09,
        lineWidth: KOLAM_UNIT * 0.07,
        strokes,
        groups: strokes.map((_, i) => `line ${i + 1}`),
        anyOrder: false,
        shapes: strokes.map(() => 'bends'),
    };
};

const SHAPES: Record<string, string> = { lotus: 'petals', leaf: 'leaves', drop: 'petals', loop: 'circle', curl: 'curls', wedge: 'segments' };

export const radialPlan = (design: RadialDesign): PracticePlan => {
    const guide = radialGuideDots(design);
    const nearest = ([x, y]: [number, number]) => {
        let best = 0;
        guide.forEach((d, i) => { if (Math.hypot(d.x - x, d.y - y) < Math.hypot(guide[best].x - x, guide[best].y - y)) best = i; });
        return best;
    };
    const strokes: Stroke[] = [];
    const groups: string[] = [];
    const shapes: string[] = [];
    // From the centre outwards, as a rangoli is drawn.
    [...design.rings].reverse().forEach(ring => {
        const shapesOfRing = ringStrokes(ring);
        if (!shapesOfRing.length) return;
        const group = groups.length;
        groups.push(`ring ${group + 1}`);
        shapes.push(ring.around ? 'centre circle' : SHAPES[ring.motif] ?? 'shapes');
        for (const s of shapesOfRing) {
            strokes.push({ dots: s.dots.map(nearest), pieces: s.pieces, start: s.whole, finish: s.finish, closed: s.closed, group });
        }
    });
    return {
        kind: 'radial',
        showStart: false,
        viewBox: '-1.1 -1.1 2.2 2.2',
        dots: guide.map(({ x, y }) => ({ x, y })),
        dotColours: guide.map(d => d.color),
        dotSizes: guide.map(d => d.size),
        dotRadius: 0.018,
        lineWidth: 0.014,
        strokes,
        groups,
        anyOrder: true,
        shapes,
    };
};

/** Straight-line designs: each shape is drawn dot to dot along its edges, back to its first corner. */
export const geometricPlan = (design: GeometricDesign): PracticePlan => {
    const point = (i: number) => geometricPoint(design, i, KOLAM_UNIT, PAD);
    const strokes: Stroke[] = design.shapes.map(shape => {
        const dots = outlineDots(design, shape);
        const pieces = dots.slice(1).map((dot, k) => {
            const a = point(dots[k]);
            const b = point(dot);
            return `M${a.x} ${a.y}L${b.x} ${b.y}`;
        });
        return { dots, pieces, closed: true, group: shape.group };
    });
    return {
        kind: 'geometric',
        showStart: true,
        viewBox: `0 0 ${(design.size + 1) * KOLAM_UNIT} ${(design.size + 1) * KOLAM_UNIT}`,
        dots: design.dots.map((_, i) => point(i)),
        dotColours: design.dots.map(() => undefined),
        dotSizes: design.dots.map(() => undefined),
        dotRadius: KOLAM_UNIT * 0.08,
        lineWidth: KOLAM_UNIT * 0.06,
        strokes,
        groups: design.groups,
        anyOrder: true,
        shapes: design.groups.map(() => 'shapes'),
    };
};

// ---------------------------------------------------------------- progress

export interface PracticeState {
    done: boolean[];
    /** The stroke being drawn, how many of its dots are tapped, and which way round. */
    active: { stroke: number; tapped: number; reverse: boolean } | null;
    /** Everything drawn so far. */
    drawn: string[];
}

export const startPractice = (plan: PracticePlan): PracticeState => ({ done: plan.strokes.map(() => false), active: null, drawn: [] });

/** The group being drawn now: the first with an unfinished stroke. */
export const currentGroup = (plan: PracticePlan, state: PracticeState) => {
    const i = state.done.findIndex(d => !d);
    return i < 0 ? plan.groups.length : plan.strokes[i].group;
};

export const isFinished = (state: PracticeState) => state.done.every(Boolean);

/** Dot order of a stroke when drawn the other way round (a closed shape ends where it began). */
const orderOf = (s: Stroke, reverse: boolean) => (reverse ? [s.dots[0], ...s.dots.slice(0, -1).reverse()] : s.dots);

/** The dots a tap may go to now: the next dot of the stroke being drawn, or where a new one starts. */
export const expectedDots = (plan: PracticePlan, state: PracticeState): number[] => {
    if (state.active) {
        const s = plan.strokes[state.active.stroke];
        if (state.active.tapped === 1 && s.closed) return [...new Set([s.dots[1], s.dots[s.dots.length - 2]])];
        return [orderOf(s, state.active.reverse)[state.active.tapped]];
    }
    const group = currentGroup(plan, state);
    const open = plan.strokes.map((s, i) => ({ s, i })).filter(({ s, i }) => s.group === group && !state.done[i]);
    return [...new Set((plan.anyOrder ? open : open.slice(0, 1)).map(({ s }) => s.dots[0]))];
};

const complete = (plan: PracticePlan, state: PracticeState, stroke: number): PracticeState => {
    const s = plan.strokes[stroke];
    const done = [...state.done];
    done[stroke] = true;
    return { done, active: null, drawn: s.finish ? [...state.drawn, s.finish] : state.drawn };
};

export type TapResult = { ok: true; state: PracticeState; finishedStroke: boolean } | { ok: false; state: PracticeState };

/** What happens when the visitor taps a dot. */
export const tapDot = (plan: PracticePlan, state: PracticeState, dot: number): TapResult => {
    if (!expectedDots(plan, state).includes(dot)) return { ok: false, state };
    if (!state.active) {
        const group = currentGroup(plan, state);
        const stroke = plan.strokes.findIndex((s, i) => s.group === group && !state.done[i] && s.dots[0] === dot);
        const s = plan.strokes[stroke];
        const drawn = s.start ? [...state.drawn, s.start] : state.drawn;
        if (s.dots.length === 1) return { ok: true, state: complete(plan, { ...state, drawn }, stroke), finishedStroke: true };
        return { ok: true, state: { ...state, drawn, active: { stroke, tapped: 1, reverse: false } }, finishedStroke: false };
    }
    const { stroke, tapped } = state.active;
    const s = plan.strokes[stroke];
    // At the first move of a closed shape, the tap decides which way round it is drawn.
    const reverse = tapped === 1 && s.closed ? dot !== s.dots[1] : state.active.reverse;
    const piece = reverse ? s.pieces[s.pieces.length - tapped] : s.pieces[tapped - 1];
    const next = { ...state, drawn: [...state.drawn, piece], active: { stroke, tapped: tapped + 1, reverse } };
    if (tapped + 1 === s.dots.length) return { ok: true, state: complete(plan, next, stroke), finishedStroke: true };
    return { ok: true, state: next, finishedStroke: false };
};

/** Draws the rest of the current group for the visitor. */
export const finishGroup = (plan: PracticePlan, state: PracticeState): PracticeState => {
    const group = currentGroup(plan, state);
    let next: PracticeState = { ...state, active: null };
    plan.strokes.forEach((s, i) => {
        if (s.group !== group || state.done[i]) return;
        next = complete(plan, { ...next, drawn: [...next.drawn, ...(s.start ? [s.start] : []), ...s.pieces] }, i);
    });
    // A half-drawn stroke's pieces are drawn twice; that is harmless.
    return next;
};
