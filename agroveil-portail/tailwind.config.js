/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        agro: {
          green: '#1E6B2E',
          'green-dark': '#0F3D1A',
          'green-light': '#EAF3DE',
          amber: '#EF9F27',
          'amber-light': '#FAEEDA',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      borderRadius: {
        card: '16px',
        btn: '10px',
        pill: '9999px',
      },
      boxShadow: {
        card: '0 4px 12px rgba(0,0,0,0.06)',
      },
    },
  },
  plugins: [],
};
