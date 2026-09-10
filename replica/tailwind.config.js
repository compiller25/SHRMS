/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary-blue': '#003152',
        'dark-teal': '#003333',
        'lime-green': '#99CC33',
        'light-blue': '#ADDFF1',
      },
    },
  },
  plugins: [],
}
