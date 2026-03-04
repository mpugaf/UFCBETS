/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(-50%) translateX(0) scale(1)' },
          '50%': { transform: 'translateY(-50%) translateX(10px) scale(1.05)' },
        },
        'float-delayed': {
          '0%, 100%': { transform: 'translateY(-50%) translateX(0) scale(1)' },
          '50%': { transform: 'translateY(-50%) translateX(-10px) scale(1.05)' },
        },
        'float-logo': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-15px)' },
        },
        'pulse-slow': {
          '0%, 100%': { opacity: '0.9' },
          '50%': { opacity: '1' },
        },
        'pulse-glow': {
          '0%, 100%': { opacity: '0.75', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.1)' },
        },
        'logo-pulse': {
          '0%, 100%': {
            transform: 'scale(1)',
            filter: 'drop-shadow(0 0 20px rgba(168, 85, 247, 0.8)) brightness(1.2)'
          },
          '50%': {
            transform: 'scale(1.05)',
            filter: 'drop-shadow(0 0 40px rgba(168, 85, 247, 1)) brightness(1.3)'
          },
        },
        'rotate-slow': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        shine: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        'shine-reverse': {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(-100%)' },
        },
        gradient: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        'fade-in': {
          'from': { opacity: '0' },
          'to': { opacity: '0.9' },
        },
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'float-delayed': 'float-delayed 6s ease-in-out infinite',
        'float-logo': 'float-logo 3s ease-in-out infinite',
        'pulse-slow': 'pulse-slow 4s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 3s ease-in-out infinite',
        'logo-pulse': 'logo-pulse 2s ease-in-out infinite',
        'rotate-slow': 'rotate-slow 10s linear infinite',
        'shine': 'shine 3s ease-in-out infinite',
        'shine-reverse': 'shine-reverse 3s ease-in-out infinite',
        'gradient': 'gradient 3s ease infinite',
        'fade-in': 'fade-in 1s ease-in',
      },
    },
  },
  plugins: [],
}
