import type { Config } from 'tailwindcss';
import defaultTheme from 'tailwindcss/defaultTheme';

const config: Config = {
  darkMode: 'class',
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', ...defaultTheme.fontFamily.sans],
      },
      colors: {
        stellar: {
          50: '#e6f7f5',
          100: '#b2eae5',
          300: '#4cd9cc',
          400: '#2dd0bf',
          500: '#12C6B2', // Your teal brand color
          600: '#0F2747', // Your dark navy brand color
          700: '#0c1d36',
        },
        brand: {
          navy: '#0F2747',
          teal: '#12C6B2',
        },
      },
      boxShadow: {
        glow: '0 0 40px -12px rgba(18, 198, 178, 0.5)',
      },
      keyframes: {
        gradient: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(1rem)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-1rem)' },
        },
        'pulse-soft': {
          '0%, 100%': { opacity: '0.3' },
          '50%': { opacity: '0.5' },
        },
      },
      animation: {
        gradient: 'gradient 8s ease infinite',
        marquee: 'marquee 32s linear infinite',
        // `forwards` keeps elements at their end state (opacity 1) after the
        // reveal, since they start from an `opacity-0` base class.
        'fade-in': 'fade-in 0.6s ease-out forwards',
        'fade-in-up': 'fade-in-up 0.6s ease-out forwards',
        float: 'float 6s ease-in-out infinite',
        'pulse-soft': 'pulse-soft 4s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};

export default config;