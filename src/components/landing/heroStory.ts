import type { DrawProgress } from './FloorArt';
import type { RadialStyle } from '../../utils/radial';
import type { PaletteName } from '../../lib/colours';

/** Where a value sits between `from` and `to`, clamped to 0..1. */
const segment = (p: number, from: number, to: number) => Math.min(1, Math.max(0, (p - from) / (to - from)));

export interface HeroScene {
    name: string;
    steps: readonly string[];
    /** The same design in the studio, for "Learn to draw this". */
    design: { style: RadialStyle; petals: number; layers: number; palette: PaletteName };
}

export const SCENES: readonly HeroScene[] = [
    {
        name: 'Circle of curls',
        // A pulli kolam: the dots go down in colour first, and each curl is wound round one.
        steps: ['Place the coloured dots', 'Wind a curl round each dot'],
        design: { style: 'curls', petals: 8, layers: 3, palette: 'darkFloor' },
    },
    {
        name: 'Festival rangoli',
        steps: ['Place the dots', 'Join them ring by ring', 'Fill the colours'],
        design: { style: 'festival', petals: 12, layers: 4, palette: 'festival' },
    },
];

export interface HeroStory {
    /** 0 while the heading is showing, 1 once the drawing fills the screen. */
    enter: number;
    first: DrawProgress;
    second: DrawProgress;
    /** 0 shows only the first design, 1 only the second. */
    mix: number;
    scene: 0 | 1;
    /** Index into SCENES[scene].steps of the step being drawn. */
    step: number;
    /** The current design is finished. */
    done: boolean;
}

/**
 * The hero as the page scrolls. The first design's dots appear on arrival (`intro`); scrolling
 * moves the drawing to the middle of the screen, draws and colours it, then clears the floor for
 * the second design, whose dots, lines and colours follow in turn.
 */
export const heroStory = (scroll: number, intro: number): HeroStory => {
    const enter = segment(scroll, 0, 0.1);
    // The first design's dots are coloured from the start, so it has no colouring step.
    const first = { dots: Math.max(intro, segment(scroll, 0, 0.05)), lines: segment(scroll, 0.1, 0.42), colour: 0 };
    const second = { dots: segment(scroll, 0.55, 0.63), lines: segment(scroll, 0.63, 0.82), colour: segment(scroll, 0.82, 0.92) };
    const mix = segment(scroll, 0.5, 0.55);
    const scene = mix < 0.5 ? 0 : 1;
    const current = scene === 0 ? first : second;
    const step = current.colour > 0 ? 2 : current.lines > 0 ? 1 : 0;
    const done = scene === 0 ? first.lines >= 1 : second.colour >= 1;
    return { enter, first, second, mix, scene, step, done };
};
