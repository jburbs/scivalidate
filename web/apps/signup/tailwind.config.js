/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // Keep only what you're actually using
      colors: {
        // You can add custom colors here if needed
      },
    },
  },
  plugins: [],
}