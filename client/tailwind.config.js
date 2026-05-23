/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        clay: {
          50: '#fafafa',
          100: '#f4f4f5',
        },
      },
      boxShadow: {
        clay: '6px 6px 20px rgba(0,0,0,0.08), -2px -2px 10px rgba(255,255,255,0.9)',
        'clay-sm': '4px 4px 12px rgba(0,0,0,0.07), -1px -1px 6px rgba(255,255,255,0.8)',
        'clay-inset': 'inset 3px 3px 8px rgba(0,0,0,0.06), inset -2px -2px 6px rgba(255,255,255,0.8)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
    },
  },
  plugins: [],
};
