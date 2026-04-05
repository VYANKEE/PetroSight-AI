/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        midnight: "#07111f",
        surface: "#0f1f36",
        ink: "#e6eefc",
        neon: "#34d399",
        cyanGlow: "#38bdf8",
        amberGlow: "#f59e0b",
      },
      fontFamily: {
        display: ["'Space Grotesk'", "sans-serif"],
        body: ["'Plus Jakarta Sans'", "sans-serif"],
      },
      boxShadow: {
        glass: "0 24px 80px rgba(8, 15, 28, 0.45)",
        neon: "0 0 0 1px rgba(52, 211, 153, 0.18), 0 20px 50px rgba(52, 211, 153, 0.12)",
      },
      backgroundImage: {
        aurora:
          "radial-gradient(circle at top left, rgba(56, 189, 248, 0.18), transparent 30%), radial-gradient(circle at top right, rgba(52, 211, 153, 0.16), transparent 28%), linear-gradient(135deg, rgba(8, 15, 28, 0.98), rgba(11, 25, 43, 0.94))",
      },
    },
  },
  plugins: [],
};
