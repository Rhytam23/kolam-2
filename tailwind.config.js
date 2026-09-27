/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        paper: '#FFF8EE',     // a freshly washed threshold
        sand: '#FBEBD3',
        ink: '#3B2416',       // dark brown text
        muted: '#6B5443',
        kaavi: '#A63A1E',     // red-earth border colour
        marigold: '#F08A00',
        turmeric: '#E1AD01',
        leaf: '#2E7D32',
        kumkum: '#C62839',
      },
      fontFamily: {
        heading: ['"Tiro Tamil"', 'Georgia', 'serif'],
        sans: ['"Hind Madurai"', 'system-ui', 'sans-serif'],
        script: ['"Tiro Tamil"', '"Tiro Telugu"', '"Tiro Devanagari Hindi"', '"Tiro Bangla"', 'serif'],
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
