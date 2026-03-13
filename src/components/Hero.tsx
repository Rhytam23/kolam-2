
import React from 'react';
import { Button } from './ui/Button';

interface HeroProps {
    scrollToSection: () => void;
}

const Hero: React.FC<HeroProps> = ({ scrollToSection }) => {
    return (
        <section className="min-h-screen flex flex-col items-center justify-center text-center relative overflow-hidden px-4">
            <div className="absolute inset-0 z-0">
                <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" className="opacity-30">
                    <defs>
                        <pattern id="dotted-pattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                            <circle cx="2" cy="2" r="1" fill="#FF9933" className="animate-pulse" />
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#dotted-pattern)" />
                </svg>
            </div>
            
            <div className="z-10 flex flex-col items-center">
                <div className="w-64 h-64 md:w-96 md:h-96 mb-8">
                    <svg viewBox="0 0 100 100" className="glowing-kolam">
                        <path className="kolam-path" d="M50 10 L60 20 L50 30 L40 20 Z M50 90 L60 80 L50 70 L40 80 Z M10 50 L20 40 L30 50 L20 60 Z M90 50 L80 40 L70 50 L80 60 Z M20 20 L35 35 L20 50 L5 35 Z M80 20 L65 35 L80 50 L95 35 Z M20 80 L35 65 L20 50 L5 65 Z M80 80 L65 65 L80 50 L95 65 Z" fill="none" stroke="#FFD700" strokeWidth="1" />
                        <path className="kolam-path" style={{animationDelay: '2s'}} d="M50 30 C 70 30, 70 50, 70 50 S 70 70, 50 70 S 30 70, 30 50 S 30 30, 50 30" fill="none" stroke="#FF9933" strokeWidth="1" />
                        <path className="kolam-path" style={{animationDelay: '4s'}} d="M50 10 C 80 20, 80 80, 50 90 S 20 80, 20 20 S 50 10, 50 10" fill="none" stroke="#FFD700" strokeWidth="1" />
                    </svg>
                </div>
                <h1 className="font-heading text-5xl md:text-7xl font-bold mb-4 gradient-text animate-fade-in-down">
                    SOLVIX – Kolam AI
                </h1>
                <p className="text-lg md:text-2xl text-gray-300 mb-8 max-w-2xl italic">
                    Bridging Tradition and Technology through Kolam Intelligence
                </p>
                <Button onClick={scrollToSection}>Start Exploring</Button>
            </div>
        </section>
    );
};

export default Hero;
