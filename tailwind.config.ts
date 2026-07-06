/** @type {import('tailwindcss').Config} */
export default {
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
      extend: {
        fontFamily: {
          sans: ['Poppins', 'system-ui', 'sans-serif'],
        },
        colors: {
          brand: {
            50: '#FEF2F2',
            100: '#FEE2E2',
            200: '#FECACA',
            300: '#FCA5A5',
            400: '#F87171',
            500: '#EF4444',
            600: '#E31E24',
            700: '#C41E3A',
            800: '#991B1B',
            900: '#7F1D1D',
          },
        },
      },
    },
    plugins: [],
  }