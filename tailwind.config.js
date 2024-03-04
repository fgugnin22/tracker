/** @type {import('tailwindcss').Config} */
export default {
  content: ['./**/*.{js,ts,jsx,tsx,html}'],
  theme: {
    fontFamily: { sans: ['Montserrat', 'Arial'] },
    extend: {
      colors: {
        main: '#20B1EF',
        neutral: '#DFEF20',
        upcoming: '#EF4520',
        completed: '#77EF6C'
      }
    }
  },
  plugins: []
}
