/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{ts,tsx}', './src/**/*.{ts,tsx}'],
  presets: [require('nativewind/preset')],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Base neutra desaturada: deja que el verde sea el único color saturado
        // del fondo. El navy anterior (#0f172a) competía con el brand.
        bg: '#131f24',
        surface: '#1c2b32',
        'surface-light': '#24363f',
        border: '#37464f',
        text: '#f7fafc',
        muted: '#8fa3ad',

        // Roles semánticos. Cada color significa una cosa y solo una:
        // verde = acción primaria / correcto · azul = repaso / secundario
        // oro = XP y logros · rojo = error · naranja = racha
        brand: {
          DEFAULT: '#58cc02',
          dark: '#48a302', // labio 3D del botón
          light: '#7cdf37',
        },
        info: {
          DEFAULT: '#1cb0f6',
          dark: '#1795d1',
        },
        gold: {
          DEFAULT: '#ffc800',
          dark: '#e0a800',
        },
        streak: {
          DEFAULT: '#ff9600',
          dark: '#e07f00',
        },
        danger: {
          DEFAULT: '#ff4b4b',
          dark: '#e03d3d',
        },
      },
      fontFamily: {
        sans: ['System'],
      },
    },
  },
  plugins: [],
};
