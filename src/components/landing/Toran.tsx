import React from 'react';

/*
 * A festive toran across the top of the doorway: a scalloped marigold garland, strings of marigolds
 * hanging at each peak, and pairs of mango leaves between them.
 */

const SPAN = 150;
const SPANS = 10;
const WIDTH = SPAN * SPANS;

const Marigold: React.FC<{ x: number; y: number; r?: number; yellow?: boolean }> = ({ x, y, r = 8, yellow }) => (
    <g>
        <circle cx={x} cy={y} r={r} fill={yellow ? 'url(#toran-yellow)' : 'url(#toran-orange)'} />
        <circle cx={x} cy={y} r={r - 2.2} fill="none" stroke={yellow ? '#C98A00' : '#B85A00'} strokeWidth={1.6} strokeDasharray="1.6 1.9" opacity={0.7} />
    </g>
);

const Leaf: React.FC<{ angle: number }> = ({ angle }) => (
    <g transform={`rotate(${angle})`}>
        <path d="M0 0C9 12 9 34 0 50-9 34-9 12 0 0Z" fill="#2E7D32" />
        <path d="M0 3V46" stroke="#8BC34A" strokeWidth={1.2} opacity={0.8} />
    </g>
);

const Toran: React.FC<{ className?: string }> = ({ className = '' }) => {
    const peaks = Array.from({ length: SPANS + 1 }, (_, k) => k * SPAN);
    return (
        <svg viewBox={`0 0 ${WIDTH} 120`} preserveAspectRatio="xMidYMin slice" className={`block w-full h-20 md:h-24 ${className}`} aria-hidden focusable="false">
            <defs>
                <radialGradient id="toran-orange" cx="0.35" cy="0.35">
                    <stop offset="0" stopColor="#FFB547" />
                    <stop offset="1" stopColor="#E06A00" />
                </radialGradient>
                <radialGradient id="toran-yellow" cx="0.35" cy="0.35">
                    <stop offset="0" stopColor="#FFE27A" />
                    <stop offset="1" stopColor="#E9A800" />
                </radialGradient>
            </defs>
            <rect width={WIDTH} height={5} fill="#C9973A" />
            {/* mango leaves between the strings */}
            {peaks.slice(0, -1).map((x, k) => (
                <g key={`l${k}`} transform={`translate(${x + SPAN / 2} 4)`}>
                    <g className="sway" style={{ animationDelay: `${-k * 0.7}s` }}>
                        <Leaf angle={16} />
                        <Leaf angle={-16} />
                        <Leaf angle={0} />
                    </g>
                </g>
            ))}
            {/* scalloped garland */}
            {peaks.slice(0, -1).map((x, k) => (
                <g key={`s${k}`}>
                    {Array.from({ length: 8 }, (_, i) => {
                        const t = (i + 0.5) / 8;
                        const px = x + t * SPAN;
                        const py = 7 + 4 * t * (1 - t) * 34;
                        return <Marigold key={i} x={px} y={py} r={7.5} yellow={i % 2 === 1} />;
                    })}
                </g>
            ))}
            {/* hanging strings at each peak */}
            {peaks.map((x, k) => (
                <g key={`h${k}`} transform={`translate(${x} 4)`}>
                    <g className="sway" style={{ animationDelay: `${-k * 1.1}s` }}>
                        <line x1={0} y1={0} x2={0} y2={96} stroke="#8A5A1C" strokeWidth={1} />
                        {[12, 28, 44, 60, 76].map((y, i) => <Marigold key={y} x={0} y={y} r={8} yellow={(i + k) % 2 === 0} />)}
                        <path d="M-4 86L0 104 4 86Z" fill="#C62839" />
                    </g>
                </g>
            ))}
        </svg>
    );
};

export default Toran;
