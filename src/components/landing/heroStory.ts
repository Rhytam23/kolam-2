import type { DrawProgress } from './FloorArt';

/** Where a value sits between `from` and `to`, clamped to 0..1. */
const segment = (p: number, from: number, to: number) => Math.min(1, Math.max(0, (p - from) / (to - from)));

export const SCENES = [
    { name: 'Sikku kolam', steps: ['Place the dots', 'One line around them'] },
    { name: 'Lotus rangoli', steps: ['Place the dots', 'Join them ring by ring', 'Fill the colours'] },
] as const;

export interface HeroStory {
    kolam: DrawProgress;
    rangoli: DrawProgress;
    /** 0 shows only the kolam, 1 only the rangoli. */
    mix: number;
    scene: 0 | 1;
    /** Index into SCENES[scene].steps of the step being drawn. */
    step: number;
}

/**
 * The hero drawing as the page scrolls: the kolam's dots appear on arrival (`intro`), scrolling draws
 * its line, then the floor is cleared for a rangoli whose dots, rings and colours follow in turn.
 */
export const heroStory = (scroll: number, intro: number): HeroStory => {
    const kolam = { dots: Math.max(intro, segment(scroll, 0, 0.04)), lines: segment(scroll, 0.04, 0.34), colour: 0 };
    const rangoli = { dots: segment(scroll, 0.48, 0.58), lines: segment(scroll, 0.58, 0.8), colour: segment(scroll, 0.82, 0.95) };
    const mix = segment(scroll, 0.4, 0.5);
    if (mix < 0.5) return { kolam, rangoli, mix, scene: 0, step: kolam.lines > 0 ? 1 : 0 };
    return { kolam, rangoli, mix, scene: 1, step: rangoli.colour > 0 ? 2 : rangoli.lines > 0 ? 1 : 0 };
};
