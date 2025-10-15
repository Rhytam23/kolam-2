
import React, { useState, useMemo } from 'react';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { Label } from './ui/Label';

// Simple procedural generation logic (for demonstration)
const generateKolamPath = (gridSize: number, patternType: string): string => {
    let path = '';
    const step = 80 / (gridSize - 1);
    const offset = 10;
    
    if (patternType === 'symmetric') {
        for (let i = 0; i < gridSize; i++) {
            const x = offset + i * step;
            path += `M${x} ${offset} C ${x + step/2} ${offset + step}, ${x - step/2} ${offset + 2*step}, ${x} ${offset + 3*step} `;
        }
    } else if (patternType === 'fibonacci') {
        let a = 0, b = 1;
        path = 'M50 50 ';
        for (let i = 0; i < gridSize * 2; i++) {
            const angle = i * 137.5;
            const radius = 5 * Math.sqrt(i);
            const x = 50 + radius * Math.cos(angle * Math.PI / 180);
            const y = 50 + radius * Math.sin(angle * Math.PI / 180);
            path += `L${x} ${y} `;
        }
    } else { // free-form
        path = 'M10 10 C 20 80, 80 20, 90 90 S 10 50, 50 50';
    }
    return path;
};


const KolamGenerator: React.FC = () => {
    const [gridSize, setGridSize] = useState(5);
    const [patternType, setPatternType] = useState('symmetric');
    const [generatedSvg, setGeneratedSvg] = useState<string | null>(null);

    const generateKolam = () => {
        const path = generateKolamPath(gridSize, patternType);
        const svg = `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><path d="${path}" stroke="#FFD700" stroke-width="1.5" fill="none" class="kolam-path" style="animation-duration: 4s;" /></svg>`;
        setGeneratedSvg(svg);
    };

    const downloadGeneratedSVG = () => {
        if (generatedSvg) {
            const blob = new Blob([generatedSvg], { type: 'image/svg+xml' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `generated-kolam-${patternType}-${gridSize}x${gridSize}.svg`;
            a.click();
            URL.revokeObjectURL(url);
        }
    };
    
    // Generate initial Kolam on mount
    React.useEffect(() => {
        generateKolam();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <section className="py-20 px-4 bg-[#0c0a18] bg-opacity-50 relative">
             <div className="absolute inset-0 z-0 opacity-20" style={{backgroundImage: 'radial-gradient(#33A1C9 1px, transparent 1px)', backgroundSize: '20px 20px'}}></div>
            <div className="container mx-auto relative z-10">
                <h2 className="font-heading text-4xl md:text-5xl text-center mb-12 gradient-text">Procedural Kolam Generator</h2>
                <div className="grid lg:grid-cols-3 gap-12 items-center">
                    <div className="lg:col-span-1">
                        <Card>
                            <h3 className="text-2xl font-bold mb-6 text-center text-orange-400">Customize Your Kolam</h3>
                            <div className="space-y-6">
                                <div>
                                    <Label htmlFor="grid-size">Grid Size: {gridSize} x {gridSize}</Label>
                                    <input id="grid-size" type="range" min="3" max="15" value={gridSize} onChange={(e) => setGridSize(Number(e.target.value))} className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-orange-500" />
                                </div>
                                <div>
                                    <Label htmlFor="pattern-type">Pattern Type</Label>
                                    <select id="pattern-type" value={patternType} onChange={(e) => setPatternType(e.target.value)} className="w-full p-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-orange-500 focus:border-orange-500">
                                        <option value="symmetric">Symmetric</option>
                                        <option value="free-form">Free-form</option>
                                        <option value="fibonacci">Fibonacci Spiral</option>
                                    </select>
                                </div>
                                <div className="flex flex-col space-y-4 pt-4">
                                     <Button onClick={generateKolam}>Generate</Button>
                                     {generatedSvg && <Button onClick={downloadGeneratedSVG} variant="secondary">Download SVG</Button>}
                                </div>
                            </div>
                        </Card>
                    </div>
                    <div className="lg:col-span-2 flex items-center justify-center group" style={{ perspective: '1000px' }}>
                        <div className="w-full max-w-lg aspect-square transition-transform duration-500 ease-out group-hover:rotate-x-10 group-hover:-rotate-y-12 group-hover:scale-105" style={{ transformStyle: 'preserve-3d' }}>
                           {generatedSvg ? (
                                <div className="w-full h-full p-4 rounded-lg bg-indigo-900/10 shadow-2xl shadow-indigo-900/40" dangerouslySetInnerHTML={{ __html: generatedSvg }} />
                           ) : (
                                <div className="w-full h-full flex items-center justify-center p-4 rounded-lg bg-indigo-900/10 shadow-2xl shadow-indigo-900/40">
                                    <p>Click "Generate" to create a Kolam</p>
                                </div>
                           )}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default KolamGenerator;
