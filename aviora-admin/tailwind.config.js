/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        green: {
          DEFAULT: '#1E6B2E',
          dark: '#0F3D1A',
          light: '#EAF3DE',
        },
        amber: {
          DEFAULT: '#EF9F27',
          light: '#FAEEDA',
        },
        // Semantic aliases
        'page-bg': '#F8FAF8',
        'card-bg': '#FFFFFF',
        'text-primary': '#1A1A1A',
        'text-secondary': '#555555',
        'text-muted': '#888888',
        'border-card': '#E8E8E8',
        // Alert colors
        'critical-text': '#A32D2D',
        'critical-bg': '#FCEBEB',
        'critical-border': '#E24B4A',
        'warning-text': '#854F0B',
        'warning-bg': '#FAEEDA',
        'warning-border': '#EF9F27',
        'info-text': '#0C447C',
        'info-bg': '#E6F1FB',
        'info-border': '#378ADD',
        'success-text': '#27500A',
        'success-bg': '#EAF3DE',
        'success-border': '#639922',
      },
      borderRadius: {
        card: '12px',
        btn: '10px',
        pill: '999px',
      },
      boxShadow: {
        card: '0 4px 12px rgba(0,0,0,0.06)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
