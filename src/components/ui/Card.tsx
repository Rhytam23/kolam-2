import React from 'react';

export const Card: React.FC<{ children: React.ReactNode, className?: string }> = ({ children, className = '' }) => (
    <div className={`bg-white/85 p-6 culture-card ${className}`}>
        {children}
    </div>
);
