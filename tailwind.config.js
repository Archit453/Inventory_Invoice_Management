/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          navy: '#131D31',
          sidebar: '#18243C',
          activeNav: '#243454',
          primary: '#2563EB',
          success: '#10B981',
          warning: '#F59E0B',
          danger: '#EF4444',
          whatsapp: '#22C55E',
        },
        obsidian: {
          950: '#16171A',
          900: '#1C1D21',
          800: '#222328',
          700: '#2A2C35',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      screens: {
        'print': { 'raw': 'print' },
      }
    },
  },
  plugins: [],
}
