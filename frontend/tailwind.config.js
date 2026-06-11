/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        outfit: ['Outfit', 'sans-serif'],
      },
      colors: {
        brand: {
          dark: '#030712',      // Deep slate-950 background
          darker: '#090d16',    // Darker tone
          card: 'rgba(15, 23, 42, 0.4)', // Slate-900 transparent card
          primary: '#6366f1',   // Indigo accent
          success: '#10b981',   // Emerald accent
          warning: '#f59e0b',   // Amber accent
          danger: '#ef4444',    // Red accent
          purple: '#8b5cf6',    // Violet accent
        }
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [],
}
