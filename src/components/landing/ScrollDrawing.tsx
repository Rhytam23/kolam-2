import React, { useMemo } from 'react';
import { FloorTile, KolamFrame, RangoliFrame, RED_FLOOR } from './FloorArt';
import { SCENES, heroStory } from './heroStory';
import { diamondDesign, makeSingleLine } from '../../utils/kolamLogic';
import { makeRadial } from '../../utils/radial';
import { useInView, useIntro, useReducedMotion, useScrollProgress } from '../../hooks/motion';

const useArt = () => useMemo(() => ({
    kolam: makeSingleLine(diamondDesign(5)),
    rangoli: makeRadial({ petals: 8, layers: 3, style: 'lotus', background: RED_FLOOR, colors: ['#F08A00', '#2E7D32', '#E1AD01'] }),
}), []);

/** The two finished designs side by side, for visitors who prefer less motion. */
const StillArt: React.FC = () => {
    const { kolam, rangoli } = useArt();
    return (
        <div className="lg:h-svh flex items-center pt-10 pb-16 lg:pt-28">
            <div className="grid grid-cols-2 gap-4 w-full">
                <div>
                    <FloorTile frame="plaque" label="A finished sikku kolam in rice flour"><div className="absolute inset-[7%] glow"><KolamFrame design={kolam} /></div></FloorTile>
                    <p className="mt-2 text-center text-sm text-rice/80">Sikku kolam</p>
                </div>
                <div>
                    <FloorTile frame="plaque" label="A finished lotus rangoli"><div className="absolute inset-[5%] glow"><RangoliFrame design={rangoli} /></div></FloorTile>
                    <p className="mt-2 text-center text-sm text-rice/80">Lotus rangoli</p>
                </div>
            </div>
        </div>
    );
};

/**
 * The hero drawing, driven by the scroll: a sikku kolam's dots are laid, its line drawn, then the floor
 * gives way to a lotus rangoli whose dots, rings and colours follow, just as they are made by hand.
 */
const ScrollDrawing: React.FC = () => {
    const reduce = useReducedMotion();
    const { kolam, rangoli } = useArt();
    const [track, progress] = useScrollProgress<HTMLDivElement>(!reduce);
    const [stage, inView] = useInView<HTMLDivElement>('0px');
    const intro = useIntro(inView);
    if (reduce) return <StillArt />;

    const story = heroStory(progress, intro);
    const scene = SCENES[story.scene];
    const current = story.scene === 0 ? story.kolam : story.rangoli;
    const stepDone = (i: number) => i < story.step || (i === story.step && [current.dots, current.lines, current.colour][i] >= 1);

    return (
        <div ref={track} className="relative h-[240vh]">
            <div ref={stage} className="sticky top-0 h-svh flex flex-col items-center justify-center pt-28 pb-6">
                <div className="w-full" style={{ maxWidth: 'min(34rem, calc(100svh - 19rem))' }}>
                    <FloorTile frame="plaque" label={`${scene.name}: ${scene.steps[story.step].toLowerCase()}`}>
                        <div className="absolute inset-[7%] glow" style={{ opacity: 1 - story.mix }}>
                            <KolamFrame design={kolam} progress={story.kolam} />
                        </div>
                        <div className="absolute inset-[5%] glow" style={{ opacity: story.mix }}>
                            <RangoliFrame design={rangoli} progress={story.rangoli} />
                        </div>
                    </FloorTile>
                </div>
                <div className="mt-5 text-center">
                    <p className="font-heading text-2xl text-brass-light" aria-live="polite">{scene.name}</p>
                    <ol className="mt-2 flex flex-wrap justify-center gap-2 text-sm">
                        {scene.steps.map((s, i) => {
                            const active = i === story.step && !stepDone(i);
                            return (
                                <li
                                    key={s}
                                    aria-current={active ? 'step' : undefined}
                                    className={`rounded-full border px-3 py-1 transition-colors ${active ? 'bg-brass-light border-brass-light text-floor font-semibold' : stepDone(i) ? 'border-brass/70 text-brass-light' : 'border-rice/25 text-rice/75'}`}
                                >
                                    {i + 1}. {s}
                                </li>
                            );
                        })}
                    </ol>
                    <p className={`mt-3 text-sm text-rice/75 transition-opacity ${progress < 0.03 ? 'opacity-100' : 'opacity-0'}`} aria-hidden>
                        Scroll down to draw it ↓
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ScrollDrawing;
