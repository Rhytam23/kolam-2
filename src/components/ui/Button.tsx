import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary';
    size?: 'md' | 'sm';
}

export const Button: React.FC<ButtonProps> = ({ children, className = '', variant = 'primary', size = 'md', ...props }) => {
    const base = 'font-semibold rounded-full transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-kaavi disabled:opacity-40 disabled:cursor-not-allowed';
    const sizes = { md: 'px-7 py-3', sm: 'px-4 py-2 text-sm' };
    const variants = {
        primary: 'bg-kaavi text-paper hover:bg-kumkum shadow-sm',
        secondary: 'border-2 border-kaavi text-kaavi bg-white/60 hover:bg-kaavi/10',
    };
    return (
        <button className={`${base} ${sizes[size]} ${variants[variant]} ${className}`} {...props}>
            {children}
        </button>
    );
};
