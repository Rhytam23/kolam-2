import React, { useMemo } from 'react';
import { Button } from './ui/Button';
import Diya from './landing/Diya';
import Toran from './landing/Toran';
import { FloorTile, RangoliFrame } from './landing/FloorArt';
import { SCENES, heroStory, type HeroScene } from './landing/heroStory';
import { useKolam, type GuideView } from './KolamContext';
import { makeRadial } from '../utils/radial';
import { PALETTES } from '../lib/colours';
import { useInView, useIntro, useReducedMotion, useScrollProgress, useViewport } from '../hooks/motion';

const NAMES = [
    { word: 'கோலம்', lang: 'ta', label: 'Kolam (Tamil)' },
    { word: 'ముగ్గు', lang: 'te', label: 'Muggu (Telugu)' },
    { word: 'रंगोली', lang: 'hi', label: 'Rangoli (Hindi)' },
    { word: 'আলপনা', lang: 'bn', label: 'Alpana (Bengali)' },
];

const TRUST = ['Free and open source', 'Works on any phone', 'Photos are analysed, never stored'];

interface HeroProps { onStart: () => void; onGenerate: () => void }

const sceneDesign = ({ design }: HeroScene) =>
    makeRadial({ petals: design.petals, layers: design.layers, style: design.style, ...PALETTES[design.palette] });

/** Opens a hero design in the studio and scrolls to its guide, showing the steps or practice. */
const useOpenInGuide = () => {
    const k = useKolam();
    return (scene: HeroScene, view: GuideView) => {
        const { style, petals, layers, palette } = scene.design;
        k.setRadialStyle(style);
        k.setPetals(petals);
        k.setLayers(layers);
        k.setRadialPalette(palette);
        k.setMode('radial');
        k.setGuideView(view);
        // Let the guide render the new design before scrolling to it.
        setTimeout(() => document.getElementById('walkthrough')?.scrollIntoView({ behavior: 'smooth' }), 50);
    };
};

const Heading: React.FC<HeroProps> = ({ onStart, onGenerate }) => (
    <div className="text-center lg:text-left w-full">
        <p className="inline-flex items-center gap-2 rounded-full border border-brass/60 bg-floor/60 px-4 py-1.5 text-sm text-brass-light mb-6">
            <span className="h-2 w-2 rounded-full bg-marigold" aria-hidden />
            Smart India Hackathon 2025 · Problem SIH25107
        </p>
        <p className="font-script text-2xl md:text-3xl text-brass-light mb-4 flex flex-wrap gap-x-5 gap-y-1 justify-center lg:justify-start">
            {NAMES.map(n => <span key={n.word} lang={n.lang} title={n.label}>{n.word}</span>)}
        </p>
        <h1 className="font-heading text-5xl sm:text-6xl xl:text-7xl leading-[1.05] text-rice">
            The Living Art <span className="brass-text">of the Threshold</span>
        </h1>
        <div className="brass-rule max-w-sm mx-auto lg:mx-0 my-6" aria-hidden><Diya className="h-9 w-9 shrink-0" /></div>
        <p className="text-lg md:text-xl text-rice/90 mb-8 max-w-xl mx-auto lg:mx-0">
            SOLVIX reads the dots, lines, symmetry and colours of a kolam, rangoli or alpana, and teaches you to draw it
            again, step by step, the way it has always been made.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
            <Button variant="brass" onClick={onStart}>Read a design from a photo</Button>
            <Button variant="outline-light" onClick={onGenerate}>Design your own</Button>
        </div>
        <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 justify-center lg:justify-start text-sm text-rice/80">
            {TRUST.map(t => (
                <li key={t} className="flex items-center gap-2">
                    <svg viewBox="0 0 16 16" className="h-4 w-4 text-brass-light" aria-hidden><path d="M3 8.5l3 3 7-7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    {t}
                </li>
            ))}
        </ul>
    </div>
);

const LearnButtons: React.FC<{ scene: HeroScene }> = ({ scene }) => {
    const open = useOpenInGuide();
    return (
        <div className="flex flex-wrap justify-center gap-2">
            <Button variant="brass" size="sm" onClick={() => open(scene, 'steps')}>Learn to draw this</Button>
            <Button variant="outline-light" size="sm" onClick={() => open(scene, 'practice')}>Practise it</Button>
        </div>
    );
};

/** For visitors who prefer less motion: the heading beside both finished designs. */
const StillHero: React.FC<HeroProps> = props => {
    const designs = useMemo(() => SCENES.map(sceneDesign), []);
    return (
        <section className="relative floor-bg text-rice">
            <div className="absolute inset-0 floor-dots pointer-events-none" aria-hidden />
            <Toran className="absolute top-16 inset-x-0 z-10 pointer-events-none" />
            <div className="relative container mx-auto px-4 grid lg:grid-cols-2 gap-12 items-center min-h-svh pt-44 pb-16 lg:pt-32">
                <Heading {...props} />
                <div className="grid grid-cols-2 gap-4">
                    {SCENES.map((scene, i) => (
                        <div key={scene.name} className="space-y-3">
                            <FloorTile frame="plaque" label={`A finished ${scene.name.toLowerCase()}`}>
                                <div className="absolute inset-0" style={{ backgroundColor: designs[i].background }}>
                                    <RangoliFrame design={designs[i]} progress={{ dots: 1, lines: 1, colour: 1 }} />
                                </div>
                            </FloorTile>
                            <p className="text-center font-heading text-lg text-brass-light">{scene.name}</p>
                            <LearnButtons scene={scene} />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

const ease = (t: number) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2);

/**
 * The hero. The heading sits beside the first design; scrolling fades the heading away and brings
 * the design to the middle of the screen, where it is drawn the way it is made by hand: dots, then
 * lines, then colour. A festival rangoli follows. Each finished design can be opened in the studio.
 */
const Hero: React.FC<HeroProps> = props => {
    const reduce = useReducedMotion();
    const designs = useMemo(() => SCENES.map(sceneDesign), []);
    const [track, progress] = useScrollProgress<HTMLElement>(!reduce);
    const [stage, inView] = useInView<HTMLDivElement>('0px');
    const intro = useIntro(inView);
    const { w, h } = useViewport();
    if (reduce) return <StillHero {...props} />;

    const story = heroStory(progress, intro);
    const scene = SCENES[story.scene];
    const e = ease(story.enter);
    const wide = w >= 1024;

    // Where the drawing sits: beside the heading at first, then centred, with its caption just below.
    const header = 64;
    const caption = 150;
    const full = Math.max(200, Math.min(w - 32, h - header - caption - 24));
    const blockTop = header + Math.max(8, (h - header - full - caption) / 2);
    const end = { x: w / 2, y: blockTop + full / 2, size: full };
    const start = wide
        ? { x: w / 2 + Math.min(w, 1280) / 4, y: h / 2 + 30, size: Math.min(w * 0.4, h - 250, 560) }
        : end;
    const size = start.size + (end.size - start.size) * e;
    const x = start.x + (end.x - start.x) * e;
    const y = start.y + (end.y - start.y) * e;
    const backdrop = wide ? 1 : 0.2 + 0.8 * e;
    const background = story.mix < 0.5 ? designs[0].background : designs[1].background;

    return (
        <section ref={track} className="relative floor-bg text-rice" style={{ height: '620vh' }} aria-label="Kolam and rangoli being drawn">
            <div className="sticky top-0 h-svh overflow-hidden">
                <div className="absolute inset-0 floor-dots pointer-events-none" aria-hidden />
                <div style={{ opacity: 1 - e, transform: `translateY(${-e * 80}px)` }} className="absolute top-16 inset-x-0 z-10 pointer-events-none">
                    <Toran />
                </div>

                <div
                    ref={stage}
                    className="absolute left-0 top-0"
                    style={{ width: full, height: full, transform: `translate(${x - full / 2}px, ${y - full / 2}px) scale(${size / full})`, transformOrigin: '50% 50%', opacity: backdrop }}
                >
                    <FloorTile frame="plaque" label={`${scene.name}: ${scene.steps[story.step].toLowerCase()}`} className="h-full">
                        <div className="absolute inset-0 transition-colors duration-700" style={{ backgroundColor: background }}>
                            <div className="absolute inset-[2%] glow" style={{ opacity: 1 - story.mix }}>
                                <RangoliFrame design={designs[0]} progress={story.first} rough={false} />
                            </div>
                            <div className="absolute inset-[2%] glow" style={{ opacity: story.mix }}>
                                <RangoliFrame design={designs[1]} progress={story.second} rough={false} />
                            </div>
                        </div>
                    </FloorTile>
                </div>

                <div
                    className="absolute inset-0 container mx-auto px-4 flex items-center lg:pr-[52%]"
                    style={{ opacity: 1 - Math.min(1, e * 1.6), transform: `translateY(${-e * 60}px)`, pointerEvents: e > 0.3 ? 'none' : undefined }}
                    aria-hidden={e > 0.3}
                >
                    <div className="pt-36 lg:pt-24 w-full"><Heading {...props} /></div>
                </div>

                <div className="absolute inset-x-0 px-4 text-center" style={{ top: blockTop + full + 12, opacity: Math.max(0, e * 2 - 1), pointerEvents: e < 0.7 ? 'none' : undefined }}>
                    <p className="font-heading text-2xl text-brass-light" aria-live="polite">{scene.name}</p>
                    <ol className="mt-2 flex flex-wrap justify-center gap-2 text-sm">
                        {scene.steps.map((s, i) => {
                            const finished = i < story.step || story.done;
                            const active = i === story.step && !story.done;
                            return (
                                <li
                                    key={s}
                                    aria-current={active ? 'step' : undefined}
                                    className={`rounded-full border px-3 py-1 transition-colors ${active ? 'bg-brass-light border-brass-light text-floor font-semibold' : finished ? 'border-brass/70 text-brass-light' : 'border-rice/25 text-rice/75'}`}
                                >
                                    {i + 1}. {s}
                                </li>
                            );
                        })}
                    </ol>
                    <div className="mt-3 min-h-[2.5rem] flex items-center justify-center">
                        {story.done
                            ? <LearnButtons scene={scene} />
                            : <p className="text-sm text-rice/75">Keep scrolling to draw it ↓</p>}
                    </div>
                    <button
                        type="button"
                        className="mt-1 text-xs text-rice/75 underline decoration-brass/60 underline-offset-4 hover:text-brass-light"
                        onClick={() => document.getElementById('process')?.scrollIntoView({ behavior: 'smooth' })}
                    >
                        Skip the drawing
                    </button>
                </div>
            </div>
        </section>
    );
};

export default Hero;
