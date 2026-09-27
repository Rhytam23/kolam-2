import React, { useMemo, useState } from 'react';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { Label } from './ui/Label';
import KolamSvg from './KolamSvg';
import ColourGuide from './ColourGuide';
import { useKolam, type Mode, type Shape } from './KolamContext';
import { SYMMETRY_LABELS, designToSvg, diamondDesign, makeSingleLine, squareDesign } from '../utils/kolamLogic';
import { RADIAL_STYLES, makeRadial, radialToSvg, type RadialStyle } from '../utils/radial';
import type { Design } from '../types/kolam';
import { PALETTES, type PaletteName } from '../lib/colours';
import { artworkColours, artworkSvg, kolamDotColour } from '../lib/artwork';
import { downloadBlob, downloadKolamFile, svgToPng } from '../lib/kolamFile';
import { SectionHeading } from './ui/SectionHeading';

const Toggle: React.FC<{ active: boolean; onClick: () => void; children: React.ReactNode }> = ({ active, onClick, children }) => (
    <button
        type="button"
        onClick={onClick}
        aria-pressed={active}
        className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${active ? 'bg-kaavi text-paper border-kaavi' : 'border-kaavi/30 text-muted hover:border-kaavi hover:text-kaavi bg-white/70'}`}
    >
        {children}
    </button>
);

const PaletteChoice: React.FC<{ value: string | null; onChange: (name: PaletteName) => void }> = ({ value, onChange }) => (
    <div>
        <Label>Colours</Label>
        <div className="grid grid-cols-2 gap-2">
            {(Object.keys(PALETTES) as PaletteName[]).map(name => {
                const p = PALETTES[name];
                return (
                    <button
                        key={name}
                        type="button"
                        onClick={() => onChange(name)}
                        aria-pressed={value === name}
                        className={`flex items-center gap-2 rounded-xl border p-2 text-left text-xs ${value === name ? 'border-kaavi ring-1 ring-kaavi' : 'border-kaavi/20 hover:border-kaavi/60'}`}
                    >
                        <span className="flex h-6 w-10 shrink-0 overflow-hidden rounded-md border border-ink/10" style={{ backgroundColor: p.background }}>
                            {p.colors.slice(0, 4).map(c => <span key={c} className="m-auto h-2.5 w-2.5 rounded-full" style={{ backgroundColor: c }} />)}
                        </span>
                        <span className="text-ink">{p.label}</span>
                    </button>
                );
            })}
        </div>
    </div>
);

type Example = { title: string; kind: string; detail: string; mode: Mode; background: string; apply: (k: ReturnType<typeof useKolam>) => void; svg: string };

const kolamExample = (title: string, detail: string, design: Design, palette: PaletteName, apply: Example['apply']): Example => {
    const { background, colors } = PALETTES[palette];
    return { title, kind: 'Dot kolam', detail, mode: 'kolam', background, apply, svg: designToSvg(design, { background, stroke: colors, dot: kolamDotColour(background) }) };
};

const radialExample = (title: string, kind: string, detail: string, style: RadialStyle, petals: number, layers: number, palette: PaletteName): Example => ({
    title, kind, detail, mode: 'radial', background: PALETTES[palette].background,
    svg: radialToSvg(makeRadial({ petals, layers, style, ...PALETTES[palette] })),
    apply: k => { k.setRadialStyle(style); k.setPetals(petals); k.setLayers(layers); k.setRadialPalette(palette); },
});

const EXAMPLES: Example[] = [
    kolamExample('Sikku kolam', '13 dots, one unbroken line', makeSingleLine(diamondDesign(5)), 'kaavi',
        k => { k.setUseScan(false); k.setShape('diamond'); k.setSize(5); k.setSingleLine(true); k.setKolamPalette('kaavi'); }),
    kolamExample('Pulli kolam', '25 dots in rice flour on a red floor', diamondDesign(7), 'riceFlour',
        k => { k.setUseScan(false); k.setShape('diamond'); k.setSize(7); k.setSingleLine(false); k.setKolamPalette('riceFlour'); }),
    kolamExample('Pongal kolam', '4 × 4 dots, each line in its own colour', squareDesign(4), 'pongal',
        k => { k.setUseScan(false); k.setShape('square'); k.setSize(4); k.setSingleLine(false); k.setKolamPalette('pongal'); }),
    radialExample('Festival rangoli', 'Rangoli', 'Six bands of petals, leaves and teardrops', 'festival', 12, 4, 'festival'),
    radialExample('Alpana', 'Alpana', 'Rice paste on red earth, 8-fold', 'alpana', 8, 3, 'riceFlour'),
    radialExample('Circle of curls', 'Pulli kolam', 'Curls wound round dots, with coloured dots', 'curls', 8, 3, 'darkFloor'),
];

const scrollToGuide = () => document.getElementById('walkthrough')?.scrollIntoView({ behavior: 'smooth' });
const scrollToStudio = () => document.getElementById('generator')?.scrollIntoView({ behavior: 'smooth' });

const KolamGenerator: React.FC = () => {
    const k = useKolam();
    const { mode, setMode, design, loops, symmetry, scan, useScan, setUseScan, traced } = k;

    const [showDots, setShowDots] = useState(true);
    const svg = useMemo(() => artworkSvg(k, { dots: showDots }), [k, showDots]);
    const colours = useMemo(() => artworkColours(k), [k]);
    const name = mode === 'kolam' ? `kolam-${design.rows}x${design.cols}` : mode === 'radial' ? `rangoli-${k.petals}-fold` : 'traced-drawing';
    const radialPalette = (Object.keys(PALETTES) as PaletteName[]).find(n => PALETTES[n] === k.radialColours) ?? null;

    const tabs: Array<[Mode, string]> = [['kolam', 'Dot kolam'], ['radial', 'Rangoli & alpana']];
    if (traced) tabs.push(['traced', 'Traced from your photo']);

    return (
        <section className="py-20 px-4">
            <div className="container mx-auto">
                <SectionHeading title="Design Studio" className="mb-4" />
                <p className="text-center text-muted mb-8 max-w-2xl mx-auto">
                    Make your own floor design, or a similar one to a photo you analysed. Then follow the step-by-step guide below to draw it on your doorstep.
                </p>
                <div className="flex justify-center gap-2 mb-10 flex-wrap" role="tablist">
                    {tabs.map(([id, label]) => (
                        <Toggle key={id} active={mode === id} onClick={() => setMode(id)}>{label}</Toggle>
                    ))}
                </div>

                <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)] gap-10 items-start">
                    <Card className="space-y-6">
                        {mode === 'kolam' && (
                            <>
                                {scan && (
                                    <div>
                                        <Label>Start from</Label>
                                        <div className="flex gap-2 flex-wrap">
                                            <Toggle active={!useScan} onClick={() => setUseScan(false)}>A dot grid</Toggle>
                                            <Toggle active={useScan} onClick={() => setUseScan(true)}>Your analysed kolam</Toggle>
                                        </div>
                                    </div>
                                )}
                                {!useScan && (
                                    <>
                                        <div>
                                            <Label>Dot arrangement</Label>
                                            <div className="flex gap-2">
                                                <Toggle active={k.shape === 'square'} onClick={() => k.setShape('square' as Shape)}>Square</Toggle>
                                                <Toggle active={k.shape === 'diamond'} onClick={() => k.setShape('diamond' as Shape)}>Diamond (1-3-5-3-1)</Toggle>
                                            </div>
                                        </div>
                                        <div>
                                            <Label htmlFor="grid-size">Dots per side: {design.rows}</Label>
                                            <input
                                                id="grid-size" type="range" min={k.shape === 'square' ? 2 : 3} max={13} step={k.shape === 'square' ? 1 : 2}
                                                value={design.rows} onChange={e => k.setSize(Number(e.target.value))}
                                                className="w-full accent-kaavi"
                                            />
                                        </div>
                                    </>
                                )}
                                <label className="flex items-center gap-3 text-ink">
                                    <input type="checkbox" checked={k.singleLine} onChange={e => k.setSingleLine(e.target.checked)} className="accent-kaavi w-4 h-4" />
                                    One continuous line (sikku kolam)
                                </label>
                                <PaletteChoice value={k.kolamPalette} onChange={k.setKolamPalette} />
                                <dl className="grid grid-cols-2 gap-3 text-sm">
                                    <div className="bg-sand/60 rounded-xl p-3"><dt className="text-muted">Pulli (dots)</dt><dd className="text-xl">{design.mask.join('').split('1').length - 1}</dd></div>
                                    <div className="bg-sand/60 rounded-xl p-3"><dt className="text-muted">Separate lines</dt><dd className="text-xl">{loops}</dd></div>
                                </dl>
                                <div className="flex flex-wrap gap-2">
                                    {symmetry.map(s => <span key={s} className="text-xs px-2 py-1 rounded-full bg-leaf/10 text-leaf">{SYMMETRY_LABELS[s]}</span>)}
                                </div>
                            </>
                        )}

                        {mode === 'radial' && (
                            <>
                                <div>
                                    <Label>Style</Label>
                                    <div className="flex gap-2 flex-wrap">
                                        {(Object.keys(RADIAL_STYLES) as RadialStyle[]).map(s => (
                                            <Toggle key={s} active={k.radialStyle === s} onClick={() => k.setRadialStyle(s)}>{RADIAL_STYLES[s].label}</Toggle>
                                        ))}
                                    </div>
                                    <p className="text-xs text-muted mt-2">{RADIAL_STYLES[k.radialStyle].hint}</p>
                                </div>
                                <div>
                                    <Label htmlFor="petals">Petals (symmetry): {k.petals}-fold</Label>
                                    <input id="petals" type="range" min={3} max={16} value={k.petals} onChange={e => k.setPetals(Number(e.target.value))} className="w-full accent-kaavi" />
                                </div>
                                <div>
                                    <Label htmlFor="layers">Rings of petals: {k.layers}</Label>
                                    <input id="layers" type="range" min={1} max={4} value={k.layers} onChange={e => k.setLayers(Number(e.target.value))} className="w-full accent-kaavi" />
                                </div>
                                <PaletteChoice value={radialPalette} onChange={k.setRadialPalette} />
                                {!radialPalette && <p className="text-xs text-leaf">Using the colours from your photo.</p>}
                            </>
                        )}

                        {mode === 'traced' && traced && (
                            <p className="text-sm text-muted">
                                Your photo, traced into {traced.layers.length} colour layer{traced.layers.length === 1 ? '' : 's'}. The guide below shows
                                which colour to lay down first. To make a new design in the same spirit, open <strong>Rangoli & alpana</strong>.
                            </p>
                        )}

                        {mode !== 'kolam' && (
                            <label className="flex items-start gap-3 text-ink">
                                <input type="checkbox" checked={showDots} onChange={e => setShowDots(e.target.checked)} className="accent-kaavi w-4 h-4 mt-1" />
                                <span>
                                    Show the small guide dots
                                    <span className="block text-xs text-muted">Put these down first, then join them. Download with dots to print a template.</span>
                                </span>
                            </label>
                        )}

                        <ColourGuide colours={colours.colors} background={colours.background} shares={colours.shares} firstIsLine={mode === 'kolam'} />

                        <div className="flex flex-wrap gap-2">
                            <Button size="sm" variant="secondary" onClick={() => downloadBlob(new Blob([svg], { type: 'image/svg+xml' }), `${name}.svg`)}>SVG</Button>
                            <Button size="sm" variant="secondary" onClick={async () => downloadBlob(await svgToPng(svg, mode === 'traced' ? 1 : 2), `${name}.png`)}>PNG</Button>
                            {mode === 'kolam' && <Button size="sm" variant="secondary" onClick={() => downloadKolamFile(k.currentFile())}>.kolam.json</Button>}
                            <Button size="sm" onClick={scrollToGuide}>Draw it step by step</Button>
                        </div>
                    </Card>

                    <div className="kolam-border rounded-2xl p-3 bg-white/60">
                        <KolamSvg svg={svg} className="w-full aspect-square [&_svg]:object-contain" label="Your design" />
                    </div>
                </div>

                <div className="mt-20 mb-8 text-center">
                    <h3 className="font-heading text-3xl text-kaavi">Start from a traditional design</h3>
                    <p className="mt-2 text-muted">Pick one to open it in the studio, then change its dots, petals or colours.</p>
                </div>
                <ul className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 max-w-5xl mx-auto">
                    {EXAMPLES.map(example => (
                        <li key={example.title}>
                            <button
                                type="button"
                                onClick={() => { example.apply(k); setMode(example.mode); scrollToStudio(); }}
                                className="group w-full h-full text-left rounded-2xl overflow-hidden bg-white shadow-sm ring-1 ring-kaavi/15 hover:ring-kaavi/50 hover:shadow-lg hover:-translate-y-0.5 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-kaavi"
                            >
                                <div className="relative p-4 md:p-6" style={{ backgroundColor: example.background }}>
                                    <KolamSvg svg={example.svg} className="aspect-square" label={example.title} />
                                    <span className="absolute top-2.5 left-2.5 rounded-full bg-white/90 px-2.5 py-0.5 text-xs font-semibold text-kaavi shadow-sm">{example.kind}</span>
                                </div>
                                <div className="p-3 md:p-4 border-t border-kaavi/10">
                                    <p className="font-heading text-lg md:text-xl text-ink">{example.title}</p>
                                    <p className="text-xs md:text-sm text-muted">{example.detail}</p>
                                    <p className="mt-2 text-sm font-semibold text-kaavi group-hover:underline underline-offset-4">Open in the studio →</p>
                                </div>
                            </button>
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    );
};

export default KolamGenerator;
