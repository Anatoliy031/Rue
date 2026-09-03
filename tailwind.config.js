/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        basalt: '#0E1416',
        stone: '#171F22',
        ridge: '#222D31',
        scree: '#2C393E',
        fog: '#93A7A9',
        haze: '#5F7376',
        snow: '#EAEFEE',
        glacial: '#78C6C1',
        'glacial-deep': '#2E6D6C',
        lichen: '#D8B15C',
        ember: '#D46A4B',
      },
      fontFamily: {
        display: ['Unbounded', 'Golos Text', 'system-ui', 'sans-serif'],
        sans: ['Golos Text', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
      },
      fontSize: {
        '10xl': ['clamp(3rem, 11vw, 9rem)', { lineHeight: '0.92', letterSpacing: '-0.03em' }],
      },
      borderRadius: {
        sheet: '20px',
      },
      transitionTimingFunction: {
        ridge: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
    },
  },
  plugins: [],
}
