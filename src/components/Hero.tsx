import React from 'react';
import { Button } from './ui/Button';
import Diya from './landing/Diya';
import ScrollDrawing from './landing/ScrollDrawing';
import Toran from './landing/Toran';

const NAMES = [
    { word: 'கோலம்', lang: 'ta', label: 'Kolam (Tamil)' },
    { word: 'ముగ్గు', lang: 'te', label: 'Muggu (Telugu)' },
    { word: 'रंगोली', lang: 'hi', label: 'Rangoli (Hindi)' },
    { word: 'আলপনা', lang: 'bn', label: 'Alpana (Bengali)' },
];

const TRUST = ['Free and open source', 'Works on any phone', 'Photos are analysed, never stored'];

const Hero: React.FC<{ onStart: () => void; onGenerate: () => void }> = ({ onStart, onGenerate }) => (
    <section className="relative floor-bg text-rice">
        <div className="absolute inset-0 floor-dots pointer-events-none" aria-hidden />
        <Toran className="absolute top-16 inset-x-0 z-10 pointer-events-none" />
        <div className="relative container mx-auto px-4 grid lg:grid-cols-2 gap-x-12">
            <div className="lg:sticky lg:top-0 lg:h-svh flex items-center pt-44 lg:pt-28 pb-4">
                <div className="text-center lg:text-left w-full">
                    <p className="inline-flex items-center gap-2 rounded-full border border-brass/60 bg-floor/60 px-4 py-1.5 text-sm text-brass-light mb-6">
                        <span className="h-2 w-2 rounded-full bg-marigold" aria-hidden />
                        Smart India Hackathon 2025 · Problem SIH25107
                    </p>
                    <p className="font-script text-2xl md:text-3xl text-brass-light mb-4 flex flex-wrap gap-x-5 gap-y-1 justify-center lg:justify-start">
                        {NAMES.map(n => <span key={n.word} lang={n.lang} title={n.label}>{n.word}</span>)}
                    </p>
                    <h1 className="font-heading text-5xl sm:text-6xl xl:text-7xl leading-[1.05] text-rice">
                        The Living Art <span className="brass-text">of the Threshold</span>
                    </h1>
                    <div className="brass-rule max-w-sm mx-auto lg:mx-0 my-6" aria-hidden><Diya className="h-9 w-9 shrink-0" /></div>
                    <p className="text-lg md:text-xl text-rice/90 mb-8 max-w-xl mx-auto lg:mx-0">
                        SOLVIX reads the dots, lines, symmetry and colours of a kolam, rangoli or alpana, and teaches you to draw it
                        again, step by step, the way it has always been made.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                        <Button variant="brass" onClick={onStart}>Read a design from a photo</Button>
                        <Button variant="outline-light" onClick={onGenerate}>Design your own</Button>
                    </div>
                    <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 justify-center lg:justify-start text-sm text-rice/80">
                        {TRUST.map(t => (
                            <li key={t} className="flex items-center gap-2">
                                <svg viewBox="0 0 16 16" className="h-4 w-4 text-brass-light" aria-hidden><path d="M3 8.5l3 3 7-7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                {t}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
            <ScrollDrawing />
        </div>
    </section>
);

export default Hero;
