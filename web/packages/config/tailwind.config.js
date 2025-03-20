  // packages/config/tailwind.config.js
  module.exports = {
    content: [
      "../../packages/ui/src/**/*.{js,jsx}",
      "./src/**/*.{js,jsx}"
    ],
    theme: {
      extend: {
        colors: {
          primary: '#4f46e5',
          // Other shared colors
        }
      }
    },
    plugins: []
  }