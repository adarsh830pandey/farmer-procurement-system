/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gov: {
          navy: '#0b2545',
          dark: '#081c33',
          blue: '#134074',
          lightBlue: '#8da9c4',
          ice: '#eef4f8',
          saffron: '#d97706',
          saffronDark: '#b45309',
          saffronLight: '#fef3c7',
          green: '#15803d',
          greenDark: '#14532d',
          greenLight: '#dcfce7',
          border: '#cbd5e1',
          bg: '#f8fafc',
          card: '#ffffff',
        }
      },
      fontFamily: {
        sans: ['"Segoe UI"', 'Roboto', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'gov': '0 1px 3px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.04)',
        'gov-md': '0 4px 6px -1px rgba(0, 0, 0, 0.07), 0 2px 4px -1px rgba(0, 0, 0, 0.04)',
      }
    },
  },
  plugins: [],
}
