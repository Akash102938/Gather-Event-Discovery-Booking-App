/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Fraunces"', 'serif'],
        sans: ['"Inter"', 'sans-serif'],
      },
      colors: {
        ink: '#1C2321',
        paper: '#FAF7F0',
        ember: '#C8553D',
        teal: '#2F5D62',
        sand: '#E8DFCA',
        gold: '#DDA448',
      },
      borderRadius: {
        card: '10px',
      },
    },
  },
  plugins: [],
};
