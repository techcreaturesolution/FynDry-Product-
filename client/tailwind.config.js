/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1F6B3A', // Leaf green
          light: '#2E8B4F',
          dark: '#144927',
          50: '#F0F9F3',
          100: '#DDF1E4',
          500: '#1F6B3A',
          600: '#1A5A31',
          700: '#144927',
        },
        brandRed: {
          DEFAULT: '#A3260F', // Brand red-brown
          light: '#BA3116',
          dark: '#821D0A',
        },
        cream: {
          DEFAULT: '#FFF8E7', // Cream background
          light: '#FFFDF7',
          dark: '#F5ECD5',
          card: '#FFFFFF',
        },
        woodBrown: {
          DEFAULT: '#8B5A2B', // Warm wood brown accents
          light: '#A66E38',
          dark: '#6E451F',
        },
        // Product specific accents
        accent: {
          apple: '#D62828',
          banana: '#F2B705',
          soup: '#C62828',
          onion: '#A3195B',
          beetroot: '#9B1239',
          garlic: '#E8890C',
        }
      },
      fontFamily: {
        heading: ['"Baloo 2"', 'cursive', 'sans-serif'],
        body: ['"Nunito"', 'sans-serif'],
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      boxShadow: {
        'soft': '0 10px 30px -10px rgba(31, 107, 58, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.03)',
        'soft-lg': '0 20px 40px -15px rgba(31, 107, 58, 0.12), 0 8px 16px -4px rgba(0, 0, 0, 0.04)',
        'card': '0 8px 30px rgba(0, 0, 0, 0.04)',
        'card-hover': '0 20px 40px rgba(0, 0, 0, 0.09)',
      },
      animation: {
        'float-slow': 'float 6s ease-in-out infinite',
        'float-delayed': 'float 6s ease-in-out 3s infinite',
        'pulse-subtle': 'pulseSubtle 4s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%': { transform: 'translateY(-12px) rotate(2deg)' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '0.8', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.03)' },
        }
      }
    },
  },
  plugins: [],
};
