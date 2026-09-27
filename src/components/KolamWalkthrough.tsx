import React, { useEffect, useMemo, useState } from 'react';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { useKolam } from './KolamContext';
import { SYMMETRY_LABELS, designDots, designPath, rowPattern, type SymmetryName } from '../utils/kolamLogic';

const UNIT = 40;
const PAD = 1;
const STEP_MS = 4000;

const KolamWalkthrough: React.FC = () => {
    const [step, setStep] = useState(0);
    const [playing, setPlaying] = useState(false);
    const { design, loops, symmetry } = useKolam();

    const width = (design.cols - 1 + 2 * PAD) * UNIT;
    const height = (design.rows - 1 + 2 * PAD) * UNIT;
    const path = useMemo(() => designPath(design, UNIT, PAD), [design]);
    const dots = useMemo(() => designDots(design), [design]);

    const axes: Partial<Record<SymmetryName, [number, number, number, number]>> = {
        mirrorVertical: [width / 2, 0, width / 2, height],
        mirrorHorizontal: [0, height / 2, width, height / 2],
        diagonal: [0, 0, width, height],
        antiDiagonal: [width, 0, 0, height],
    };
    const rotations = symmetry.filter(s => s === 'rotation90' || s === 'rotation180');

    const steps = [
        {
            title: '1. Pulli: the dot grid',
            text: `The kolam starts from ${dots.length} dots arranged in rows of ${rowPattern(design)}.`,
        },
        {
            title: '2. Symmetry',
            text: symmetry.length
                ? `This design is unchanged under: ${symmetry.map(s => SYMMETRY_LABELS[s].toLowerCase()).join(', ')}.`
                : 'This design has no mirror or rotational symmetry.',
        },
        {
            title: '3. Neli: the strands',
            text: 'Strands travel diagonally around every dot, never touching it. Between two dots they either cross or turn at a mirror.',
        },
        {
            title: '4. Completion',
            text: loops === 1
                ? 'Every dot is enclosed by one continuous line: a sikku kolam.'
                : `The drawing is made of ${loops} closed loops. Turn on "one continuous line" in the generator to join them.`,
        },
    ];
    const last = steps.length - 1;

    useEffect(() => {
        if (!playing) return;
        if (step >= last) {
            setPlaying(false);
            return;
        }
        const timer: ReturnType<typeof setTimeout> = setTimeout(() => setStep(s => s + 1), STEP_MS);
        return () => clearTimeout(timer);
    }, [playing, step, last]);

    const togglePlay = () => {
        if (step >= last) setStep(0);
        setPlaying(p => step >= last || !p);
    };

    return (
        <section className="py-20 px-4">
            <div className="container mx-auto max-w-5xl">
                <h2 className="font-heading text-4xl md:text-5xl text-center mb-12 gradient-text">How a Kolam Is Built</h2>
                <div className="grid md:grid-cols-2 gap-12 items-center">
                    <div className="aspect-square bg-indigo-900/10 rounded-xl p-6 border border-indigo-500/20">
                        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full" role="img" aria-label={steps[step].title}>
                            {step === 1 && (
                                <g stroke="#33A1C9" strokeWidth={2} strokeDasharray="6 6" fill="none">
                                    {symmetry.map(s => axes[s] && <line key={s} x1={axes[s]![0]} y1={axes[s]![1]} x2={axes[s]![2]} y2={axes[s]![3]} />)}
                                    {rotations.length > 0 && <circle cx={width / 2} cy={height / 2} r={UNIT * 0.4} />}
                                </g>
                            )}
                            {step >= 2 && (
                                <path
                                    key={`${path.length}-${step}`}
                                    d={path}
                                    pathLength={1}
                                    className={step === 2 ? 'kolam-draw' : undefined}
                                    fill="none"
                                    stroke="#FF9933"
                                    strokeWidth={UNIT * 0.07}
                                    strokeLinecap="round"
                                />
                            )}
                            {dots.map(d => (
                                <circle key={`${d.x},${d.y}`} cx={(PAD + d.x) * UNIT} cy={(PAD + d.y) * UNIT} r={UNIT * 0.08} fill="white" />
                            ))}
                        </svg>
                    </div>

                    <div className="space-y-8">
                        <Card className="min-h-[220px] flex flex-col justify-center text-center p-8">
                            <h3 className="text-2xl font-bold text-orange-400 mb-4">{steps[step].title}</h3>
                            <p className="text-lg text-gray-300 leading-relaxed">{steps[step].text}</p>
                        </Card>
                        <div className="flex justify-center gap-4">
                            <Button variant="secondary" onClick={() => setStep(s => s - 1)} disabled={step === 0}>Previous</Button>
                            <Button onClick={togglePlay}>{playing ? 'Pause' : step >= last ? 'Restart' : 'Play'}</Button>
                            <Button variant="secondary" onClick={() => setStep(s => s + 1)} disabled={step === last}>Next</Button>
                        </div>
                        <div className="flex justify-center gap-2">
                            {steps.map((s, i) => (
                                <span key={s.title} className={`h-2 w-2 rounded-full ${i === step ? 'bg-orange-500' : 'bg-gray-700'}`} />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default KolamWalkthrough;
