import type { Config } from "tailwindcss";
import forms from "@tailwindcss/forms";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0e0f14",
        surface: "#1a1b23",
        "surface-2": "#23252f",
        "surface-3": "#2b2d3a",
        border: "#2e3044",
        // Discord blurple
        accent: "#5865f2",
        "accent-light": "#7289da",
        "accent-hover": "#4752c4",
        // Neon blue
        neon: "#00d4ff",
        // Purple
        purple: {
          400: "#a78bfa",
          500: "#8b5cf6",
          600: "#7c3aed",
          700: "#6d28d9",
          800: "#5b21b6",
          900: "#4c1d95",
        },
        // Discord status colors
        discord: {
          green: "#57f287",
          yellow: "#fee75c",
          red: "#ed4245",
          blurple: "#5865f2",
          dark: "#0e0f14",
          surface: "#1a1b23",
        },
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "neon-glow": "radial-gradient(ellipse at center, rgba(0, 212, 255, 0.12) 0%, transparent 70%)",
        "blurple-glow": "radial-gradient(ellipse at center, rgba(88, 101, 242, 0.15) 0%, transparent 70%)",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        "glow-blurple": "0 0 20px rgba(88, 101, 242, 0.35)",
        "glow-blurple-lg": "0 0 40px rgba(88, 101, 242, 0.5)",
        "glow-neon": "0 0 20px rgba(0, 212, 255, 0.4)",
        "glow-neon-lg": "0 0 40px rgba(0, 212, 255, 0.6)",
        glass: "0 8px 32px rgba(0, 0, 0, 0.5)",
      },
      backdropBlur: { xs: "2px" },
    },
  },
  plugins: [forms],
};

export default config;
