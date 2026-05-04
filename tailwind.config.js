import typography from '@tailwindcss/typography';

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './index.html',
    './index.tsx',
    './App.tsx',
    './i18n.ts',
    './types.ts',
    './components/**/*.{ts,tsx}',
    './contexts/**/*.{ts,tsx}',
    './hooks/**/*.{ts,tsx}',
    './services/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        accent: {
          50: 'rgb(var(--accent-color) / 0.05)',
          100: 'rgb(var(--accent-color) / 0.1)',
          200: 'rgb(var(--accent-color) / 0.2)',
          300: 'rgb(var(--accent-color) / 0.4)',
          400: 'rgb(var(--accent-color) / 0.6)',
          500: 'rgb(var(--accent-color) / 1)',
          600: 'rgb(var(--accent-color) / 0.9)',
          700: 'rgb(var(--accent-color) / 0.8)',
          800: 'rgb(var(--accent-color) / 0.7)',
          900: 'rgb(var(--accent-color) / 0.6)',
          950: 'rgb(var(--accent-color) / 0.5)',
        },
      },
    },
  },
  plugins: [typography],
};
