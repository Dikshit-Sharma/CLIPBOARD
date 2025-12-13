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
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-in-out',
        'zoom-in-95': 'zoomIn95 0.2s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite'
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        zoomIn95: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' }
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        }
      }
    }
  },
  plugins: []
}
