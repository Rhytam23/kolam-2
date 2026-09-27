
import React from 'react';

export const Label: React.FC<React.LabelHTMLAttributes<HTMLLabelElement>> = ({ children, className = '', ...props }) => {
    return (
        <label
            className={`block mb-2 text-sm font-medium text-gray-300 ${className}`}
            {...props}
        >
            {children}
        </label>
    );
};
