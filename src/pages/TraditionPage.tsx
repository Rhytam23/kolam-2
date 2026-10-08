import React, { useEffect, useMemo, useState } from 'react';
import { Button } from '../components/ui/Button';
import { SectionHeading } from '../components/ui/SectionHeading';
import KolamGenerator, { type StudioScope } from '../components/KolamGenerator';
import DrawGuide from '../components/DrawGuide';
import TraditionGallery from '../components/TraditionGallery';
import { KindsOfKolam } from '../components/About';
import { useKolam, type GuideView } from '../components/KolamContext';
import { DesignFrame, FloorTile } from '../components/landing/FloorArt';
import CultureDivider from '../components/culture/CultureDivider';
import { Ornament } from '../components/culture/Ornaments';
import Doorway from '../components/culture/Doorway';
import Greeting from '../components/culture/Greeting';
import { useCulture } from '../components/culture/CultureContext';
import Reveal from '../components/landing/Reveal';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { applyPreset, presetBackground } from '../data/designs';
import { readerPath, traditionBySlug, type Tradition } from '../data/traditions';
import { DEFAULT_THEME, applyTheme } from '../lib/theme';
import { headingFont } from '../lib/fonts';
import { culturePatterns, kitFor } from '../lib/culture';
import { Link, currentSearch, navigate } from '../lib/router';
import { useTimeline } from '../hooks/motion';

const segment = (t: number, from: number, to: number) => Math.min(1, Math.max(0, (t - from) / (to - from)));

/** The signature design, drawn as by hand when the page opens: dots, then lines, then colour. */
const LiveDesign: React.FC<{ tradition: Tradition }> = ({ tradition: t }) => {
    const [round, setRound] = useState(0);
    const time = useTimeline(7000, `${t.slug}-${round}`);
    const spec = t.designs[0].spec;
    const progress = { dots: segment(time, 0, 0.25), lines: segment(time, 0.28, 0.78), colour: segment(time, 0.82, 1) };
    const step = progress.colour > 0 ? 'Colour' : progress.lines > 0 ? 'Lines' : 'Dots';
    return (
        <div className="w-full max-w-lg mx-auto">
            <FloorTile frame="plaque" label={`${t.designs[0].title} being drawn: ${step.toLowerCase()}`}>
                <div className="absolute inset-0" style={{ backgroundColor: presetBackground(spec) }}>
                    <div className="absolute inset-[4%] glow"><DesignFrame spec={spec} progress={progress} rough={false} /></div>
                </div>
            </FloorTile>
            <div className="mt-3 flex items-center justify-center gap-3 text-sm text-rice/85">
                <span>{t.designs[0].title}</span>
                <span aria-hidden>·</span>
                <span className="text-brass-light font-semibold" aria-live="polite">{time < 1 ? step : 'Finished'}</span>
                {time >= 1 && <button type="button" className="underline decoration-brass/60 underline-offset-4 hover:text-brass-light" onClick={() => setRound(r => r + 1)}>Draw it again</button>}
            </div>
        </div>
    );
};

const Fact: React.FC<{ title: string; children: React.ReactNode; delay?: number }> = ({ title, children, delay }) => (
    <Reveal delay={delay} className="rounded-2xl border border-brass/40 bg-floor/60 p-6">
        <p className="font-heading text-xl text-brass-light">{title}</p>
        <p className="mt-2 text-rice/90 leading-relaxed">{children}</p>
    </Reveal>
);

/** One page for one art form, in its own colours. */
const TraditionPage: React.FC<{ tradition: Tradition }> = ({ tradition: t }) => {
    const k = useKolam();
    const kit = useCulture();

    useEffect(() => {
        applyTheme(t.theme, headingFont(t.script.lang), culturePatterns(kitFor(t.slug), t.theme));
        return () => applyTheme(DEFAULT_THEME);
    }, [t]);

    // Open the page on its signature design, or on the one asked for (?design=2). A design read from a
    // photo (?from=photo) is kept as it is.
    useEffect(() => {
        const search = new URLSearchParams(currentSearch());
        if (search.get('from') === 'photo') return;
        // A drawing traced from a photo belongs to the art form it was read in: it must not follow the visitor to another.
        k.setTraced(null);
        applyPreset(k, (t.designs[Number(search.get('design'))] ?? t.designs[0]).spec);
    }, [t.slug]); // eslint-disable-line react-hooks/exhaustive-deps

    const scope: StudioScope = useMemo(() => ({
        title: `Make your own ${t.name.toLowerCase()}`,
        intro: `Choose a design, change its size and colours, then follow the guide below to draw it. Only the patterns and colours of ${t.name.toLowerCase()} are offered here.`,
        modes: t.modes,
        radialStyles: t.radialStyles,
        patterns: t.patterns,
        palettes: t.palettes,
        presets: t.designs,
    }), [t]);

    const openGuide = (view: GuideView) => {
        k.setGuideView(view);
        navigate(`/${t.slug}#walkthrough`);
    };
    const related = t.related && traditionBySlug(t.related.slug);

    return (
        <>
            <section className="relative floor-bg text-rice">
                <div className="absolute inset-0 floor-dots pointer-events-none" aria-hidden />
                <Doorway className="absolute top-16 inset-x-0 z-10 pointer-events-none" />
                <div className={`relative container mx-auto px-4 ${kit.doorway === 'toran' ? 'pt-44' : 'pt-36'} pb-16 grid lg:grid-cols-2 gap-12 items-center`}>
                    <div className="text-center lg:text-left">
                        <Greeting className="mb-3" />
                        <p className="text-sm uppercase tracking-widest text-brass-light">{t.region}</p>
                        <p lang={t.script.lang} className="mt-3 font-script text-5xl md:text-6xl text-brass-light leading-tight">{t.script.word}</p>
                        <h1 className="font-heading text-5xl md:text-6xl text-rice mt-1">{t.name}</h1>
                        <div className="brass-rule max-w-sm mx-auto lg:mx-0 my-6" aria-hidden><Ornament id={kit.ornament} className="h-9 w-9 shrink-0" /></div>
                        <p className="text-lg text-rice/90 max-w-xl mx-auto lg:mx-0">{t.about[0]}</p>
                        <div className="mt-8 flex flex-col sm:flex-row sm:flex-wrap gap-3 justify-center lg:justify-start">
                            <Button variant="brass" onClick={() => openGuide('steps')}>Learn to {kit.verb} it</Button>
                            <Button variant="outline-light" onClick={() => openGuide('practice')}>Practise it</Button>
                            <Button variant="outline-light" onClick={() => navigate(`/${t.slug}#generator`)}>Make your own</Button>
                            <Button variant="outline-light" onClick={() => navigate(readerPath(t.slug))}>Read a photo</Button>
                        </div>
                    </div>
                    <LiveDesign tradition={t} />
                </div>
            </section>

            <div className="floor-bg">
                <CultureDivider tone="rice" spacing={40} />
                <section className="py-16 px-4 text-rice">
                    <div className="container mx-auto max-w-6xl">
                        <SectionHeading dark title={`About ${t.name.toLowerCase()}`} className="mb-10" />
                        <div className="grid md:grid-cols-3 gap-5">
                            <Fact title="When">{t.occasion}</Fact>
                            <Fact title="Made with" delay={100}>{t.materials}</Fact>
                            <Fact title="Motifs" delay={200}>{t.motifs}</Fact>
                        </div>
                        <Reveal className="mt-10 max-w-3xl mx-auto space-y-4 text-lg leading-relaxed text-rice/90">
                            {t.about.slice(1).map(p => <p key={p}>{p}</p>)}
                            {related && (
                                <p className="rounded-xl border border-brass/40 px-4 py-3 text-base">
                                    <strong className="text-brass-light">Not to be confused: </strong>
                                    {t.related!.note} <Link to={`/${related.slug}`} className="underline decoration-brass/60 underline-offset-4 hover:text-brass-light">See {related.name}</Link>.
                                </p>
                            )}
                        </Reveal>
                    </div>
                </section>
                {t.slug === 'kolam' && <div className="pb-16"><KindsOfKolam /></div>}
                <CultureDivider tone="rice" spacing={40} className="pb-10" />
            </div>

            <div data-paper className="paper-bg">
                <div id="generator" className="scroll-mt-16"><ErrorBoundary name="design studio"><KolamGenerator scope={scope} /></ErrorBoundary></div>
                <CultureDivider />
                <div id="walkthrough" className="scroll-mt-16"><ErrorBoundary name="drawing guide"><DrawGuide /></ErrorBoundary></div>
            </div>

            <section className="floor-bg py-20 px-4">
                <CultureDivider tone="rice" spacing={40} className="mb-12" />
                <div className="container mx-auto max-w-6xl">
                    <SectionHeading dark title="More art forms of India" className="mb-10" />
                    <TraditionGallery except={t.slug} />
                </div>
            </section>
        </>
    );
};

export default TraditionPage;
