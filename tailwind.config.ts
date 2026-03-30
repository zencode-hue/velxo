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
        background: "#0d0a07",
        surface: "#1a1208",
        "surface-2": "#231808",
        "surface-3": "#2e2010",
        border: "#3d2a10",
        accent: "#ea580c",
        "accent-light": "#f97316",
        "accent-hover": "#c2410c",
        neon: "#fbbf24",
        orange: {
          400: "#fb923c",
          500: "#f97316",
          600: "#ea580c",
          700: "#c2410c",
          800: "#9a3412",
          900: "#7c2d12",
        },
        amber: {
          300: "#fcd34d",
          400: "#fbbf24",
          500: "#f59e0b",
        },
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "fire-glow": "radial-gradient(ellipse at center, rgba(234,88,12,0.15) 0%, transparent 70%)",
        "amber-glow": "radial-gradient(ellipse at center, rgba(251,191,36,0.12) 0%, transparent 70%)",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        "glow-orange": "0 0 20px rgba(234,88,12,0.35)",
        "glow-orange-lg": "0 0 40px rgba(234,88,12,0.5)",
        "glow-amber": "0 0 20px rgba(251,191,36,0.4)",
        glass: "0 8px 32px rgba(0, 0, 0, 0.5)",
      },
      backdropBlur: { xs: "2px" },
    },
  },
  plugins: [forms],
};

export default config;
