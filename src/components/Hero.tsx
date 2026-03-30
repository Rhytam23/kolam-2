import React, { useMemo, useEffect, useState } from 'react';
import { Button } from './ui/Button';
import { generateDots, generateKolamPath } from '../utils/kolamLogic';

interface HeroProps {
    scrollToSection: () => void;
}

const Hero: React.FC<HeroProps> = ({ scrollToSection }) => {
    // Generate a static smooth Kolam for the background
    const gridSize = 5;
    const size = 400; // SVG coordinate size

    // ensure hydration match - wrap random gen in useEffect if needed, 
    // but our generator is deterministic based on size.
    const { dots, path } = useMemo(() => {
        return {
            dots: generateDots(gridSize, size, size),
            path: generateKolamPath(gridSize, size, size)
        };
    }, []);

    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);

    return (
        <section className="min-h-screen flex flex-col items-center justify-center text-center relative overflow-hidden px-4">
            <div className="absolute inset-0 z-0">
                <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" className="opacity-10">
                    <defs>
                        <pattern id="dotted-pattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                            <circle cx="2" cy="2" r="1.5" className="fill-saffron animate-diya-flicker" />
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#dotted-pattern)" />
                </svg>
            </div>

            <div className="z-10 flex flex-col items-center relative">
                {mounted && (
                    <div className="w-80 h-80 md:w-[500px] md:h-[500px] mb-8 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 -z-10 opacity-60">
                        <svg viewBox="0 0 400 400" className="w-full h-full animate-spin-slow">
                            {/* Dots Layer */}
                            {dots.map((d, i) => (
                                <circle key={i} cx={d.x} cy={d.y} r="3" fill="rgba(255,255,255,0.3)" />
                            ))}

                            {/* Path - Outer Glow (Fix 5) */}
                            <path
                                d={path}
                                className="stroke-marigold blur-sm opacity-50"
                                strokeWidth="4"
                                fill="none"
                            />

                            {/* Path - Inner Core (Fix 5) */}
                            <path
                                d={path}
                                className="stroke-saffron"
                                strokeWidth="2"
                                fill="none"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                    </div>
                )}

                <div className="relative z-20 backdrop-blur-sm bg-black/10 p-8 rounded-2xl border border-white/5">
                    <h1 className="font-heading text-5xl md:text-7xl font-bold mb-4 bg-gradient-to-r from-saffron via-marigold to-indiaGreen inline-block text-transparent bg-clip-text animate-fade-in-down">
                        SOLVIX – Kolam AI
                    </h1>
                    <p className="text-lg md:text-2xl text-gray-300 mb-8 max-w-2xl italic">
                        Bridging Tradition and Technology through Kolam Intelligence
                    </p>
                    <Button onClick={scrollToSection}>Start Exploring</Button>
                </div>
            </div>
        </section>
    );
};

export default Hero;
