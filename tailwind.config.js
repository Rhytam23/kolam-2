/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './App.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './utils/**/*.{js,ts,jsx,tsx}',
    './index.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        saffron: '#FF9933',
        indiaGreen: '#138808',
        marigold: '#FDB813',
        festivePink: '#E91E63',
        deepRed: '#8B0000',
      },
      animation: {
        'diya-flicker': 'diya-flicker 3s infinite',
        'spin-slow': 'spin 60s linear infinite',
        'rangoli-draw': 'rangoli-draw 6s ease-in-out forwards',
        'fade-in-down': 'fade-in-down 0.5s ease-out forwards',
        'float-up': 'float-up 3s ease-in-out infinite',
      },
      keyframes: {
        'diya-flicker': {
          '0%, 100%': { opacity: 0.8, transform: 'scale(1)' },
          '20%': { opacity: 0.6, transform: 'scale(0.95)' },
          '40%': { opacity: 0.9, transform: 'scale(1.05)' },
          '60%': { opacity: 0.5, transform: 'scale(0.9)' },
          '80%': { opacity: 1, transform: 'scale(1.1)' },
        },
        'rangoli-draw': {
          '0%': { strokeDasharray: '30000', strokeDashoffset: '30000' },
          '100%': { strokeDasharray: '30000', strokeDashoffset: '0' },
        },
        'fade-in-down': {
          '0%': { opacity: 0, transform: 'translateY(-20px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        'float-up': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      }
    }
  },
  plugins: [],
}
