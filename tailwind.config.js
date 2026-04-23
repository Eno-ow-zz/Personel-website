/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#ffffff',
        background2: '#dfebf5',
        primary: '#000000',
        secondary: '#657885',
        darkBackground: '#1c212b',
        darkBackground2: '#242e40',
        darkPrimary: '#e6dce0',
        darkSecondary: '#af8b6c',
      },
      fontFamily: {
        body: ['Manrope', 'sans-serif'],
        heading: ['Manrope', 'sans-serif'],
        title: ['Playfair Display', 'serif'],
      },
      fontWeight: {
        light: 300,
        bold: 800,
        extralight: 200,
      },
      fontSize: {
        xl: '22px',
      },
      animation: {
        'spin-slow': 'spin 3s linear infinite',
      },
    },
  },
  plugins: [],
};
