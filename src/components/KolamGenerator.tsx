import React from 'react';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { Label } from './ui/Label';
import { useKolam } from './KolamContext';

const KolamGenerator: React.FC = () => {
    const {
        gridSize,
        setGridSize,
        generatedDots,
        generatedPath,
        selectedDots,
        analysisSummary,
        resetWorkspace,
        exportDots,
    } = useKolam();

    const size = 500;
    const scale = size / 500;

    const svgContent = `
<svg viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
    <rect width="100%" height="100%" fill="transparent"/>
    ${generatedDots.map(d => `<circle cx="${d.x * scale}" cy="${d.y * scale}" r="4" fill="white" opacity="0.8"/>`).join('')}
    ${selectedDots.map(d => `<circle cx="${d.x * size}" cy="${d.y * size}" r="6" fill="#FDB813" opacity="0.45"/>`).join('')}
    <path d="${generatedPath}" stroke="#E91E63" stroke-width="6" fill="none" opacity="0.3" filter="blur(2px)"/>
    <path d="${generatedPath}" stroke="#FF9933" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

    const downloadGeneratedSVG = () => {
        const blob = new Blob([svgContent], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `kolam-${gridSize}x${gridSize}.svg`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const comparisonDelta = Math.abs(generatedDots.length - selectedDots.length);

    return (
        <section className="py-20 px-4 bg-[#0c0a18] bg-opacity-50 relative">
            <div className="absolute inset-0 z-0 opacity-20" style={{ backgroundImage: 'radial-gradient(#33A1C9 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
            <div className="container mx-auto relative z-10">
                <h2 className="font-heading text-4xl md:text-5xl text-center mb-12 gradient-text">Procedural Kolam Generator</h2>
                <div className="grid lg:grid-cols-3 gap-12 items-center">
                    <div className="lg:col-span-1 space-y-6">
                        <Card>
                            <h3 className="text-2xl font-bold mb-6 text-center text-orange-400">Customize Grid</h3>
                            <div className="space-y-6">
                                <div>
                                    <Label htmlFor="grid-size">Grid Size: {gridSize} x {gridSize}</Label>
                                    <input
                                        id="grid-size"
                                        type="range"
                                        min="3"
                                        max="15"
                                        step="2"
                                        value={gridSize}
                                        onChange={(e) => setGridSize(Number(e.target.value))}
                                        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-orange-500"
                                    />
                                    <p className="text-xs text-gray-500 mt-2">Odd sizes are enforced to preserve the continuous-loop construction.</p>
                                </div>

                                <div className="flex flex-col space-y-4 pt-4">
                                    <Button onClick={downloadGeneratedSVG} variant="secondary">Download SVG</Button>
                                    <Button onClick={exportDots} variant="secondary">Export Workspace JSON</Button>
                                    <Button onClick={resetWorkspace} variant="secondary">Reset Workspace</Button>
                                </div>
                            </div>
                        </Card>

                        <Card>
                            <p className="text-xs uppercase tracking-[0.2em] text-saffron mb-3">Connected Workflow</p>
                            <p className="text-gray-300 text-sm leading-relaxed mb-4">
                                This generator uses the shared Kolam workspace. Uploaded analyzer dots appear as a reference overlay here, helping you compare procedural output against detected structure.
                            </p>
                            <div className="space-y-2 text-sm text-gray-400">
                                <p>Generated grid dots: <span className="text-white font-semibold">{generatedDots.length}</span></p>
                                <p>Analyzer reference dots: <span className="text-white font-semibold">{selectedDots.length}</span></p>
                                <p>Dot count delta: <span className="text-white font-semibold">{comparisonDelta}</span></p>
                                {analysisSummary && <p className="text-saffron">{analysisSummary.message}</p>}
                            </div>
                        </Card>
                    </div>

                    <div className="lg:col-span-2 flex items-center justify-center">
                        <div className="w-full max-w-lg aspect-square bg-indigo-900/10 rounded-xl p-8 shadow-2xl border border-indigo-500/20 backdrop-blur-sm">
                            <div className="w-full h-full">
                                <div className="w-full h-full" dangerouslySetInnerHTML={{ __html: svgContent }} />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-20">
                    <h3 className="text-3xl font-bold mb-8 text-center text-saffron">Reference Kolams</h3>
                    <p className="text-center text-gray-400 mb-8 max-w-2xl mx-auto">These traditional Kolam designs serve as our procedural generation standard, ensuring that connecting lines perfectly intersect exactly at the core dots (Padi Kolam style alignment).</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {['/media__1772279165321.png', '/media__1772279186819.png', '/media__1772279201882.png'].map((src, idx) => (
                            <div key={idx} className="rounded-xl overflow-hidden shadow-lg border border-indigo-500/20 hover:scale-105 transition-transform bg-indigo-900/10 backdrop-blur-sm">
                                <img src={src} alt={`Kolam Reference ${idx + 1}`} className="w-full h-auto object-cover aspect-square opacity-90 hover:opacity-100" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default KolamGenerator;
