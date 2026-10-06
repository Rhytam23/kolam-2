/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        paper: 'rgb(var(--paper) / <alpha-value>)',     // a freshly washed threshold
        sand: '#FBEBD3',
        ink: 'rgb(var(--ink) / <alpha-value>)',       // dark brown text
        muted: 'rgb(var(--muted) / <alpha-value>)',
        kaavi: 'rgb(var(--kaavi) / <alpha-value>)',     // red-earth border colour
        marigold: '#F08A00',
        turmeric: '#E1AD01',
        leaf: '#2E7D32',
        kumkum: '#C62839',
        floor: 'rgb(var(--floor) / <alpha-value>)',     // deep red-oxide floor of the landing
        'floor-2': 'rgb(var(--floor-2) / <alpha-value>)',
        brass: 'rgb(var(--brass) / <alpha-value>)',     // lamp brass, for accents on the dark floor
        'brass-light': 'rgb(var(--brass-light) / <alpha-value>)',
        rice: 'rgb(var(--rice) / <alpha-value>)',      // rice flour
      },
      fontFamily: {
        heading: ['var(--font-heading)', '"Tiro Tamil"', 'Georgia', 'serif'],
        sans: ['"Hind Madurai"', 'system-ui', 'sans-serif'],
        script: ['"Tiro Tamil"', '"Tiro Telugu"', '"Tiro Devanagari Hindi"', '"Tiro Bangla"', '"Tiro Kannada"', '"Noto Serif Malayalam"', '"Noto Serif Oriya"', 'serif'],
      },
      animation: {
        'fade-in-down': 'fade-in-down 0.5s ease-out forwards',
      },
      keyframes: {
        'fade-in-down': {
          '0%': { opacity: 0, transform: 'translateY(-20px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
