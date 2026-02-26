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
        }
      }
    }
  },
  plugins: []
} satisfies Config
