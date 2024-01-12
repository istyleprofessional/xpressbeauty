/** @type {import('tailwindcss').Config} */
const colors = require("tailwindcss/colors");
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    // "./node_modules/flowbite/**/*.js",
  ],
  daisyui: {
    themes: ["cupcake"],
  },
  plugins: [require("daisyui")],
};
