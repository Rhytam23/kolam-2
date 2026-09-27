
import React from 'react';

export const Card: React.FC<{ children: React.ReactNode, className?: string }> = ({ children, className }) => {
    return (
        <div className={`bg-indigo-900/10 border border-indigo-800/50 p-6 rounded-xl shadow-lg backdrop-blur-sm transition-all duration-300 hover:border-orange-500/50 hover:shadow-orange-900/40 ${className}`}>
            {children}
        </div>
    );
};
