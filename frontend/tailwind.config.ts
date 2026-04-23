import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["system-ui", "ui-sans-serif", "system-ui", "-apple-system", "BlinkMacSystemFont", '"Segoe UI"', "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;

