import React from 'react';
import { Ornament } from '../culture/Ornaments';
import { useCulture } from '../culture/CultureContext';

/** A section title with the art form's own motif (a lit diya by default) on a thin brass rule beneath it. */
/** `level` 1 makes the title the page's h1 (every page has exactly one); the look is the same. */
export const SectionHeading: React.FC<{ title: string; kicker?: string; dark?: boolean; className?: string; level?: 1 | 2 }> = ({ title, kicker, dark = false, className = 'mb-4', level = 2 }) => {
    const { ornament } = useCulture();
    const Title = level === 1 ? 'h1' : 'h2';
    return (
    <div className={`text-center ${className}`}>
        {kicker && <p className={`font-semibold tracking-wide mb-2 ${dark ? 'text-brass-light' : 'text-kaavi'}`}>{kicker}</p>}
        <Title className={`font-heading text-4xl md:text-5xl ${dark ? 'text-rice' : 'gradient-text'}`}>{title}</Title>
        <div className="brass-rule max-w-xs mx-auto mt-3" aria-hidden><Ornament id={ornament} className="h-8 w-8 shrink-0" /></div>
    </div>
    );
};
