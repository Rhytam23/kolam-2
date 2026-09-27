import React from 'react';

export const Card: React.FC<{ children: React.ReactNode, className?: string }> = ({ children, className = '' }) => (
    <div className={`bg-white/85 border border-kaavi/15 p-6 rounded-2xl shadow-sm ${className}`}>
        {children}
    </div>
);
