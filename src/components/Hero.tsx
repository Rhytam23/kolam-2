import React, { useMemo } from 'react';
import { Button } from './ui/Button';
import KolamSvg from './KolamSvg';
import { designToSvg, makeSingleLine, squareDesign } from '../utils/kolamLogic';

const Hero: React.FC<{ onStart: () => void; onGenerate: () => void }> = ({ onStart, onGenerate }) => {
    const svg = useMemo(() => designToSvg(makeSingleLine(squareDesign(5)), { stroke: '#A63A1E', dot: '#A63A1E' }), []);

    return (
        <section className="min-h-screen flex flex-col items-center justify-center text-center relative overflow-hidden px-4 pt-20">
            <KolamSvg
                svg={svg}
                label="A single-line sikku kolam"
                className="absolute w-80 h-80 md:w-[600px] md:h-[600px] opacity-[0.13] motion-safe:animate-spin-slow pointer-events-none"
            />
            <div className="relative z-10 max-w-3xl">
                <p className="text-kaavi font-semibold tracking-wide mb-3">கோலம் · rangoli · muggulu · alpana</p>
                <h1 className="font-heading text-5xl sm:text-6xl md:text-7xl mb-5 gradient-text animate-fade-in-down">
                    SOLVIX <span className="whitespace-nowrap">Kolam AI</span>
                </h1>
                <p className="text-xl md:text-2xl text-ink mb-3">
                    Understand the design behind a kolam, and draw it again with your own hands.
                </p>
                <p className="text-base text-muted mb-8 max-w-xl mx-auto">
                    Photograph a kolam, rangoli or alpana to see its dots, symmetry and colours. Then follow a step-by-step guide, or design a new one.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button onClick={onStart}>Read a design from a photo</Button>
                    <Button variant="secondary" onClick={onGenerate}>Design your own</Button>
                </div>
            </div>
        </section>
    );
};

export default Hero;
