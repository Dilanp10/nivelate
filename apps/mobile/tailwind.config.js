/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{ts,tsx}', './src/**/*.{ts,tsx}'],
  presets: [require('nativewind/preset')],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Tokens semánticos — evolucionamos el design system en módulos posteriores.
        bg: '#0f172a',
        surface: '#1e293b',
        border: '#334155',
        text: '#f8fafc',
        muted: '#94a3b8',
        brand: {
          DEFAULT: '#22d3ee',
          dark: '#0891b2',
        },
        danger: '#ef4444',
      },
      fontFamily: {
        sans: ['System'],
      },
    },
  },
  plugins: [],
};
