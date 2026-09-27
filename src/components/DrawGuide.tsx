import React, { useEffect, useMemo, useState } from 'react';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import ColourGuide from './ColourGuide';
import { useKolam } from './KolamContext';
import { SYMMETRY_LABELS, designDots, loopPaths, rowPattern, type SymmetryName } from '../utils/kolamLogic';
import { ringGuidePoints, ringPath, ringStyle, type Motif } from '../utils/radial';
import { layerTransform, tracedBackground, tracedSize } from '../utils/traced';
import { artworkColours, kolamDotColour } from '../lib/artwork';
import { isDark, nearestGround, nearestTraditional } from '../lib/colours';

interface Step {
    title: string;
    text: string;
    tip?: string;
    colours?: boolean;
    picture: React.ReactNode;
}

const UNIT = 40;
const PAD = 1;
const HIGHLIGHT = '#C62839';
const STEP_MS = 3500;

const MOTIF_NAMES: Record<Motif, string> = {
    lotus: 'lotus petals', leaf: 'pointed leaves', drop: 'rounded petals', loop: 'loops', dot: 'dots',
};

const startOf = (path: string) => {
    const match = /^M(-?[\d.]+) (-?[\d.]+)/.exec(path);
    return match ? { x: Number(match[1]), y: Number(match[2]) } : null;
};

/** Shows the part of a pathLength=1 path between fractions `from` and `to`. */
const partDash = (from: number, to: number) => `0 ${from} ${to - from} 1`;

const DrawGuide: React.FC = () => {
    const k = useKolam();
    const { mode, design, loops, symmetry, radial, traced } = k;
    const [step, setStep] = useState(0);
    const [playing, setPlaying] = useState(false);
    const colours = artworkColours(k);

    const steps = useMemo<{ viewBox: string; list: Step[] }>(() => {
        const ground = nearestGround(colours.background);

        if (mode === 'radial') {
            const rings = [...radial.rings].reverse(); // draw from the centre outwards
            const bg = <rect x={-1.1} y={-1.1} width={2.2} height={2.2} fill={radial.background} />;
            const guideColour = isDark(radial.background) ? '#F7F3EA' : '#3B2416';
            const circles = (
                <g fill="none" stroke={guideColour} strokeOpacity={0.35} strokeWidth={0.008} strokeDasharray="0.03 0.03">
                    {radial.rings.map((r, i) => <circle key={i} r={r.outer} />)}
                </g>
            );
            const centre = <circle r={0.09} fill={radial.centre} stroke={radial.outline} strokeWidth={0.012} />;
            const outline = (ringIndex: number, colour: string) => (
                <path d={ringPath(rings[ringIndex])} fill="none" stroke={colour} strokeWidth={0.014} strokeLinejoin="round" />
            );
            const guideRing = radial.rings.find(r => r.motif !== 'dot') ?? radial.rings[0];
            return {
                viewBox: '-1.1 -1.1 2.2 2.2',
                list: [
                    {
                        title: '1. Prepare the ground',
                        text: `Sweep the floor and sprinkle water so the powder sticks. This design is drawn on a ${ground.name.toLowerCase()}.`,
                        tip: ground.material,
                        picture: bg,
                    },
                    {
                        title: '2. Centre and guide circles',
                        text: `Mark the centre, then draw ${radial.rings.length} light guide circle${radial.rings.length > 1 ? 's' : ''}, one for the edge of each ring.`,
                        tip: 'Tie a piece of chalk to a string and hold the other end at the centre to use it as a compass.',
                        picture: <>{bg}{circles}{centre}</>,
                    },
                    {
                        title: `3. Mark ${guideRing.count} points`,
                        text: `Divide the circle into ${guideRing.count} equal parts, ${(360 / guideRing.count).toFixed(guideRing.count % 8 === 0 || 360 % guideRing.count === 0 ? 0 : 1)}° apart. The petals will point at these marks.`,
                        tip: `Fold a paper circle in half again and again (or into ${guideRing.count}) to find the marks, then copy them onto the floor.`,
                        picture: <>{bg}{circles}{centre}{ringGuidePoints(guideRing).map((p, i) => <circle key={i} cx={p.x} cy={p.y} r={0.025} fill={HIGHLIGHT} />)}</>,
                    },
                    ...rings.map((ring, i) => ({
                        title: `${4 + i}. Ring ${i + 1}: ${ring.count} ${MOTIF_NAMES[ring.motif]}`,
                        text: `${i === 0 ? 'Start next to the centre. ' : ''}Draw ${ring.count} ${MOTIF_NAMES[ring.motif]} of the same size, `
                            + (ring.count !== guideRing.count ? `${ring.count / guideRing.count > 1 ? 'two for every mark' : 'spaced evenly'}.`
                                : ring.offset ? 'each one pointing between two marks.' : 'each one pointing at a mark.'),
                        tip: 'Draw the outline of every shape first; colour comes at the end.',
                        picture: <>{bg}{circles}{centre}{rings.slice(0, i).map((_, j) => <g key={j}>{outline(j, guideColour)}</g>)}{outline(i, HIGHLIGHT)}</>,
                    })),
                    {
                        title: `${4 + rings.length}. Fill the colours`,
                        text: 'Fill each ring with its colour, working from the centre outwards so you never step or lean on finished parts.',
                        tip: radial.rings.some(r => !r.filled) ? 'Alpana is painted with rice paste (pithali) using a finger or a small piece of cloth.' : 'Pour powder into a paper cone or pinch it between thumb and fingers to fill evenly.',
                        colours: true,
                        picture: <>{bg}{radial.rings.map((r, i) => { const s = ringStyle(radial, r); return <path key={i} d={ringPath(r)} fill={s.fill} stroke={s.stroke} strokeWidth={s.strokeWidth} strokeLinejoin="round" />; })}{centre}</>,
                    },
                ],
            };
        }

        if (mode === 'traced' && traced) {
            const { w, h } = tracedSize(traced);
            const bg = <rect width={w} height={h} fill={tracedBackground(traced)} />;
            const layers = traced.layers;
            const outlines = (from: number) => (
                <g transform={layerTransform(traced)} fill="none" stroke="#3B2416" strokeOpacity={0.55} strokeWidth={1} vectorEffect="non-scaling-stroke">
                    {layers.slice(from).map((l, i) => <path key={i} d={l.path} vectorEffect="non-scaling-stroke" />)}
                </g>
            );
            const filled = (to: number) => (
                <g transform={layerTransform(traced)}>{layers.slice(0, to).map((l, i) => <path key={i} d={l.path} fill={l.color} fillRule="evenodd" />)}</g>
            );
            return {
                viewBox: `0 0 ${w} ${h}`,
                list: [
                    {
                        title: '1. Prepare the ground',
                        text: `Your photo was drawn on a ${ground.name.toLowerCase()}. Sweep and wet the floor, or pick paper of a similar colour.`,
                        tip: ground.material,
                        picture: bg,
                    },
                    {
                        title: '2. Sketch the outline',
                        text: 'Copy the outline lightly with chalk first. Start with the biggest shapes and check the spacing before adding details.',
                        tip: 'For round designs, find the centre and use a string as a compass for the circles.',
                        picture: <>{bg}{outlines(0)}</>,
                    },
                    ...layers.map((layer, i) => {
                        const c = nearestTraditional(layer.color);
                        return {
                            title: `${3 + i}. Fill with ${c.name.toLowerCase()}`,
                            text: `Fill the ${i === 0 ? 'largest' : 'next'} coloured areas with ${c.name.toLowerCase()}.`,
                            tip: c.material,
                            picture: <>{bg}{filled(i + 1)}{outlines(i + 1)}</>,
                        };
                    }),
                    {
                        title: `${3 + layers.length}. Finished`,
                        text: 'Compare with your photo and touch up the edges with a fine line of powder.',
                        colours: true,
                        picture: <>{bg}{filled(layers.length)}</>,
                    },
                ],
            };
        }

        // Dot kolam
        const width = (design.cols - 1 + 2 * PAD) * UNIT;
        const height = (design.rows - 1 + 2 * PAD) * UNIT;
        const paths = loopPaths(design, UNIT, PAD);
        const stroke = (i: number) => colours.colors[i % colours.colors.length];
        const dotColour = kolamDotColour(colours.background);
        const dots = designDots(design);
        const bg = <rect width={width} height={height} fill={colours.background} />;
        const pulli = <g fill={dotColour}>{dots.map(d => <circle key={`${d.x},${d.y}`} cx={(PAD + d.x) * UNIT} cy={(PAD + d.y) * UNIT} r={UNIT * 0.08} />)}</g>;
        const line = (d: string, colour: string, extra: React.SVGProps<SVGPathElement> = {}) => (
            <path d={d} fill="none" stroke={colour} strokeWidth={UNIT * 0.07} strokeLinecap="round" strokeLinejoin="round" pathLength={1} {...extra} />
        );
        const startMarker = (d: string) => {
            const s = startOf(d);
            return s && <circle cx={s.x} cy={s.y} r={UNIT * 0.16} fill="none" stroke={HIGHLIGHT} strokeWidth={UNIT * 0.04} />;
        };
        const axes: Partial<Record<SymmetryName, [number, number, number, number]>> = {
            mirrorVertical: [width / 2, 0, width / 2, height],
            mirrorHorizontal: [0, height / 2, width, height / 2],
            diagonal: [0, 0, width, height],
            antiDiagonal: [width, 0, 0, height],
        };

        const PARTS = 4;
        const lineSteps: Step[] = loops === 1
            ? Array.from({ length: PARTS }, (_, p) => ({
                title: `Draw the line: part ${p + 1} of ${PARTS}`,
                text: p === 0
                    ? 'Start at the circle and follow the line around the dots, curving at the edges. Never touch a dot.'
                    : p === PARTS - 1 ? 'Finish the line where you started. The whole kolam is a single closed line.' : 'Keep going without lifting your hand; it is all one line.',
                tip: 'Let the rice flour fall in a thin stream from between your thumb and forefinger.',
                picture: <>{bg}{line(paths[0], stroke(0), { strokeDasharray: partDash(0, p / PARTS) })}{line(paths[0], HIGHLIGHT, { strokeDasharray: partDash(p / PARTS, (p + 1) / PARTS) })}{pulli}{p === 0 && startMarker(paths[0])}</>,
            }))
            : paths.map((d, i) => ({
                title: `Draw line ${i + 1} of ${loops}`,
                text: `Start at the circle and go around the dots this line visits until you are back where you started.${i > 0 ? ' Cross the lines already drawn exactly between two dots.' : ''}`,
                tip: 'Where two lines meet between dots, they either cross straight over or bend back like a mirror.',
                picture: <>{bg}{paths.slice(0, i).map((q, j) => <g key={j}>{line(q, stroke(j))}</g>)}<g key={`${step}-${i}`}>{line(d, HIGHLIGHT, { className: 'kolam-draw' })}</g>{pulli}{startMarker(d)}</>,
            }));

        return {
            viewBox: `0 0 ${width} ${height}`,
            list: [
                {
                    title: 'Prepare the ground',
                    text: `Kolams are drawn at dawn on a swept, wet threshold. This design is drawn on a ${ground.name.toLowerCase()}.`,
                    tip: ground.material,
                    picture: bg,
                },
                {
                    title: 'Place the pulli (dots)',
                    text: `Put ${dots.length} dots in rows of ${rowPattern(design)}, evenly spaced. Start with the middle row so the grid stays straight.`,
                    tip: 'Keep the gap between dots about two finger-widths; even spacing is what makes the curves look smooth.',
                    picture: <>{bg}{pulli}</>,
                },
                {
                    title: 'See the symmetry',
                    text: symmetry.length
                        ? `The design looks the same after a ${symmetry.map(s => SYMMETRY_LABELS[s].toLowerCase()).join(', ')}. Use this to check your lines as you go.`
                        : 'This design has no mirror or rotational symmetry, so follow each line carefully.',
                    picture: <>{bg}<g stroke={HIGHLIGHT} strokeWidth={2} strokeDasharray="6 6">{symmetry.map(s => axes[s] && <line key={s} x1={axes[s]![0]} y1={axes[s]![1]} x2={axes[s]![2]} y2={axes[s]![3]} />)}</g>{pulli}</>,
                },
                ...lineSteps,
                {
                    title: 'Colour and finish',
                    text: 'Go over any thin places, then add colour: powders along or beside the lines, and flowers at the centre if you like.',
                    colours: true,
                    picture: <>{bg}{paths.map((d, i) => <g key={i}>{line(d, stroke(i))}</g>)}{pulli}</>,
                },
            ].map((s, i) => ({ ...s, title: s.title.match(/^\d/) ? s.title : `${i + 1}. ${s.title}` })),
        };
    }, [mode, design, loops, symmetry, radial, traced, colours, step]);

    const signature = `${mode}|${JSON.stringify(design)}|${radial.rings.length}|${radial.rings[0]?.count}|${traced?.layers.length}`;
    useEffect(() => { setStep(0); setPlaying(false); }, [signature]);

    const last = steps.list.length - 1;
    const current = steps.list[Math.min(step, last)];

    useEffect(() => {
        if (!playing) return;
        if (step >= last) { setPlaying(false); return; }
        const timer: ReturnType<typeof setTimeout> = setTimeout(() => setStep(s => s + 1), STEP_MS);
        return () => clearTimeout(timer);
    }, [playing, step, last]);

    return (
        <section className="py-20 px-4">
            <div className="container mx-auto max-w-5xl">
                <h2 className="font-heading text-4xl md:text-5xl text-center mb-4 gradient-text">Draw It Yourself</h2>
                <p className="text-center text-muted mb-12 max-w-2xl mx-auto">
                    Step by step instructions for the design in the studio above: dots or guide circles first, then each line or ring, then colour.
                </p>
                <div className="grid md:grid-cols-2 gap-10 items-start">
                    <div className="kolam-border rounded-2xl p-3 bg-white/60">
                        <svg viewBox={steps.viewBox} className="w-full aspect-square" role="img" aria-label={current.title}>{current.picture}</svg>
                    </div>
                    <div className="space-y-6">
                        <Card className="space-y-3">
                            <p className="text-xs uppercase tracking-widest text-muted">Step {Math.min(step, last) + 1} of {last + 1}</p>
                            <h3 className="font-heading text-2xl text-kaavi">{current.title}</h3>
                            <p className="text-ink leading-relaxed">{current.text}</p>
                            {current.tip && <p className="text-sm text-muted border-l-4 border-marigold pl-3">{current.tip}</p>}
                            {current.colours && <ColourGuide colours={colours.colors} background={colours.background} shares={colours.shares} firstIsLine={mode === 'kolam'} />}
                        </Card>
                        <div className="flex justify-center gap-3">
                            <Button variant="secondary" size="sm" onClick={() => setStep(s => Math.max(0, s - 1))} disabled={step === 0}>Previous</Button>
                            <Button size="sm" onClick={() => { if (step >= last) setStep(0); setPlaying(p => step >= last || !p); }}>
                                {playing ? 'Pause' : step >= last ? 'Start again' : 'Play'}
                            </Button>
                            <Button variant="secondary" size="sm" onClick={() => setStep(s => Math.min(last, s + 1))} disabled={step >= last}>Next</Button>
                        </div>
                        <div className="flex justify-center flex-wrap gap-1.5">
                            {steps.list.map((s, i) => (
                                <button key={s.title} aria-label={`Go to ${s.title}`} onClick={() => setStep(i)} className={`h-2.5 w-2.5 rounded-full ${i === step ? 'bg-kaavi' : 'bg-kaavi/20'}`} />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default DrawGuide;
