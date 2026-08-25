/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        /* coral-pink scale (Aprch-style primary) */
        brand: {
          50: '#FFF1F4',
          100: '#FFE4EA',
          200: '#FFC9D8',
          300: '#FFA3BC',
          400: '#FF7B9E',
          500: '#FF5C8A',
          600: '#F43F75',
          700: '#D93062',
          800: '#B22351',
          900: '#8F1C42',
        },
        mint: {
          100: '#E2FBF1',
          200: '#BEF5DF',
          300: '#8CEFC9',
          400: '#5BE0AE',
          500: '#2FCF97',
          600: '#1FAE7C',
        },
        lemon: {
          300: '#FFE58F',
          400: '#FFDE6B',
          500: '#FFCF33',
        },
        sky: {
          200: '#CFE9FF',
          300: '#A7D7FF',
          400: '#82CBFF',
          500: '#55B5FF',
        },
        ink: '#211D19',
        night: '#171310',
        cream: '#FBF3EA',
        peach: '#FFF1EC',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        display: ['"Space Grotesk"', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 4px 24px -6px rgba(33,29,25,0.10)',
        lift: '0 18px 40px -12px rgba(244,63,117,0.30)',
        glow: '0 0 40px -8px rgba(255,92,138,0.55)',
        card: '0 1px 2px rgba(33,29,25,0.05), 0 8px 32px -12px rgba(33,29,25,0.14)',
      },
      keyframes: {
        floaty: {
          '0%, 100%': { transform: 'translateY(0px) rotate(-2deg)' },
          '50%': { transform: 'translateY(-16px) rotate(2deg)' },
        },
        'floaty-slow': {
          '0%, 100%': { transform: 'translateY(0px) rotate(3deg)' },
          '50%': { transform: 'translateY(-12px) rotate(-3deg)' },
        },
        blob: {
          '0%, 100%': { transform: 'translate(0px, 0px) scale(1)' },
          '33%': { transform: 'translate(24px, -30px) scale(1.06)' },
          '66%': { transform: 'translate(-18px, 16px) scale(0.96)' },
        },
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
        pagein: {
          '0%': { opacity: '0', transform: 'translateY(18px)' },
          '100%': { opacity: '1', transform: 'translateY(0px)' },
        },
        popin: {
          '0%': { opacity: '0', transform: 'scale(0.94)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        rise: {
          '0%': { transform: 'translateY(110%) scale(1)', opacity: '0' },
          '8%': { opacity: '0.9' },
          '95%': { opacity: '0.7' },
          '100%': { transform: 'translateY(-120vh) scale(1.15)', opacity: '0' },
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
        spinny: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
      },
      animation: {
        floaty: 'floaty 6s ease-in-out infinite',
        'floaty-slow': 'floaty-slow 9s ease-in-out infinite',
        blob: 'blob 14s ease-in-out infinite',
        marquee: 'marquee 32s linear infinite',
        pagein: 'pagein 0.5s cubic-bezier(0.22, 0.61, 0.36, 1) both',
        popin: 'popin 0.35s cubic-bezier(0.22, 0.61, 0.36, 1) both',
        spinny: 'spinny 14s linear infinite',
        wiggle: 'wiggle 2.4s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
