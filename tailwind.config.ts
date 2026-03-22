import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // ARM Optics brand palette — charcoal gray from logo
        brand: {
          50:  "#f7f7f7",
          100: "#ebebeb",
          200: "#d6d6d6",
          300: "#adadad",
          400: "#808080",
          500: "#5c5c5c",
          600: "#454545",  // logo charcoal
          700: "#363636",
          800: "#282828",
          900: "#1a1a1a",  // near-black
          950: "#0f0f0f",
        },
        // Red accent — the slash from the ARM logo
        accent: {
          DEFAULT: "#d93226",
          light:   "#e84f44",
          dark:    "#b52820",
        },
      },
      fontFamily: {
        sans:    ["var(--font-manrope)", "system-ui", "sans-serif"],
        display: ["var(--font-manrope)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [],
};

export default config;
