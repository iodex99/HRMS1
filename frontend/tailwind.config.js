/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#46A758',
          foreground: '#FFFFFF',
          50: '#F0FDF4',
          100: '#DCFCE7',
          500: '#46A758',
          600: '#16A34A',
          900: '#14532D'
        },
        background: '#F8FAFC',
        paper: '#FFFFFF'
      },
      fontFamily: {
        heading: ['Manrope', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
