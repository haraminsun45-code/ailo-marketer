import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./data/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        mint: {
          50: "#effcf7",
          100: "#d8f7ec",
          200: "#b5eddc",
          300: "#7edec4",
          400: "#4ec8a9",
          500: "#2fb092",
          600: "#228d77"
        }
      },
      boxShadow: {
        soft: "0 18px 45px rgba(41, 77, 70, 0.08)"
      }
    }
  },
  plugins: []
};

export default config;
