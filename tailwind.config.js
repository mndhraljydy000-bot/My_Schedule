/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Tajawal', 'system-ui', 'sans-serif'],
        display: ['Cairo', 'Tajawal', 'sans-serif'],
      },
      colors: {
        gold: {
          50: '#fbf7ed', 100: '#f8eec8', 200: '#f3df9b', 300: '#eccd6a',
          400: '#dcb33d', 500: '#c49a2a', 600: '#a47a1f', 700: '#855f1d',
          800: '#6e4d1e', 900: '#5e411d',
        },
        ink: {
          50: '#f5f5f7', 100: '#e7e7ea', 200: '#c9c9d0', 300: '#9a9aa6',
          400: '#6e6e7c', 500: '#4a4a57', 600: '#34343f', 700: '#26262e',
          800: '#1a1a20', 850: '#141418', 900: '#0c0c0f', 950: '#070709',
        },
        flame: {
          400: '#fb923c', 500: '#f97316', 600: '#ea580c',
        },
      },
      boxShadow: {
        soft: '0 4px 20px -4px rgba(0,0,0,0.4)',
        'glow-gold': '0 0 24px -4px rgba(220,179,61,0.4)',
        'glow-sky': '0 0 24px -4px rgba(14,165,233,0.4)',
        'glow-emerald': '0 0 24px -4px rgba(52,211,153,0.4)',
        'glow-flame': '0 0 24px -4px rgba(249,115,22,0.4)',
      },
      keyframes: {
        'fade-in': { from: { opacity: '0' }, to: { opacity: '1' } },
        'fade-up': { from: { opacity: '0', transform: 'translateY(10px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        pop: { '0%': { opacity: '0', transform: 'scale(0.95)' }, '100%': { opacity: '1', transform: 'scale(1)' } },
        'flame-flicker': {
          '0%,100%': { transform: 'scale(1) rotate(-2deg)', filter: 'brightness(1)' },
          '50%': { transform: 'scale(1.15) rotate(2deg)', filter: 'brightness(1.3)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.4s ease-out',
        'fade-up': 'fade-up 0.5s ease-out',
        pop: 'pop 0.3s ease-out',
        'flame-flicker': 'flame-flicker 1.5s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
