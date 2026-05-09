export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "primary": "#1F4E79",
        "secondary": "#2BB673",
        "background": "#F5F7FA",
        "on-background": "#1A1A1A",
        emerald: {
          50: '#f2fbe9',
          100: '#e1f6ce',
          200: '#c5eda6',
          300: '#9fe075',
          400: '#7ad048',
          500: '#63C132',
          600: '#489e21',
          700: '#38781d',
          800: '#2f5f1c',
          900: '#294f1a',
          950: '#132c0b',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        manrope: ['Manrope', 'sans-serif'],
      },
      borderRadius: {
        'lg': '8px',
        'xl': '12px',
        '2xl': '16px',
        '3xl': '24px',
      },
    },
  },
  plugins: [],
}
