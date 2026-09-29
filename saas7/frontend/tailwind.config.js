/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
        },
        secondary: {
          50: '#f5f3ee',
          100: '#e8e4da',
          200: '#d1c9b5',
          300: '#b9ae90',
          400: '#a2936b',
          500: '#8a7846',
          600: '#6e5f38',
          700: '#53472a',
          800: '#38301c',
          900: '#1c180e',
        },
        luxury: { gold: '#c9a84c', cream: '#fdfbf7', charcoal: '#1a1a1a', ivory: '#faf5ef' },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Playfair Display', 'serif'],
      },
      spacing: { 18: '4.5rem', 22: '5.5rem', 30: '7.5rem' },
      boxShadow: {
        luxury: '0 10px 40px rgba(0,0,0,0.08)',
        'luxury-hover': '0 20px 60px rgba(0,0,0,0.12)',
        card: '0 4px 20px rgba(0,0,0,0.05)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'float': 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 3s linear infinite',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp: { '0%': { transform: 'translateY(20px)', opacity: '0' }, '100%': { transform: 'translateY(0)', opacity: '1' } },
        float: { '0%, 100%': { transform: 'translateY(0px)' }, '50%': { transform: 'translateY(-10px)' } },
      },
      backgroundImage: {
        'gradient-luxury': 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
      },
    },
  },
  plugins: [],
};
