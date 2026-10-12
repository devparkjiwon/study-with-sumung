/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        mung: {
          50: '#F0F7FF',
          100: '#E0EFFF',
          200: '#BAE0FD',
          300: '#7CC4FA',
          400: '#38A3F6',
          500: '#0E85E5',
          600: '#0267C1',
          700: '#03529D',
          800: '#074681',
          900: '#0C3B6B',
          950: '#082547',
        },
        cloud: {
          light: '#F8FAFC',
          border: '#E2E8F0',
          dark: '#0F172A',
        },
      },
      fontFamily: {
        sans: [
          'Pretendard',
          '-apple-system',
          'BlinkMacSystemFont',
          'system-ui',
          'Roboto',
          'Helvetica Neue',
          'Segoe UI',
          'Apple SD Gothic Neo',
          'Noto Sans KR',
          'Malgun Gothic',
          'sans-serif',
        ],
      },
      animation: {
        'bounce-slow': 'bounce 2.5s infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
      },
    },
  },
  plugins: [],
};
