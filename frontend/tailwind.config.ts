import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          purple: "#6E14D4",
          black: "#000000",
          dark: "#0D0D0D",
          green: "#22C55E",
          blue: "#3B82F6",
          amber: "#F59E0B",
          red: "#EF4444",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
      },
      keyframes: {
        blink: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0" },
        },
        scanline: {
          "0%": { width: "0", opacity: "1" },
          "100%": { width: "100%", opacity: "1" },
        },
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        pulse: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" },
        },
        arcSweep: {
          "0%": { strokeDashoffset: "1000" },
          "100%": { strokeDashoffset: "0" },
        },
      },
      animation: {
        blink: "blink 1s step-end infinite",
        scanline: "scanline 500ms ease-out forwards",
        fadeUp: "fadeUp 600ms ease-out forwards",
        pulse: "pulse 2s ease-in-out infinite",
        arcSweep: "arcSweep 800ms linear forwards",
      },
      backgroundImage: {
        "grid-pattern":
          "linear-gradient(rgba(110,20,212,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(110,20,212,0.08) 1px, transparent 1px)",
      },
      backgroundSize: {
        "grid-size": "40px 40px",
      },
    },
  },
  plugins: [],
};

export default config;
