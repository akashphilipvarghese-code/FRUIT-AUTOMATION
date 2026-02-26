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
        background: "#000000",
        primary: "#FF8C00",
        card: "#111111",
      },
      backgroundColor: {
        DEFAULT: "#000000",
      },
      boxShadow: {
        "orange-glow": "0 0 20px rgba(255, 140, 0, 0.4)",
        "orange-neon": "0 0 15px rgba(255, 140, 0, 0.6), 0 0 30px rgba(255, 140, 0, 0.3)",
      },
    },
  },
  plugins: [],
};

export default config;
