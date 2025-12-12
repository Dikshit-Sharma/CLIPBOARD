/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: {
          950: '#050608',
          900: '#0b0d10',
          800: '#11151b'
        },
        surface: {
          900: '#0f1318',
          800: '#151b22',
          700: '#1b2430'
        },
        text: {
          primary: '#e5e7eb',
          muted: '#9ca3af'
        },
        accent: {
          400: '#60a5fa',
          500: '#3b82f6'
        }
      }
    }
  },
  plugins: []
}
