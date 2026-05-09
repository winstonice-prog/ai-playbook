/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,ts,jsx,tsx,mdx}', './components/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        panel: {
          bg: '#0f1117',
          card: '#1a1d27',
          border: '#2a2d3a',
          accent: '#6c5ce7',
          'accent-soft': 'rgba(108,92,231,0.15)',
          success: '#00d2a0',
          warn: '#ffb347',
          danger: '#ff5e5e',
        },
      },
    },
  },
  plugins: [],
}
