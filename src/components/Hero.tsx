import React, { useMemo } from 'react';
import { Button } from './ui/Button';
import KolamSvg from './KolamSvg';
import { makeSingleLine, squareDesign } from '../utils/kolamLogic';

const Hero: React.FC<{ onStart: () => void; onGenerate: () => void }> = ({ onStart, onGenerate }) => {
    const design = useMemo(() => makeSingleLine(squareDesign(5)), []);

    return (
        <section className="min-h-screen flex flex-col items-center justify-center text-center relative overflow-hidden px-4">
            <KolamSvg
                design={design}
                label="Decorative single-line kolam"
                className="absolute w-80 h-80 md:w-[560px] md:h-[560px] opacity-25 motion-safe:animate-spin-slow pointer-events-none"
            />
            <div className="relative z-10 backdrop-blur-sm bg-black/10 p-6 sm:p-8 rounded-2xl border border-white/5 max-w-full">
                <h1 className="font-heading text-4xl sm:text-5xl md:text-7xl font-bold mb-4 break-words bg-gradient-to-r from-saffron via-marigold to-indiaGreen inline-block text-transparent bg-clip-text animate-fade-in-down">
                    SOLVIX – <span className="whitespace-nowrap">Kolam AI</span>
                </h1>
                <p className="text-lg md:text-2xl text-gray-300 mb-3 max-w-2xl italic">
                    Identify the design principles behind a kolam and recreate it digitally.
                </p>
                <p className="text-sm text-gray-400 mb-8 max-w-xl mx-auto">
                    Upload a photo to read its dot grid, symmetry and strand structure, or design your own sikku kolam drawn with one continuous line.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button onClick={onStart}>Analyze a kolam</Button>
                    <Button variant="secondary" onClick={onGenerate}>Design your own</Button>
                </div>
            </div>
        </section>
    );
};

export default Hero;
