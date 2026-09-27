import React, { useEffect, useMemo, useState } from 'react';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import ColourGuide from './ColourGuide';
import { useKolam } from './KolamContext';
import { SYMMETRY_LABELS, designDots, loopPaths, rowPattern, type SymmetryName } from '../utils/kolamLogic';
import { DOT_RADIUS, guideDotColour, radialGuideDots, ringPath, ringStyle, type Motif } from '../utils/radial';
import { layerTransform, tracedBackground, tracedDots, tracedSize } from '../utils/traced';
import { artworkColours, kolamDotColour } from '../lib/artwork';
import { nearestGround, nearestTraditional } from '../lib/colours';
import { SectionHeading } from './ui/SectionHeading';
import Practice from './Practice';

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
    lotus: 'lotus petals', leaf: 'pointed leaves', drop: 'rounded petals', loop: 'loops', dot: 'dots', curl: 'curls',
};

const startOf = (path: string) => {
    const match = /^M(-?[\d.]+) (-?[\d.]+)/.exec(path);
    return match ? { x: Number(match[1]), y: Number(match[2]) } : null;
};

/** Shows the part of a pathLength=1 path between fractions `from` and `to`. */
const partDash = (from: number, to: number) => `0 ${from} ${to - from} 1`;

const DrawGuide: React.FC = () => {
    const k = useKolam();
    const { mode, design, loops, symmetry, radial, traced, guideView, setGuideView } = k;
    const [step, setStep] = useState(0);
    const [playing, setPlaying] = useState(false);
    const colours = artworkColours(k);

    const steps = useMemo<{ viewBox: string; list: Step[] }>(() => {
        const ground = nearestGround(colours.background);

        if (mode === 'radial') {
            // Work from the centre outwards. Rings of plain dots are not drawn: they are coloured at the end.
            const rings = [...radial.rings].reverse().filter(r => r.motif !== 'dot');
            const dotColour = guideDotColour(radial.background);
            const bg = <rect x={-1.1} y={-1.1} width={2.2} height={2.2} fill={radial.background} />;
            const guideDots = radialGuideDots(radial);
            const dotsOf = (
                <g fill={dotColour}>
                    {guideDots.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r={p.ring < 0 ? DOT_RADIUS * 1.3 : DOT_RADIUS} />)}
                </g>
            );
            const joined = (ring: (typeof rings)[number], colour: string, animate = false) => (
                <path d={ringPath(ring)} fill="none" stroke={colour} strokeWidth={0.014} strokeLinejoin="round" pathLength={1} className={animate ? 'kolam-draw' : undefined} />
            );
            // Guide dots are numbered by position among all rings, plain dot rings included.
            const allRings = [...radial.rings].reverse();
            const perRing = rings.map(r => guideDots.filter(d => d.ring === allRings.indexOf(r)).length);
            const border = guideDots.length - 1 - perRing.reduce((a, b) => a + b, 0);
            const dotsPerRing = perRing.map((n, i) => `${n} for ring ${i + 1}`).join(', ') + (border > 0 ? `, and ${border} more to be coloured` : '');
            const total = guideDots.length;
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
                        title: '2. Put down the small dots',
                        text: `Start with one dot in the centre, then place ${total - 1} small dots around it: ${dotsPerRing}. Dots of the same ring are all the same distance from the centre.`,
                        tip: 'Take a pinch of powder and touch it to the floor for each dot. Place opposite dots in pairs so the pattern stays even.',
                        picture: <>{bg}{dotsOf}</>,
                    },
                    ...rings.map((ring, i) => ({
                        title: `${3 + i}. Join the dots: ring ${i + 1}`,
                        text: ring.motif === 'curl'
                            ? `Wind a curl round each dot of this ring: ${ring.count} curls, pointing ${ring.flip ? 'in towards the centre' : 'outwards'}. Start at the pointed tip, come down one side, round the dot, and curl inwards.`
                            : ring.count === 1
                                ? 'Join the dots round the centre into a circle.'
                                : `${i === 0 ? 'Starting next to the centre, join' : 'Join'} the dots of this ring into ${ring.count} ${MOTIF_NAMES[ring.motif]}. Each line runs from dot to dot${ring.motif === 'dot' ? '; here the dots themselves are the decoration.' : ', curving gently between them.'}`,
                        tip: ring.motif === 'curl' ? 'Keep every curl the same size; the dots keep them evenly spaced.' : ring.filled ? 'Draw only the outline now; colour comes at the end.' : ring.double ? 'Draw each outline through the dots, then a second line just inside it. Keep both thin and even.' : 'Keep the line thin and even; alpana outlines are the design itself.',
                        picture: <>{bg}{rings.slice(0, i).map((r, j) => <g key={j}>{joined(r, dotColour)}</g>)}<g key={`${step}-${i}`}>{joined(ring, HIGHLIGHT, true)}</g>{dotsOf}</>,
                    })),
                    {
                        title: `${3 + rings.length}. Fill the colours`,
                        text: 'Fill each shape with its colour, working from the centre outwards so you never lean on finished parts. The dots disappear under the colour.',
                        tip: radial.rings.some(r => !r.filled) ? 'For alpana, trace the lines with rice paste (pithali) using a fingertip or a small piece of cloth.' : 'Pour powder into a paper cone or pinch it between thumb and fingers to fill evenly.',
                        colours: true,
                        picture: <>{bg}{radial.rings.map((r, i) => { const st = ringStyle(radial, r); return <path key={i} d={ringPath(r)} fill={st.fill} stroke={st.stroke} strokeWidth={st.strokeWidth} strokeLinejoin="round" />; })}<circle r={0.09} fill={radial.centre} stroke={radial.outline} strokeWidth={0.012} /></>,
                    },
                ],
            };
        }

        if (mode === 'traced' && traced) {
            const { w, h } = tracedSize(traced);
            const bg = <rect width={w} height={h} fill={tracedBackground(traced)} />;
            const layers = traced.layers;
            const dotColour = guideDotColour(tracedBackground(traced));
            const guideDots = tracedDots(traced);
            const dotsLayer = <g fill={dotColour}>{guideDots.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r={w * 0.005} />)}</g>;
            const outlines = (from: number, colour = dotColour) => (
                <g transform={layerTransform(traced)} fill="none" stroke={colour} strokeOpacity={0.8} strokeWidth={1.5}>
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
                        title: '2. Put down the small dots',
                        text: `Copy the ${guideDots.length} small dots that mark the outline of every shape. Start from the middle of the design and work outwards.`,
                        tip: 'Look at your photo often and compare the gaps between dots; small, light dots are easy to cover later.',
                        picture: <>{bg}{dotsLayer}</>,
                    },
                    {
                        title: '3. Join the dots',
                        text: 'Join neighbouring dots with a thin line to bring out each shape. Follow the photo for curves between the dots.',
                        tip: 'Draw the outline with a thin stream of powder or rice paste; colour comes after.',
                        picture: <>{bg}{outlines(0, HIGHLIGHT)}{dotsLayer}</>,
                    },
                    ...layers.map((layer, i) => {
                        const c = nearestTraditional(layer.color);
                        return {
                            title: `${4 + i}. Fill with ${c.name.toLowerCase()}`,
                            text: `Fill the ${i === 0 ? 'largest' : 'next'} areas with ${c.name.toLowerCase()}, staying inside the lines.`,
                            tip: c.material,
                            picture: <>{bg}{filled(i + 1)}{outlines(i + 1)}</>,
                        };
                    }),
                    {
                        title: `${4 + layers.length}. Finished`,
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
                    ? 'With all the dots in place, start at the circle and draw the line between the dots, looping around each one. In a pulli kolam the line goes around the dots, never over them.'
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
                <SectionHeading title="Draw It Yourself" className="mb-4" />
                <p className="text-center text-muted mb-8 max-w-2xl mx-auto">
                    Step by step instructions for the design in the studio above: dots first, then each line or ring, then colour. Then practise it by tapping the dots in order.
                </p>
                <div className="flex justify-center gap-2 mb-10" role="tablist" aria-label="Guide or practice">
                    {([['steps', 'Watch the steps'], ['practice', 'Practise it yourself']] as const).map(([id, label]) => (
                        <button
                            key={id}
                            type="button"
                            role="tab"
                            aria-selected={guideView === id}
                            onClick={() => setGuideView(id)}
                            className={`px-5 py-2 rounded-full text-sm font-semibold border transition-colors ${guideView === id ? 'bg-kaavi text-paper border-kaavi' : 'border-kaavi/30 text-kaavi bg-white/70 hover:border-kaavi'}`}
                        >
                            {label}
                        </button>
                    ))}
                </div>
                {guideView === 'practice' ? <Practice /> : (
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
                )}
            </div>
        </section>
    );
};

export default DrawGuide;
