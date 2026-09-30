/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        kbc: {
          navy: "#0A2E5C",
          blue: "#0079C1",
          sky: "#29ABE2",
          light: "#5BC5F2",
          bg: "#F3F7FB",
          text: "#1F2A44",
          muted: "#6B7A90",
          green: "#2E9E5B",
          red: "#E1462C",
        },
      },
      fontFamily: { sans: ["Nunito", "system-ui", "sans-serif"] },
      borderRadius: { card: "18px" },
      boxShadow: { card: "0 6px 20px rgba(10,46,92,0.08)" },
    },
  },
  plugins: [],
};
