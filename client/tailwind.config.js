/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary:  { DEFAULT: '#4F46E5', light: '#818CF8', dark: '#3730A3' },
        admin:    '#7C3AED',
        hod:      '#1D4ED8',
        teacher:  '#0F766E',
        student:  '#B45309',
      },
    },
  },
  plugins: [],
};