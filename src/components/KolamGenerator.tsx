import React from 'react';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { Label } from './ui/Label';
import KolamSvg from './KolamSvg';
import { useKolam, type Shape } from './KolamContext';
import { SYMMETRY_LABELS, designToSvg, diamondDesign, makeSingleLine, squareDesign } from '../utils/kolamLogic';
import { downloadBlob, downloadKolamFile, svgToPng } from '../lib/kolamFile';

const EXAMPLES: Array<{ title: string; shape: Shape; size: number; singleLine: boolean }> = [
    { title: '5×5 sikku (one line)', shape: 'square', size: 5, singleLine: true },
    { title: '1-3-5-7-5-3-1 diamond', shape: 'diamond', size: 7, singleLine: true },
    { title: '4×4 pulli, 4 loops', shape: 'square', size: 4, singleLine: false },
];

const exampleDesign = (e: (typeof EXAMPLES)[number]) => {
    const base = e.shape === 'square' ? squareDesign(e.size) : diamondDesign(e.size);
    return e.singleLine ? makeSingleLine(base) : base;
};
const EXAMPLE_DESIGNS = EXAMPLES.map(exampleDesign);

const Toggle: React.FC<{ active: boolean; onClick: () => void; children: React.ReactNode }> = ({ active, onClick, children }) => (
    <button
        type="button"
        onClick={onClick}
        aria-pressed={active}
        className={`px-4 py-2 rounded-full text-sm border transition-colors ${active ? 'bg-orange-500/20 border-orange-400 text-orange-300' : 'border-gray-600 text-gray-400 hover:text-white'}`}
    >
        {children}
    </button>
);

const KolamGenerator: React.FC = () => {
    const {
        size, setSize, shape, setShape, singleLine, setSingleLine,
        scan, useScan, setUseScan, design, loops, symmetry, currentFile,
    } = useKolam();

    const name = `kolam-${design.rows}x${design.cols}`;
    const downloadSvg = () =>
        downloadBlob(new Blob([designToSvg(design, { background: '#0c0a18' })], { type: 'image/svg+xml' }), `${name}.svg`);
    const downloadPng = async () => downloadBlob(await svgToPng(designToSvg(design, { background: '#0c0a18' })), `${name}.png`);
    const dotCount = design.mask.join('').split('1').length - 1;

    return (
        <section className="py-20 px-4 relative">
            <div className="container mx-auto">
                <h2 className="font-heading text-4xl md:text-5xl text-center mb-4 gradient-text">Kolam Generator</h2>
                <p className="text-center text-gray-400 mb-12 max-w-2xl mx-auto">
                    Each dot is wrapped by strands that either cross or bounce off a mirror between neighbouring dots.
                    Switching crossings to mirrors joins separate loops into the single continuous line of a sikku kolam.
                </p>
                <div className="grid lg:grid-cols-3 gap-10 items-start">
                    <Card className="space-y-6">
                        {scan && (
                            <div>
                                <Label>Source</Label>
                                <div className="flex gap-2 flex-wrap">
                                    <Toggle active={!useScan} onClick={() => setUseScan(false)}>Presets</Toggle>
                                    <Toggle active={useScan} onClick={() => setUseScan(true)}>Analysed kolam</Toggle>
                                </div>
                            </div>
                        )}
                        {!useScan && (
                            <>
                                <div>
                                    <Label>Dot arrangement</Label>
                                    <div className="flex gap-2">
                                        <Toggle active={shape === 'square'} onClick={() => setShape('square')}>Square</Toggle>
                                        <Toggle active={shape === 'diamond'} onClick={() => setShape('diamond')}>Diamond</Toggle>
                                    </div>
                                </div>
                                <div>
                                    <Label htmlFor="grid-size">Size: {design.rows} × {design.cols}</Label>
                                    <input
                                        id="grid-size"
                                        type="range"
                                        min={shape === 'square' ? 2 : 3}
                                        max={13}
                                        step={shape === 'square' ? 1 : 2}
                                        value={design.rows}
                                        onChange={e => setSize(Number(e.target.value))}
                                        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-orange-500"
                                    />
                                </div>
                            </>
                        )}
                        <label className="flex items-center gap-3 text-gray-300">
                            <input type="checkbox" checked={singleLine} onChange={e => setSingleLine(e.target.checked)} className="accent-orange-500 w-4 h-4" />
                            Draw with one continuous line (sikku)
                        </label>

                        <dl className="grid grid-cols-2 gap-3 text-sm">
                            <div className="bg-black/20 rounded-lg p-3"><dt className="text-gray-500">Dots</dt><dd className="text-xl text-white">{dotCount}</dd></div>
                            <div className="bg-black/20 rounded-lg p-3"><dt className="text-gray-500">Loops</dt><dd className="text-xl text-white">{loops}</dd></div>
                        </dl>
                        <div className="flex flex-wrap gap-2">
                            {symmetry.length === 0 && <span className="text-xs text-gray-500">No symmetry</span>}
                            {symmetry.map(s => (
                                <span key={s} className="text-xs px-2 py-1 rounded-full bg-indigo-500/20 text-indigo-200">{SYMMETRY_LABELS[s]}</span>
                            ))}
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                            <Button variant="secondary" className="!px-3 !py-2 text-sm" onClick={downloadSvg}>SVG</Button>
                            <Button variant="secondary" className="!px-3 !py-2 text-sm" onClick={downloadPng}>PNG</Button>
                            <Button variant="secondary" className="!px-3 !py-2 text-sm" onClick={() => downloadKolamFile(currentFile())}>.kolam</Button>
                        </div>
                    </Card>

                    <div className="lg:col-span-2 flex justify-center">
                        <div className="w-full max-w-xl aspect-square bg-indigo-900/10 rounded-xl p-6 border border-indigo-500/20">
                            <KolamSvg design={design} className="w-full h-full" label={`Generated kolam with ${loops} loop(s)`} />
                        </div>
                    </div>
                </div>

                <h3 className="text-2xl font-bold mt-16 mb-6 text-center text-saffron">Try these</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
                    {EXAMPLES.map((example, index) => (
                        <button
                            key={example.title}
                            type="button"
                            onClick={() => {
                                setUseScan(false);
                                setShape(example.shape);
                                setSize(example.size);
                                setSingleLine(example.singleLine);
                            }}
                            className="rounded-xl border border-indigo-500/20 bg-indigo-900/10 p-4 hover:border-orange-400 transition-colors"
                        >
                            <KolamSvg design={EXAMPLE_DESIGNS[index]} className="aspect-square" label={example.title} />
                            <p className="mt-3 text-sm text-gray-300">{example.title}</p>
                        </button>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default KolamGenerator;
