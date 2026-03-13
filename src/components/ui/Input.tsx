
import React from 'react';

export const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = ({ className, ...props }) => {
    return (
        <input
            className={`w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-orange-500 focus:border-orange-500 transition-colors ${className}`}
            {...props}
        />
    );
};
