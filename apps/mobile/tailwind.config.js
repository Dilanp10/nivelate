/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{ts,tsx}', './src/**/*.{ts,tsx}'],
  presets: [require('nativewind/preset')],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Sobrio moderno: fondo casi blanco, tinta grafito, acento teal profundo.
        // Grises con leve sesgo cálido para no leerse frío/técnico.
        bg: '#FBFAF8',
        surface: '#FFFFFF',
        'surface-light': '#F3F1EA',
        border: '#E2DFD7',
        text: '#131417',
        muted: '#6E6E76',

        // Roles semánticos con equivalentes muted del mismo tono adulto:
        // teal = acción primaria / correcto · slate = repaso / secundario
        // brass = XP y logros · rust = racha · rojo apagado = error
        brand: {
          DEFAULT: '#0E7C7B',
          dark: '#0A5F5E',
          light: '#1CA09E',
        },
        info: {
          DEFAULT: '#4F6D7A',
          dark: '#3E5761',
        },
        gold: {
          DEFAULT: '#B88A2E',
          dark: '#8F6A21',
        },
        streak: {
          DEFAULT: '#C55A2A',
          dark: '#A04620',
        },
        danger: {
          DEFAULT: '#B92C2C',
          dark: '#8F2020',
        },
      },
      fontFamily: {
        // Body: Inter (misma que la comparación). Display: Space Grotesk
        // (para números, headings y prompts que quieren personalidad geométrica).
        sans: ['Inter', 'System'],
        display: ['Space Grotesk', 'Inter', 'System'],
      },
    },
  },
  plugins: [],
};
