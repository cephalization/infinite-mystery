/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {},
  },
  daisyui: {
    themes: ["coffee"],
  },
  plugins: [require("@tailwindcss/typography"), require("daisyui")],
};
