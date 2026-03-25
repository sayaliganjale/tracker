/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["'Syne'", "sans-serif"],
        body: ["'DM Sans'", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
      colors: {
        ink: {
          950: "#0a0a0f",
          900: "#111118",
          800: "#1a1a24",
          700: "#242433",
          600: "#2e2e42",
          500: "#3d3d58",
          400: "#5a5a7a",
          300: "#8080a8",
          200: "#aaaacb",
          100: "#d4d4e8",
          50: "#f0f0f8",
        },
        acid: {
          500: "#c8f000",
          400: "#d4f533",
          300: "#e0fa66",
        },
        coral: {
          500: "#ff4d6d",
          400: "#ff7091",
          300: "#ffa0b4",
        },
        sky: {
          500: "#00c2ff",
          400: "#33cfff",
          300: "#66dcff",
        },
        amber: {
          500: "#ffb800",
          400: "#ffca40",
          300: "#ffd970",
        },
        violet: {
          500: "#8b5cf6",
          400: "#a78bfa",
          300: "#c4b5fd",
        },
      },
      animation: {
        "slide-in": "slideIn 0.2s ease-out",
        "fade-in": "fadeIn 0.15s ease-out",
        "pulse-dot": "pulseDot 2s ease-in-out infinite",
      },
      keyframes: {
        slideIn: {
          "0%": { transform: "translateY(-8px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        pulseDot: {
          "0%, 100%": { transform: "scale(1)", opacity: "1" },
          "50%": { transform: "scale(1.4)", opacity: "0.7" },
        },
      },
    },
  },
  plugins: [],
};
