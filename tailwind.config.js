/** @type {import('tailwindcss').Config} */
export default {
  content: ['./**/*.{js,ts,jsx,tsx,html}', './node_modules/tailwind-datepicker-react/dist/**/*.js'],
  theme: {
    fontFamily: { sans: ['Montserrat', 'Arial'] },
    extend: {
      colors: {
        main: 'rgb(34,197,94)',
        neutral: '#20B1EF',
        upcoming: '#777777',
        completed: '#77EF6C'
      }
    }
  },
  plugins: [require('tailwind-scrollbar')]
}
