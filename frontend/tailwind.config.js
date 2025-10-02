// tailwind.config.js
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        cream: "#f5f5dc",     // WhatsApp-like cream background
        maroon: "#660000",    // MSU Maroon
        grayms: "#5b5b5b",    // MSU Gray
      },
    },
  },
  plugins: [],
};

