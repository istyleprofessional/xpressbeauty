/** @type {import('tailwindcss').Config} */
const colors = require("tailwindcss/colors");
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    // "./node_modules/flowbite/**/*.js",
  ],
  theme: {
    colors: {
      black: "#18181B",
      white: "#FAFAFA",
    },
    fontFamily: {
      sans: ["Nunito Sans"],
      inter: ["Inter"],
    },
    extend: {
      colors: {
        emerald: colors.emerald,
      },
    },
  },
  daisyui: {
    themes: [
      {
        mytheme: {
          primary: "#18181B",
          secondary: "#FFFFFF",
          "secondary-focus": "#FFFFFF",
          "secondary-content": "#FFFFFF",
          neutral: "#FFFFFF",
          error: "#FF0000",
          accent: "#A1A1AA",
          "base-100": "#FFFFFF",
          "base-200": "#F9FAFB",
          "base-300": "#D1D5DB",
          white: "#fff",
        },
      },
    ],
  },
  plugins: [require("daisyui")],
};
