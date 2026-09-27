import React, { useMemo } from 'react';
import { designDots, loopPaths, makeDesign } from '../../utils/kolamLogic';

const UNIT = 20;

/**
 * A kolam border band: one row of dots with a line crossing between every pair. A single row always
 * closes into one continuous line, the way border kolams are drawn along a doorstep.
 */
const KolamDivider: React.FC<{ dots?: number; tone?: 'rice' | 'kaavi'; className?: string }> = ({ dots = 21, tone = 'kaavi', className = '' }) => {
    const { paths, points } = useMemo(() => {
        const design = makeDesign(1, dots, () => true);
        return { paths: loopPaths(design, UNIT, 1), points: designDots(design) };
    }, [dots]);
    const colour = tone === 'rice' ? '#F7F3EA' : '#A63A1E';
    return (
        <div className={`flex justify-center px-4 ${className}`} aria-hidden>
            <svg viewBox={`0 0 ${(dots + 1) * UNIT} ${2 * UNIT}`} className={`w-full max-w-3xl ${tone === 'rice' ? 'glow' : 'opacity-60'}`}>
                {paths.map((d, i) => <path key={i} d={d} fill="none" stroke={colour} strokeWidth={1.8} strokeLinecap="round" />)}
                {points.map(p => <circle key={p.x} cx={(p.x + 1) * UNIT} cy={UNIT} r={1.9} fill={colour} />)}
            </svg>
        </div>
    );
};

export default KolamDivider;
