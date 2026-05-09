/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,ts,jsx,tsx,mdx}', './components/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: '#0a0a0f',
          secondary: '#111118',
          card: '#16161f',
          hover: '#1c1c28',
        },
        border: {
          DEFAULT: '#232330',
          light: '#2a2a3a',
        },
        accent: {
          DEFAULT: '#7c6ff7',
          soft: 'rgba(124,111,247,0.12)',
        },
      },
    },
  },
  plugins: [],
}
