/** @type {import('tailwindcss').Config} */
export default {
  content: ['./**/*.{js,ts,jsx,tsx,html}', './node_modules/tailwind-datepicker-react/dist/**/*.js'],
  theme: {
    fontFamily: { sans: ['Montserrat', 'Arial'] },
    extend: {
      colors: {
        main: '#20B1EF',
        neutral: '#CFDF10',
        upcoming: '#EF4520',
        completed: '#77EF6C'
      }
    }
  },
  plugins: [require('tailwind-scrollbar')]
}
