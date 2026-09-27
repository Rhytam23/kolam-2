import React from 'react';
import { Button } from './ui/Button';
import LiveDrawing from './landing/LiveDrawing';

const NAMES = [
    { word: 'கோலம்', lang: 'ta', label: 'Kolam (Tamil)' },
    { word: 'ముగ్గు', lang: 'te', label: 'Muggu (Telugu)' },
    { word: 'रंगोली', lang: 'hi', label: 'Rangoli (Hindi)' },
    { word: 'আলপনা', lang: 'bn', label: 'Alpana (Bengali)' },
];

const TRUST = ['Free and open source', 'Works on any phone', 'Photos are analysed, never stored'];

const Hero: React.FC<{ onStart: () => void; onGenerate: () => void }> = ({ onStart, onGenerate }) => (
    <section className="min-h-screen flex items-center px-4 pt-24 pb-16">
        <div className="container mx-auto grid lg:grid-cols-[1.1fr_1fr] gap-12 items-center">
            <div className="text-center lg:text-left">
                <p className="inline-flex items-center gap-2 rounded-full border border-kaavi/25 bg-white/70 px-4 py-1.5 text-sm text-ink mb-6">
                    <span className="h-2 w-2 rounded-full bg-marigold" aria-hidden />
                    Smart India Hackathon 2025 · Problem SIH25107
                </p>
                <p className="font-script text-2xl md:text-3xl text-kaavi mb-4 flex flex-wrap gap-x-4 gap-y-1 justify-center lg:justify-start">
                    {NAMES.map(n => <span key={n.word} lang={n.lang} title={n.label}>{n.word}</span>)}
                </p>
                <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl leading-tight text-ink mb-5 animate-fade-in-down">
                    Read a kolam. Learn it. <span className="gradient-text whitespace-nowrap">Draw it again.</span>
                </h1>
                <p className="text-lg md:text-xl text-ink/90 mb-8 max-w-xl mx-auto lg:mx-0">
                    SOLVIX finds the dots, lines, symmetry and colours in a photo of a kolam, rangoli or alpana, and teaches you to draw it
                    step by step, the way it has always been made.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                    <Button onClick={onStart}>Read a design from a photo</Button>
                    <Button variant="secondary" onClick={onGenerate}>Design your own</Button>
                </div>
                <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 justify-center lg:justify-start text-sm text-muted">
                    {TRUST.map(t => (
                        <li key={t} className="flex items-center gap-2">
                            <svg viewBox="0 0 16 16" className="h-4 w-4 text-leaf" aria-hidden><path d="M3 8.5l3 3 7-7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                            {t}
                        </li>
                    ))}
                </ul>
            </div>
            <LiveDrawing />
        </div>
    </section>
);

export default Hero;
