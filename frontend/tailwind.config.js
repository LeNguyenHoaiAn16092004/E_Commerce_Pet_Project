/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Baloo 2"', 'Nunito', 'system-ui', 'sans-serif'],
        body: ['Nunito', 'system-ui', 'sans-serif'],
      },
      colors: {
        pop: {
          pink: '#FF3D8A',
          orange: '#FF7A1A',
          yellow: '#FFC93D',
          purple: '#7C3AED',
          teal: '#00C2A8',
          blue: '#2563EB',
          dark: '#1E1B34',
        },
      },
      boxShadow: {
        pop: '6px 6px 0 #1E1B34',
        'pop-sm': '4px 4px 0 #1E1B34',
      },
    },
  },
  plugins: [],
}
