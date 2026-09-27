import React from 'react';
import Diya from '../landing/Diya';

/** A section title with a lit diya on a thin brass rule beneath it. */
export const SectionHeading: React.FC<{ title: string; kicker?: string; dark?: boolean; className?: string }> = ({ title, kicker, dark = false, className = 'mb-4' }) => (
    <div className={`text-center ${className}`}>
        {kicker && <p className={`font-semibold tracking-wide mb-2 ${dark ? 'text-brass-light' : 'text-kaavi'}`}>{kicker}</p>}
        <h2 className={`font-heading text-4xl md:text-5xl ${dark ? 'text-rice' : 'gradient-text'}`}>{title}</h2>
        <div className="brass-rule max-w-xs mx-auto mt-3" aria-hidden><Diya className="h-8 w-8 shrink-0" /></div>
    </div>
);
