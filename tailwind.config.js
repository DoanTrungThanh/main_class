/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      screens: {
        'xs': '480px',
      },
      fontSize: {
        'xxs': '0.625rem', // 10px
      },
    },
  },
  plugins: [],
};