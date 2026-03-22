import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // ARM Optics brand palette
        brand: {
          50:  "#f5f3f0",
          100: "#e8e2d9",
          200: "#d4c9b8",
          300: "#baa98e",
          400: "#9e8768",
          500: "#8a7050",  // primary gold/bronze
          600: "#7a6144",
          700: "#644f39",
          800: "#524131",
          900: "#44362a",
          950: "#251d15",
        },
        dark: {
          50:  "#f6f6f6",
          100: "#e7e7e7",
          200: "#d1d1d1",
          300: "#b0b0b0",
          400: "#888888",
          500: "#6d6d6d",
          600: "#5d5d5d",
          700: "#4f4f4f",
          800: "#454545",
          900: "#1a1a1a",  // near-black background
          950: "#0d0d0d",
        },
        gold: {
          DEFAULT: "#c9a84c",
          light:   "#e2c97e",
          dark:    "#a0812e",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-playfair)", "Georgia", "serif"],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      backgroundImage: {
        "grid-dark":
          "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
      },
    },
  },
  plugins: [],
};

export default config;
