import type { Config } from 'tailwindcss'

export default {
  content: [
    './components/**/*.{vue,js,ts}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './app/**/*.{vue,js,ts}',
    './composables/**/*.{js,ts}',
    './plugins/**/*.{js,ts}'
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          '50': '#f2f8f5',
          '100': '#e6f2ea',
          '200': '#cde5d6',
          '300': '#b3d8c1',
          '400': '#9acbae',
          '500': '#80be99',
          '600': '#67b185',
          '700': '#4d9a6e',
          '800': '#33835a',
          '900': '#18633F',
          '950': '#0c3b24',
        },
        accent: {
          '50': '#fff9eb',
          '100': '#fff1c6',
          '200': '#ffe288',
          '300': '#ffce4a',
          '400': '#ffb81b',
          '500': '#f99b07',
          '600': '#dd7502',
          '700': '#b75306',
          '800': '#94400c',
          '900': '#7a350d',
          '950': '#461a02',
        }
      },
      animation: {
        'float-slow': 'float 6s ease-in-out infinite',
        'float-slower': 'float 8s ease-in-out infinite',
        'fade-in-soft': 'fadeInSoft 0.5s ease-out forwards',
        'pulse-glow': 'pulseGlow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'slide-up': 'slideUp 0.5s ease-out forwards',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        fadeInSoft: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '.8', transform: 'scale(1.05)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      }
    }
  },
  plugins: []
} satisfies Config
