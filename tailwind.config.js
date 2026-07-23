/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          950: '#0a0a0f',
          900: '#12121a',
          850: '#1a1a24',
          800: '#22222e',
          700: '#2e2e3e',
          600: '#3a3a4a',
          500: '#5a5a6a',
          400: '#7a7a8a',
          300: '#a0a0b0',
          200: '#c0c0d0',
          100: '#e0e0e8',
        },
        gold: {
          50: '#fffaeb',
          100: '#fff3c4',
          200: '#ffe588',
          300: '#ffd24d',
          400: '#f5b513',
          500: '#d99500',
          600: '#b07300',
          700: '#885500',
          800: '#5f3d00',
          900: '#3a2600',
        },
        sky: {
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
        },
        flame: {
          500: '#f97316',
          400: '#fb923c',
        },
      },
      fontFamily: {
        sans: ['Tajawal', 'system-ui', 'sans-serif'],
        display: ['Cairo', 'Tajawal', 'sans-serif'],
      },
      boxShadow: {
        'glow-gold': '0 0 24px -6px rgba(245, 181, 19, 0.4)',
        'glow-sky': '0 0 24px -6px rgba(56, 189, 248, 0.4)',
        'glow-flame': '0 0 20px -4px rgba(251, 146, 60, 0.5)',
      },
      keyframes: {
        'fade-in': {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        pop: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.4s ease-out',
        pop: 'pop 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
    },
  },
  plugins: [],
};
