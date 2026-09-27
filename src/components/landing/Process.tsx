import React, { useMemo } from 'react';
import { FloorTile, KolamFrame, RangoliFrame } from './FloorArt';
import { squareDesign } from '../../utils/kolamLogic';
import { makeRadial } from '../../utils/radial';
import { nearestTraditional } from '../../lib/colours';

const RANGOLI_COLOURS = ['#F08A00', '#2E7D32', '#E1AD01'];
const KOLAM_COLOURS = ['#F7F3EA', '#E1AD01', '#E75480', '#F08A00'];

const Step: React.FC<{ n: number; title: string; text: string; children: React.ReactNode }> = ({ n, title, text, children }) => (
    <div>
        {children}
        <figcaption className="mt-3">
            <p className="font-heading text-lg text-kaavi"><span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-kaavi text-paper text-sm font-sans mr-2">{n}</span>{title}</p>
            <p className="text-sm text-muted mt-1">{text}</p>
        </figcaption>
    </div>
);

const Row: React.FC<{ title: string; subtitle: string; children: React.ReactNode }> = ({ title, subtitle, children }) => (
    <div className="mt-14 first:mt-0">
        <h3 className="font-heading text-2xl md:text-3xl text-ink">{title}</h3>
        <p className="text-muted mb-6">{subtitle}</p>
        <div className="grid sm:grid-cols-3 gap-6">{children}</div>
    </div>
);

/** How floor art is really made, in three steps, for a rangoli, a pulli kolam and a photo. */
const Process: React.FC = () => {
    const rangoli = useMemo(() => makeRadial({ petals: 8, layers: 3, style: 'lotus', background: '#8E3B24', colors: RANGOLI_COLOURS }), []);
    const kolam = useMemo(() => squareDesign(4), []);
    const inner = 'absolute inset-[7%]';

    return (
        <section className="py-20 px-4">
            <div className="container mx-auto max-w-6xl">
                <p className="text-center text-kaavi font-semibold tracking-wide mb-2">புள்ளி · கோடு · வண்ணம் — dot · line · colour</p>
                <h2 className="font-heading text-4xl md:text-5xl text-center mb-4 gradient-text">From Dots to Design</h2>
                <p className="text-center text-muted mb-14 max-w-2xl mx-auto">
                    Every kolam, rangoli and alpana is made the same way: small dots first, then the lines, then colour. SOLVIX reads and teaches designs in that order.
                </p>

                <Row title="Rangoli" subtitle="A lotus rangoli with 8 petals in each ring">
                    <Step n={1} title="Put down the dots" text="One dot in the centre, then small dots where every petal starts, widens and ends.">
                        <FloorTile label="Rangoli guide dots on a red floor"><div className={inner}><RangoliFrame design={rangoli} stage="dots" /></div></FloorTile>
                    </Step>
                    <Step n={2} title="Join the dots" text="Join them ring by ring from the centre, each line running from dot to dot.">
                        <FloorTile label="Rangoli dots being joined into petals"><div className={inner}><RangoliFrame design={rangoli} stage="join" ringsDrawn={2} /></div></FloorTile>
                    </Step>
                    <Step n={3} title="Fill the colours" text={`Fill with ${RANGOLI_COLOURS.map(c => nearestTraditional(c).name.toLowerCase()).join(', ')}, from the centre outwards.`}>
                        <FloorTile label="Finished coloured rangoli"><div className={inner}><RangoliFrame design={rangoli} stage="colour" /></div></FloorTile>
                    </Step>
                </Row>

                <Row title="Pulli kolam" subtitle="A 4 × 4 kolam drawn with rice flour">
                    <Step n={1} title="Place the pulli" text="Sixteen dots in four even rows, about two finger-widths apart.">
                        <FloorTile label="Sixteen kolam dots"><div className={inner}><KolamFrame design={kolam} stage="dots" /></div></FloorTile>
                    </Step>
                    <Step n={2} title="Draw the line around them" text="The line loops around every dot without touching it, and crosses between dots.">
                        <FloorTile label="Kolam lines drawn around the dots"><div className={inner}><KolamFrame design={kolam} stage="line" /></div></FloorTile>
                    </Step>
                    <Step n={3} title="Add colour" text="On festival days each line can be drawn or traced over in its own colour.">
                        <FloorTile label="Kolam with each line in a different colour"><div className={inner}><KolamFrame design={kolam} stage="colour" colours={KOLAM_COLOURS} /></div></FloorTile>
                    </Step>
                </Row>

                <Row title="Reading a photo" subtitle="What SOLVIX does with a photo of a finished design (sample image)">
                    <Step n={1} title="Your photo" text="Take it from directly above, in daylight, with the whole design in the frame.">
                        <FloorTile label="Sample photo of a finished rangoli"><div className={inner}><RangoliFrame design={rangoli} stage="colour" showDots={false} showLines={false} /></div></FloorTile>
                    </Step>
                    <Step n={2} title="Dots and lines found" text="It marks the dots that outline each shape and joins them, and finds the 8-fold symmetry.">
                        <FloorTile label="Dots and outlines found in the photo"><div className={inner}><RangoliFrame design={rangoli} stage="join" ringsDrawn={3} /></div></FloorTile>
                    </Step>
                    <Step n={3} title="Colours named" text="Each colour is matched to its traditional material, so you know what to buy and use.">
                        <FloorTile label="Recreated rangoli with its colours listed">
                            <div className={inner}><RangoliFrame design={rangoli} stage="colour" showDots={false} /></div>
                            <ul className="absolute bottom-2 left-2 right-2 flex flex-wrap gap-1.5 justify-center">
                                {RANGOLI_COLOURS.map(c => (
                                    <li key={c} className="flex items-center gap-1 rounded-full bg-paper/90 px-2 py-0.5 text-[11px] text-ink">
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
