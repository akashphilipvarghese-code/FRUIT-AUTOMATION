/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        "clearscan-orange": "#FF8C00",
        "clearscan-black": "#000000",
        "clearscan-card": "#111111",
      },
      boxShadow: {
        "orange-glow": "0 0 20px rgba(255, 140, 0, 0.4)",
        "orange-glow-lg": "0 0 30px rgba(255, 140, 0, 0.5)",
        "orange-neon": "0 0 15px rgba(255, 140, 0, 0.6), 0 0 30px rgba(255, 140, 0, 0.3)",
      },
    },
  },
  plugins: [],
};
