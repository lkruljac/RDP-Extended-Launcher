/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#1a1a1a',
        surface: '#242424',
        'surface-elevated': '#2d2d2d',
        border: '#3a3a3a',
        primary: '#8b7ab8',
        accent: '#9b59b6',
        'text-primary': '#e0e0e0',
        'text-secondary': '#a0a0a0',
        danger: '#e74c3c',
      },
    },
  },
  plugins: [],
}
