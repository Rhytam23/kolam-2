import React, { useState, useEffect, useMemo } from 'react';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { useKolam } from './KolamContext';

const KolamWalkthrough: React.FC = () => {
    const [step, setStep] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const { gridSize, generatedDots, generatedPath, selectedDots, analysisSummary } = useKolam();

    const size = 400;
    const scaledReferenceDots = useMemo(
        () => selectedDots.map(dot => ({ x: dot.x * size, y: dot.y * size })),
        [selectedDots],
    );

    const steps = [
        {
            title: '1. The Foundation (Pulli)',
            description: 'Every Kolam begins with a grid of dots. In this workspace, the procedural grid is live and any analyzer dots are shown as a reference layer.',
        },
        {
            title: '2. The Logic (Structure)',
            description: 'The framework establishes symmetry and turning rules. This is where the pattern decides how to wrap around the dots without crossing them.',
        },
        {
            title: '3. The Flow (Neli)',
            description: 'A single continuous path weaves around the grid. The procedural path below updates whenever you change the generator size.',
        },
        {
            title: '4. The Spirit (Completion)',
            description: 'The completed pattern balances repetition, rhythm, and continuity. Analyzer output can now be compared directly against this generated reference.',
        },
    ];

    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (isPlaying) {
            timer = setTimeout(() => {
                setStep(prev => {
                    if (prev < steps.length - 1) return prev + 1;
                    setIsPlaying(false);
                    return prev;
                });
            }, 3500);
        }
        return () => clearTimeout(timer);
    }, [isPlaying, step, steps.length]);

    const handleNext = () => setStep(prev => Math.min(prev + 1, steps.length - 1));
    const handlePrev = () => setStep(prev => Math.max(prev - 1, 0));
    const togglePlay = () => {
        if (step >= steps.length - 1) {
            setStep(0);
            setIsPlaying(true);
            return;
        }
        setIsPlaying(prev => !prev);
    };

    return (
        <section className="py-20 px-4">
            <div className="container mx-auto max-w-5xl">
                <h2 className="font-heading text-4xl md:text-5xl text-center mb-12 gradient-text">Kolam Construction Walkthrough</h2>

                <div className="grid md:grid-cols-2 gap-12 items-center">
                    <div className="aspect-square bg-indigo-900/10 rounded-xl p-8 shadow-2xl border border-indigo-500/20 backdrop-blur-sm relative overflow-hidden">
                        <div className="absolute inset-0 bg-[#0c0a18]/50"></div>

                        <svg viewBox="0 0 400 400" className="w-full h-full relative z-10">
                            <g style={{ opacity: step >= 0 ? 1 : 0, transition: 'opacity 1s ease-in-out' }}>
                                {generatedDots.map((d, i) => (
                                    <circle key={i} cx={d.x * (size / 500)} cy={d.y * (size / 500)} r="4" fill="white" style={{ animationDelay: `${i * 40}ms` }} />
                                ))}
                            </g>

                            {scaledReferenceDots.length > 0 && (
                                <g style={{ opacity: step >= 0 ? 0.65 : 0, transition: 'opacity 1s ease-in-out' }}>
                                    {scaledReferenceDots.map((d, i) => (
                                        <circle key={`ref-${i}`} cx={d.x} cy={d.y} r="5" fill="#FDB813" opacity="0.5" />
                                    ))}
                                </g>
                            )}

                            <g style={{ opacity: step >= 1 ? 0.3 : 0, transition: 'opacity 1s ease-in-out' }}>
                                <path d="M200 0 L400 200 L200 400 L0 200 Z" stroke="cyan" strokeWidth="1" strokeDasharray="4" fill="none" />
                                <circle cx="200" cy="200" r="100" stroke="cyan" strokeWidth="1" strokeDasharray="4" fill="none" />
                            </g>

                            <g style={{ opacity: step >= 2 ? 1 : 0, transition: 'opacity 1s' }}>
                                <path
                                    d={generatedPath}
                                    stroke="#FDB813"
                                    strokeWidth="2"
                                    fill="none"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className={step === 2 ? 'animate-draw-path' : ''}
                                    style={{ strokeDasharray: 30000, strokeDashoffset: step >= 3 ? 0 : (step === 2 ? undefined : 30000) }}
                                />
                                <style>{`
                                    .animate-draw-path { animation: draw 4s linear forwards; }
                                    @keyframes draw { from { stroke-dashoffset: 30000; } to { stroke-dashoffset: 0; } }
                                `}</style>
                            </g>

                            <g style={{ opacity: step >= 3 ? 1 : 0, transition: 'opacity 2s' }}>
                                <path d={generatedPath} stroke="#FF9933" strokeWidth="6" fill="none" className="blur-sm" style={{ opacity: 0.5 }} />
                            </g>
                        </svg>
                    </div>

                    <div className="space-y-8">
                        <Card className="min-h-[240px] flex flex-col justify-center text-center p-8">
                            <h3 className="text-2xl font-bold text-orange-400 mb-4">{steps[step].title}</h3>
                            <p className="text-xl text-gray-300 leading-relaxed mb-6">{steps[step].description}</p>
                            <div className="text-sm text-gray-400 space-y-2">
                                <p>Active procedural grid: <span className="text-white font-semibold">{gridSize} × {gridSize}</span></p>
                                <p>Reference analyzer dots: <span className="text-white font-semibold">{selectedDots.length}</span></p>
                                {analysisSummary && <p className="text-saffron">{analysisSummary.message}</p>}
                            </div>
                        </Card>

                        <div className="flex justify-center space-x-4">
                            <Button variant="secondary" onClick={handlePrev} disabled={step === 0}>Previous</Button>
                            <Button onClick={togglePlay}>{isPlaying ? 'Pause' : step >= 3 ? 'Restart' : 'Auto Play'}</Button>
                            <Button variant="secondary" onClick={handleNext} disabled={step === 3}>Next</Button>
                        </div>

                        <div className="text-center">
                            <div className="flex justify-center space-x-2 mt-4">
                                {steps.map((_, i) => (
                                    <div key={i} className={`h-2 w-2 rounded-full transition-colors duration-300 ${i === step ? 'bg-orange-500' : 'bg-gray-700'}`} />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default KolamWalkthrough;
