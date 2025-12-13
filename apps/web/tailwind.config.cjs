/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: {
          950: 'var(--bg-primary)',
          900: 'var(--bg-secondary)',
          800: 'var(--bg-tertiary)'
        },
        surface: {
          900: 'var(--bg-secondary)',
          800: 'var(--bg-surface)',
          700: 'var(--bg-surface-hover)'
        },
        text: {
          primary: 'var(--text-primary)',
          muted: 'var(--text-muted)'
        },
        accent: {
          400: 'var(--accent-light)',
          500: 'var(--accent-color)'
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
