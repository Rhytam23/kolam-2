import React from 'react';
import { useInView } from '../../hooks/motion';

/** Fades its content up into place the first time it scrolls into view. */
const Reveal: React.FC<{ children: React.ReactNode; className?: string; delay?: number; as?: 'div' | 'li' | 'figure' }> = ({ children, className = '', delay = 0, as: Tag = 'div' }) => {
    const [ref, inView] = useInView<HTMLElement>();
    return (
        <Tag ref={ref as React.Ref<never>} className={`reveal ${inView ? 'in' : ''} ${className}`} style={delay ? { transitionDelay: `${delay}ms` } : undefined}>
            {children}
        </Tag>
    );
};

export default Reveal;
