/** @type {import('tailwindcss').Config} */
const colors = require("tailwindcss/colors");
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
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
          // accent: "#37cdbe",
          neutral: "#FFFFFF",
          error: "#EE565B",
          accent: "#A1A1AA",
          // "base-100": "#ffffff",
        },
      },
      "light",
    ],
  },
  plugins: [require("daisyui")],
};
