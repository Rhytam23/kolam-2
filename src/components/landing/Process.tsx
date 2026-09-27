import React, { useMemo } from 'react';
import { FloorTile, KolamFrame, RangoliFrame } from './FloorArt';
import { squareDesign } from '../../utils/kolamLogic';
import { makeRadial } from '../../utils/radial';
import { nearestTraditional } from '../../lib/colours';
import { SectionHeading } from '../ui/SectionHeading';
import Reveal from './Reveal';

const RANGOLI_COLOURS = ['#F08A00', '#2E7D32', '#E1AD01'];
const KOLAM_COLOURS = ['#F7F3EA', '#E1AD01', '#E75480', '#F08A00'];

const Step: React.FC<{ n: number; title: string; text: string; children: React.ReactNode }> = ({ n, title, text, children }) => (
    <Reveal delay={(n - 1) * 150}>
        <div className="relative">
            {children}
            {/* a dotted thread leading on to the next step */}
            {n < 3 && <span className="hidden sm:block absolute top-1/2 left-full w-6 border-t-2 border-dotted border-brass/70" aria-hidden />}
        </div>
        <div className="mt-4 flex gap-3">
            <span className="shrink-0 inline-flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-b from-brass-light to-brass text-floor font-semibold shadow">{n}</span>
            <div>
                <p className="font-heading text-xl text-rice">{title}</p>
                <p className="text-sm text-rice/80 mt-1">{text}</p>
            </div>
        </div>
    </Reveal>
);

const Row: React.FC<{ title: string; subtitle: string; children: React.ReactNode }> = ({ title, subtitle, children }) => (
    <div className="mt-20 first:mt-0">
        <Reveal className="mb-8 flex flex-wrap items-baseline gap-x-4 gap-y-1 border-b border-brass/30 pb-3">
            <h3 className="font-heading text-3xl md:text-4xl text-brass-light">{title}</h3>
            <p className="text-rice/80">{subtitle}</p>
        </Reveal>
        <div className="grid sm:grid-cols-3 gap-6">{children}</div>
    </div>
);

/** How floor art is really made, in three steps, for a rangoli, a pulli kolam and a photo. */
const Process: React.FC = () => {
    const rangoli = useMemo(() => makeRadial({ petals: 8, layers: 3, style: 'lotus', background: '#8E3B24', colors: RANGOLI_COLOURS }), []);
    const kolam = useMemo(() => squareDesign(4), []);
    const inner = 'absolute inset-[7%]';

    return (
        <section className="py-24 px-4 text-rice">
            <div className="container mx-auto max-w-6xl">
                <SectionHeading dark title="From Dots to Design" kicker="புள்ளி · கோடு · வண்ணம் — dot · line · colour" />
                <p className="text-center text-rice/85 mb-16 max-w-2xl mx-auto text-lg">
                    Every kolam, rangoli and alpana is made the same way: small dots first, then the lines, then colour. SOLVIX reads and teaches designs in that order.
                </p>

                <Row title="Rangoli" subtitle="A lotus rangoli with 8 petals in each ring">
                    <Step n={1} title="Put down the dots" text="One dot in the centre, then small dots where every petal starts, widens and ends.">
                        <FloorTile frame="plaque" label="Rangoli guide dots on a red floor"><div className={`${inner} glow`}><RangoliFrame design={rangoli} stage="dots" /></div></FloorTile>
                    </Step>
                    <Step n={2} title="Join the dots" text="Join them ring by ring from the centre, each line running from dot to dot.">
                        <FloorTile frame="plaque" label="Rangoli dots being joined into petals"><div className={`${inner} glow`}><RangoliFrame design={rangoli} stage="join" ringsDrawn={2} /></div></FloorTile>
                    </Step>
                    <Step n={3} title="Fill the colours" text={`Fill with ${RANGOLI_COLOURS.map(c => nearestTraditional(c).name.toLowerCase()).join(', ')}, from the centre outwards.`}>
                        <FloorTile frame="plaque" label="Finished coloured rangoli"><div className={`${inner} glow`}><RangoliFrame design={rangoli} stage="colour" /></div></FloorTile>
                    </Step>
                </Row>

                <Row title="Pulli kolam" subtitle="A 4 × 4 kolam drawn with rice flour">
                    <Step n={1} title="Place the pulli" text="Sixteen dots in four even rows, about two finger-widths apart.">
                        <FloorTile frame="plaque" label="Sixteen kolam dots"><div className={`${inner} glow`}><KolamFrame design={kolam} stage="dots" /></div></FloorTile>
                    </Step>
                    <Step n={2} title="Draw the line around them" text="The line loops around every dot without touching it, and crosses between dots.">
                        <FloorTile frame="plaque" label="Kolam lines drawn around the dots"><div className={`${inner} glow`}><KolamFrame design={kolam} stage="line" /></div></FloorTile>
                    </Step>
                    <Step n={3} title="Add colour" text="On festival days each line can be drawn or traced over in its own colour.">
                        <FloorTile frame="plaque" label="Kolam with each line in a different colour"><div className={`${inner} glow`}><KolamFrame design={kolam} stage="colour" colours={KOLAM_COLOURS} /></div></FloorTile>
                    </Step>
                </Row>

                <Row title="Reading a photo" subtitle="What SOLVIX does with a photo of a finished design (sample image)">
                    <Step n={1} title="Your photo" text="Take it from directly above, in daylight, with the whole design in the frame.">
                        <FloorTile frame="plaque" label="Sample photo of a finished rangoli"><div className={inner}><RangoliFrame design={rangoli} stage="colour" showDots={false} showLines={false} /></div></FloorTile>
                    </Step>
                    <Step n={2} title="Dots and lines found" text="It marks the dots that outline each shape and joins them, and finds the 8-fold symmetry.">
                        <FloorTile frame="plaque" label="Dots and outlines found in the photo"><div className={`${inner} glow`}><RangoliFrame design={rangoli} stage="join" ringsDrawn={3} /></div></FloorTile>
                    </Step>
                    <Step n={3} title="Colours named" text="Each colour is matched to its traditional material, so you know what to buy and use.">
                        <FloorTile frame="plaque" label="Recreated rangoli with its colours listed">
                            <div className={`${inner} glow`}><RangoliFrame design={rangoli} stage="colour" showDots={false} /></div>
                            <ul className="absolute bottom-2 left-2 right-2 flex flex-wrap gap-1.5 justify-center">
                                {RANGOLI_COLOURS.map(c => (
                                    <li key={c} className="flex items-center gap-1 rounded-full bg-rice/90 px-2 py-0.5 text-[11px] text-ink">
                                        <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: c }} />{nearestTraditional(c).name}
                                    </li>
                                ))}
                            </ul>
                        </FloorTile>
                    </Step>
                </Row>
            </div>
        </section>
    );
};

export default Process;
