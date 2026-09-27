import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { useKolam } from './KolamContext';
import { loopPaths } from '../utils/kolamLogic';
import { guideDotColour, ringPath, ringStyle } from '../utils/radial';
import { kolamDotColour } from '../lib/artwork';
import { KOLAM_UNIT, currentGroup, expectedDots, finishGroup, isFinished, kolamPlan, radialPlan, startPractice, tapDot, type PracticePlan } from '../utils/practice';

const HINT = '#C62839';
const SINGULAR: Record<string, string> = { petals: 'petal', leaves: 'leaf', curls: 'curl', circle: 'circle', bends: 'bend', shapes: 'shape' };

const instructions = (plan: PracticePlan, group: number) => {
    const shape = plan.shapes[group];
    if (plan.kind === 'kolam') return 'The line never touches a dot: it bends round one dot, then the next. Start at the ringed dot and tap each dot in the order the line goes round it.';
    if (shape === 'curls') return 'Tap each dot to wind a curl round it: start at the pointed tip and curl in round the dot. Go round the ring one dot after another.';
    if (shape === 'circle') return 'Tap the dots round the centre one after another to draw the circle through them.';
    return `Tap the dot where a ${SINGULAR[shape] ?? 'shape'} starts, then the dots along its edge in order, and back to the start. Either way round is fine.`;
};

/** Draw the design in the studio yourself, by tapping its dots in the order the line goes. */
const Practice: React.FC = () => {
    const k = useKolam();
    const plan = useMemo(() => (k.mode === 'kolam' ? kolamPlan(k.design) : k.mode === 'radial' ? radialPlan(k.radial) : null), [k.mode, k.design, k.radial]);
    const [state, setState] = useState(() => (plan ? startPractice(plan) : null));
    const [misses, setMisses] = useState(0);
    const [hint, setHint] = useState(false);
    const [ghost, setGhost] = useState(true);
    const [message, setMessage] = useState('');
    const [flash, setFlash] = useState<{ dot: number; ok: boolean; at: number } | null>(null);
    const svg = useRef<SVGSVGElement>(null);

    const restart = () => {
        if (plan) setState(startPractice(plan));
        setMisses(0);
        setHint(false);
        setMessage('');
    };
    useEffect(restart, [plan]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        if (!flash) return;
        const timer = setTimeout(() => setFlash(null), 450);
        return () => clearTimeout(timer);
    }, [flash]);

    if (!plan || !state) {
        return <Card><p className="text-ink">Practice works with dot kolams and rangoli designs from the studio. Choose one above, then come back here.</p></Card>;
    }

    const background = plan.kind === 'kolam' ? k.kolamColours.background : k.radial.background;
    const line = plan.kind === 'kolam' ? k.kolamColours.colors[0] : guideDotColour(background);
    const dotColour = plan.kind === 'kolam' ? kolamDotColour(background) : line;
    const finished = isFinished(state);
    const group = currentGroup(plan, state);
    const expected = finished ? [] : expectedDots(plan, state);
    const showHint = hint || misses >= 2;
    const [vx, vy, vw, vh] = plan.viewBox.split(' ').map(Number);
    const strokesDone = state.done.filter(Boolean).length;
    const inGroup = plan.strokes.filter(s => s.group === group);
    const groupDone = inGroup.filter(s => state.done[plan.strokes.indexOf(s)]).length;

    const ghostPaths = plan.kind === 'kolam'
        ? loopPaths(k.design, KOLAM_UNIT, 1)
        : k.radial.rings.filter(r => r.motif !== 'dot').map(ringPath);

    const onPointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
        if (finished || !svg.current) return;
        const matrix = svg.current.getScreenCTM();
        if (!matrix) return;
        const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(matrix.inverse());
        let best = -1;
        let bestDistance = Infinity;
        plan.dots.forEach((d, i) => {
            const distance = Math.hypot(d.x - p.x, d.y - p.y);
            if (distance < bestDistance) { best = i; bestDistance = distance; }
        });
        // Ignore taps far from any dot.
        if (best < 0 || bestDistance > Math.max(plan.dotRadius * 6, vw * 0.06)) return;
        const result = tapDot(plan, state, best);
        setFlash({ dot: best, ok: result.ok, at: Date.now() });
        if (result.ok) {
            setState(result.state);
            setMisses(0);
            setHint(false);
            if (isFinished(result.state)) setMessage('Well done! You have drawn the whole design. Now it is ready for colour.');
            else if (currentGroup(plan, result.state) !== group) setMessage(`Well done, that finishes ${plan.groups[group]}. On to the next.`);
            else setMessage(result.finishedStroke ? 'Good. Next one.' : '');
        } else {
            setMisses(m => m + 1);
            setMessage(state.active
                ? 'Not that dot. The line goes on to a dot close to the last one; the red ring shows where.'
                : plan.kind === 'kolam' ? 'Start at the ringed dot.' : `Start a ${SINGULAR[plan.shapes[group]] ?? 'shape'} of ${plan.groups[group]}: the red rings show where you can begin.`);
        }
    };

    const colourFinal = finished && (
        plan.kind === 'kolam'
            ? loopPaths(k.design, KOLAM_UNIT, 1).map((d, i) => <path key={i} d={d} fill="none" stroke={k.kolamColours.colors[i % k.kolamColours.colors.length]} strokeWidth={plan.lineWidth} strokeLinecap="round" />)
            : [...k.radial.rings].map((r, i) => { const s = ringStyle(k.radial, r); return <path key={i} d={ringPath(r)} fill={s.fill} stroke={s.stroke} strokeWidth={s.strokeWidth} strokeLinejoin="round" className="fade-in" />; })
    );

    return (
        <div className="grid md:grid-cols-2 gap-10 items-start">
            <div className="kolam-border rounded-2xl p-3 bg-white/60">
                <svg
                    ref={svg}
                    viewBox={plan.viewBox}
                    className="w-full aspect-square touch-manipulation cursor-pointer select-none"
                    onPointerDown={onPointerDown}
                    role="application"
                    aria-label="Practice drawing: tap the dots in order"
                >
                    <rect x={vx} y={vy} width={vw} height={vh} fill={background} />
                    {ghost && !finished && <g fill="none" stroke={line} strokeOpacity={0.16} strokeWidth={plan.lineWidth}>{ghostPaths.map((d, i) => <path key={i} d={d} />)}</g>}
                    {colourFinal || (
                        <g fill="none" stroke={line} strokeWidth={plan.lineWidth} strokeLinecap="round" strokeLinejoin="round">
                            {state.drawn.map((d, i) => <path key={i} d={d} />)}
                        </g>
                    )}
                    <g fill={dotColour}>{plan.dots.map((d, i) => <circle key={i} cx={d.x} cy={d.y} r={plan.dotRadius} />)}</g>
                    {!finished && (plan.kind === 'kolam' && !state.active || showHint) && expected.map(i => (
                        <circle key={`h${i}`} cx={plan.dots[i].x} cy={plan.dots[i].y} r={plan.dotRadius * 2.6} fill="none" stroke={HINT} strokeWidth={plan.dotRadius * 0.7} className={showHint ? 'animate-pulse' : undefined} />
                    ))}
                    {flash && (
                        <circle key={flash.at} cx={plan.dots[flash.dot].x} cy={plan.dots[flash.dot].y} r={plan.dotRadius * 3.2} fill="none" stroke={flash.ok ? '#2E7D32' : HINT} strokeWidth={plan.dotRadius * 0.6} className="fade-in" />
                    )}
                </svg>
            </div>
            <div className="space-y-5">
                <Card className="space-y-3">
                    <p className="text-xs uppercase tracking-widest text-muted">
                        {finished ? 'Finished' : `Drawing ${plan.groups[group]} of ${plan.groups.length}`}
                    </p>
                    <h3 className="font-heading text-2xl text-kaavi">{finished ? 'You drew it!' : 'Draw it yourself'}</h3>
                    <p className="text-ink leading-relaxed">{finished ? 'Every line is in place, in the order it is drawn by hand. Try it on paper or on the floor next, or pick another design in the studio.' : instructions(plan, group)}</p>
                    <div>
                        <div className="h-2 rounded-full bg-kaavi/15 overflow-hidden" role="progressbar" aria-valuemin={0} aria-valuemax={plan.strokes.length} aria-valuenow={strokesDone}>
                            <div className="h-full bg-kaavi transition-all" style={{ width: `${(100 * strokesDone) / plan.strokes.length}%` }} />
                        </div>
                        {!finished && <p className="mt-1 text-sm text-muted">{groupDone} of {inGroup.length} {plan.shapes[group] === 'circle' ? 'circles' : plan.shapes[group]} in {plan.groups[group]}</p>}
                    </div>
                    <p className="text-sm min-h-[1.25rem] text-ink" aria-live="polite">{message}</p>
                </Card>
                <div className="flex flex-wrap justify-center gap-3">
                    {!finished && <Button variant="secondary" size="sm" onClick={() => setHint(true)}>Show me where</Button>}
                    {!finished && <Button variant="secondary" size="sm" onClick={() => { setState(finishGroup(plan, state)); setMessage(`${plan.groups[group][0].toUpperCase()}${plan.groups[group].slice(1)} drawn for you.`); }}>Finish this {plan.kind === 'kolam' ? 'line' : 'ring'} for me</Button>}
                    <Button size="sm" onClick={restart}>Start again</Button>
                </div>
                <label className="flex items-center justify-center gap-2 text-sm text-ink">
                    <input type="checkbox" checked={ghost} onChange={e => setGhost(e.target.checked)} className="accent-kaavi w-4 h-4" />
                    Show the design faintly underneath
                </label>
            </div>
        </div>
    );
};

export default Practice;
