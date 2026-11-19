import React from 'react';

export const Label: React.FC<React.LabelHTMLAttributes<HTMLLabelElement>> = ({ children, className = '', ...props }) => (
    <label className={`block mb-2 text-sm font-semibold text-muted ${className}`} {...props}>
        {children}
    </label>
);
