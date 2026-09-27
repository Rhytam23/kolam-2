import React, { useMemo } from 'react';
import { designDots, loopPaths } from '../../utils/kolamLogic';
import { radialGuideDots, ringPath, ringStyle, type RadialDesign } from '../../utils/radial';
import type { Design } from '../../types/kolam';
import { geometricPoint, shapePath, type GeometricDesign } from '../../utils/geometric';
import { buildDesign, type DesignSpec } from '../../data/designs';
import { PALETTES } from '../../lib/colours';

export const RED_FLOOR = '#8E3B24';
export const RICE = '#F7F3EA';

/**
 * Shared SVG filters, rendered once on the page:
 * - `rice`: breaks up a clean line so it looks like rice flour let fall between the fingers
 * - `grain`: the speckle of a red-oxide or cement floor
 */
export const FloorArtDefs: React.FC = () => (
    <svg width="0" height="0" className="absolute" aria-hidden focusable="false">
        <defs>
            <filter id="rice" primitiveUnits="objectBoundingBox" x="-5%" y="-5%" width="110%" height="110%">
                {/* A slight hand-drawn wobble, then a fine powdery speckle that never fully erases the line. */}
                <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="4" result="noise" />
                <feDisplacementMap in="SourceGraphic" in2="noise" scale="0.005" xChannelSelector="R" yChannelSelector="G" result="rough" />
                <feTurbulence type="fractalNoise" baseFrequency="45" numOctaves="1" seed="9" result="speck" />
                <feColorMatrix in="speck" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -1.1 1.35" result="grain" />
                <feComposite in="rough" in2="grain" operator="in" />
            </filter>
            <filter id="grain" x="0" y="0" width="100%" height="100%">
                <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="3" seed="2" />
                <feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.16 0" />
            </filter>
        </defs>
    </svg>
);

const FRAMES = {
    // On cream paper: the double kaavi border drawn around a doorstep kolam.
    paper: 'rounded-2xl p-2 bg-white/70 kolam-border shadow-sm',
    // On the dark floor: a thin brass frame, like a plaque in an exhibition.
    plaque: 'rounded-2xl p-1.5 bg-gradient-to-br from-brass-light/70 via-brass/40 to-brass-light/60 shadow-[0_18px_40px_-18px_rgba(0,0,0,0.7)]',
};

/** A square of red-oxide floor, framed for cream paper or for the dark landing floor. */
export const FloorTile: React.FC<{ children: React.ReactNode; className?: string; label: string; frame?: keyof typeof FRAMES }> = ({ children, className = '', label, frame = 'paper' }) => (
    <figure className={`relative ${FRAMES[frame]} ${className}`}>
        <div className="relative overflow-hidden rounded-xl aspect-square" style={{ backgroundColor: RED_FLOOR }} role="img" aria-label={label}>
            <svg className="absolute inset-0 w-full h-full" aria-hidden><rect width="100%" height="100%" filter="url(#grain)" /></svg>
            {children}
        </div>
    </figure>
);

// ---------------------------------------------------------------- dot kolam frames

const UNIT = 40;
const PAD = 1;

/** How far each step has got, from 0 to 1, when a drawing follows the scroll instead of a stage. */
export interface DrawProgress {
    dots: number;
    lines: number;
    colour: number;
}

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const shownStyle = (visible: boolean): React.CSSProperties => ({ opacity: visible ? 1 : 0, transition: 'opacity 0.25s' });

/**
 * Shows the first `drawn` fraction of a path. A finished line is drawn solid: browsers measure long
 * curved paths slightly differently from their true length, which would leave a small gap at the end.
 */
const dashTo = (drawn: number) => (drawn >= 1 ? {} : { pathLength: 1, strokeDasharray: 1, strokeDashoffset: 1 - drawn });

interface KolamFrameProps {
    design: Design;
    /** 'dots' = only the pulli; 'line' = rice-flour line; 'colour' = each line in its own colour. */
    stage?: 'dots' | 'line' | 'colour';
    colours?: readonly string[];
    animate?: boolean;
    /** Follow this progress instead of `stage` (used by the scroll-driven hero). */
    progress?: DrawProgress;
    showDots?: boolean;
    /** Colour of the line before any colour is added (rice flour by default). */
    line?: string;
    /** The ground under the design, so the dots show up on it. */
    dotGround?: string;
}

export const KolamFrame: React.FC<KolamFrameProps> = ({ design, stage = 'line', colours = [], animate = false, progress, showDots = true, line: lineColour = RICE, dotGround = '#000000' }) => {
    const w = (design.cols - 1 + 2 * PAD) * UNIT;
    const h = (design.rows - 1 + 2 * PAD) * UNIT;
    const dots = designDots(design);
    const dotDelay = 0.09;
    if (progress) {
        const loops = loopPaths(design, UNIT, PAD);
        const shown = Math.round(clamp01(progress.dots) * dots.length);
        const line = { strokeWidth: UNIT * 0.085, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, fill: 'none', ...dashTo(clamp01(progress.lines)) };
        return (
            <svg viewBox={`0 0 ${w} ${h}`} className="absolute inset-0 w-full h-full">
                <g filter="url(#rice)">
                    {loops.map((d, i) => <path key={i} d={d} stroke={lineColour} {...line} />)}
                    {progress.colour > 0 && colours.length > 0 && (
                        <g opacity={clamp01(progress.colour)}>
                            {loops.map((d, i) => <path key={i} d={d} stroke={colours[i % colours.length]} {...line} />)}
                        </g>
                    )}
                    {showDots && dots.map((p, i) => (
                        <circle key={`${p.x},${p.y}`} cx={(PAD + p.x) * UNIT} cy={(PAD + p.y) * UNIT} r={UNIT * 0.09} fill={isDarkGround(dotGround) ? RICE : '#3B2416'} style={shownStyle(i < shown)} />
                    ))}
                </g>
            </svg>
        );
    }
    const paths = stage === 'dots' ? [] : loopPaths(design, UNIT, PAD);
    return (
        <svg viewBox={`0 0 ${w} ${h}`} className="absolute inset-0 w-full h-full">
            <g filter="url(#rice)">
                {paths.map((d, i) => (
                    <path
                        key={i}
                        d={d}
                        fill="none"
                        stroke={stage === 'colour' ? colours[i % colours.length] : RICE}
                        strokeWidth={UNIT * 0.085}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        pathLength={1}
                        className={animate ? 'kolam-draw' : undefined}
                        style={animate ? { animationDelay: `${dots.length * dotDelay + 0.4}s`, animationDuration: '4.5s' } : undefined}
                    />
                ))}
                {showDots && dots.map((p, i) => (
                    <circle
                        key={`${p.x},${p.y}`}
                        cx={(PAD + p.x) * UNIT}
                        cy={(PAD + p.y) * UNIT}
                        r={UNIT * 0.09}
                        fill={RICE}
                        className={animate ? 'fade-in' : undefined}
                        style={animate ? { animationDelay: `${i * dotDelay}s`, animationDuration: '0.3s' } : undefined}
                    />
                ))}
            </g>
        </svg>
    );
};

// ---------------------------------------------------------------- rangoli frames

interface RangoliFrameProps {
    design: RadialDesign;
    /** 'dots' = guide dots; 'join' = outlines joined through the dots; 'colour' = filled. */
    stage?: 'dots' | 'join' | 'colour';
    /** For 'join': how many rings (from the centre) are drawn; the last one is highlighted. */
    ringsDrawn?: number;
    animate?: boolean;
    showDots?: boolean;
    showLines?: boolean;
    /** Follow this progress instead of `stage`; rings are joined one after another, from the centre. */
    progress?: DrawProgress;
    /** Give the lines a powdery, hand-drawn texture (costly to redraw on every scroll frame). */
    rough?: boolean;
}

export const RangoliFrame: React.FC<RangoliFrameProps> = ({ design, stage = 'colour', ringsDrawn, animate = false, showDots = true, showLines = true, progress, rough = true }) => {
    const rings = useMemo(() => [...design.rings].reverse(), [design]);
    const paths = useMemo(() => rings.map(ringPath), [rings]);
    const dots = useMemo(() => radialGuideDots(design), [design]);
    const lineWidth = (r: RadialDesign['rings'][number]) => (r.motif === 'curl' ? 0.011 : 0.016);
    if (progress) {
        const shownDots = Math.round(clamp01(progress.dots) * dots.length);
        const colour = clamp01(progress.colour);
        return (
            <svg viewBox="-1.15 -1.15 2.3 2.3" className="absolute inset-0 w-full h-full">
                <g filter={rough ? 'url(#rice)' : undefined}>
                    {rings.map((r, i) => {
                        // Dot rings are the dots themselves: they are coloured, not drawn round.
                        const drawn = r.motif === 'dot' ? 0 : clamp01(progress.lines * rings.length - i);
                        return drawn > 0 && (
                            <path key={i} d={paths[i]} fill="none" stroke={RICE} strokeWidth={lineWidth(r)} strokeLinejoin="round" {...dashTo(drawn)} />
                        );
                    })}
                    {/* Guide dots disappear under the colour, unless they were put down in colour. */}
                    <g opacity={design.dotsInColour ? 1 : 1 - 0.75 * colour}>
                        {dots.map((p, i) => (
                            <circle key={i} cx={p.x} cy={p.y} r={p.size ?? (p.ring < 0 ? 0.03 : 0.02)} fill={p.color ?? RICE} style={shownStyle(i < shownDots)} />
                        ))}
                    </g>
                </g>
                {colour > 0 && !design.dotsInColour && (
                    <g opacity={colour}>
                        {rings.map((r, i) => {
                            const s = ringStyle(design, r);
                            return r.filled && <path key={i} d={paths[i]} fill={s.fill} stroke={s.stroke} strokeWidth={s.strokeWidth} strokeLinejoin="round" />;
                        })}
                        <circle r={0.09} fill={design.centre} />
                    </g>
                )}
            </svg>
        );
    }
    const shown = stage === 'dots' ? 0 : ringsDrawn ?? rings.length;
    const dotDelay = 1.6 / dots.length;
    const joinStart = animate ? 2 : 0;
    const ringTime = 1.2;
    return (
        <svg viewBox="-1.15 -1.15 2.3 2.3" className="absolute inset-0 w-full h-full">
            {stage === 'colour' && (
                <g className={animate ? 'fade-in' : undefined} style={animate ? { animationDelay: `${joinStart + rings.length * ringTime}s`, animationDuration: '1.2s' } : undefined}>
                    {design.rings.map((r, i) => {
                        const s = ringStyle(design, r);
                        return <path key={i} d={ringPath(r)} fill={s.fill} stroke="none" />;
                    })}
                    <circle r={0.09} fill={design.centre} />
                </g>
            )}
            <g filter="url(#rice)">
                {showLines && rings.slice(0, stage === 'colour' ? rings.length : shown).map((r, i) => (
                    <path
                        key={i}
                        d={ringPath(r)}
                        fill="none"
                        stroke={stage === 'join' && i === shown - 1 && !animate ? '#FFD27A' : RICE}
                        strokeWidth={0.016}
                        strokeLinejoin="round"
                        pathLength={1}
                        className={animate ? 'kolam-draw' : undefined}
                        style={animate ? { animationDelay: `${joinStart + i * ringTime}s`, animationDuration: `${ringTime}s` } : undefined}
                    />
                ))}
                {showDots && dots.map((p, i) => (
                    <circle
                        key={i}
                        cx={p.x}
                        cy={p.y}
                        r={p.size ?? (p.ring < 0 ? 0.03 : 0.022)}
                        fill={p.color ?? RICE}
                        className={animate ? 'fade-in' : undefined}
                        style={animate ? { animationDelay: `${i * dotDelay}s`, animationDuration: '0.25s' } : undefined}
                    />
                ))}
            </g>
        </svg>
    );
};

// ---------------------------------------------------------------- straight-line frames

/** A straight-line design drawn as by hand: the dot grid, then each group of shapes, then colour. */
export const GeometricFrame: React.FC<{ design: GeometricDesign; progress?: DrawProgress }> = ({ design, progress = { dots: 1, lines: 1, colour: 1 } }) => {
    const unit = 40;
    const side = (design.size + 1) * unit;
    const paths = useMemo(() => design.shapes.map(shape => shapePath(design, shape, unit)), [design]);
    const shownDots = Math.round(clamp01(progress.dots) * design.dots.length);
    const groups = design.groups.length;
    const colour = clamp01(progress.colour);
    const dotColour = isDarkGround(design.background) ? RICE : '#3B2416';
    return (
        <svg viewBox={`0 0 ${side} ${side}`} className="absolute inset-0 w-full h-full">
            {colour > 0 && (
                <g opacity={colour}>
                    {design.shapes.map((shape, i) => shape.fill && <path key={i} d={paths[i]} fill={shape.fill} />)}
                </g>
            )}
            <g fill="none" stroke={design.line} strokeWidth={unit * 0.06} strokeLinejoin="round" strokeLinecap="round">
                {design.shapes.map((shape, i) => {
                    const drawn = clamp01(progress.lines * groups - shape.group);
                    return drawn > 0 && <path key={i} d={paths[i]} {...dashTo(drawn)} />;
                })}
            </g>
            <g fill={dotColour}>
                {design.dots.map((_, i) => {
                    const p = geometricPoint(design, i, unit);
                    return <circle key={i} cx={p.x} cy={p.y} r={unit * 0.07} style={shownStyle(i < shownDots)} />;
                })}
            </g>
        </svg>
    );
};

const isDarkGround = (hex: string) => {
    const [r, g, b] = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16));
    return 0.299 * r + 0.587 * g + 0.114 * b < 140;
};

/** Any design, from its spec, drawn to the given progress (finished if none is given). */
export const DesignFrame: React.FC<{ spec: DesignSpec; progress?: DrawProgress; rough?: boolean }> = ({ spec, progress, rough = true }) => {
    const built = useMemo(() => buildDesign(spec), [spec]);
    const full = progress ?? { dots: 1, lines: 1, colour: 1 };
    if (built.mode === 'radial') return <RangoliFrame design={built.design} progress={full} rough={rough} />;
    if (built.mode === 'geometric') return <GeometricFrame design={built.design} progress={full} />;
    const colours = PALETTES[spec.palette].colors;
    return (
        <div className="absolute inset-[6%]">
            <KolamFrame design={built.design} progress={{ ...full, colour: colours.length > 1 ? full.colour : 0 }} colours={colours} line={colours[0]} dotGround={PALETTES[spec.palette].background} />
        </div>
    );
};
