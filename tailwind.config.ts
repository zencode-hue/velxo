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
        background: "#0a0a0a",
        surface: "#111111",
        "surface-2": "#1a1a1a",
        border: "#2a2a2a",
        purple: {
          400: "#a78bfa",
          500: "#8b5cf6",
          600: "#7c3aed",
          700: "#6d28d9",
          800: "#5b21b6",
          900: "#4c1d95",
        },
        accent: "#7c3aed",
        "accent-light": "#8b5cf6",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "purple-glow":
          "radial-gradient(ellipse at center, rgba(124, 58, 237, 0.15) 0%, transparent 70%)",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        "glow-purple": "0 0 20px rgba(124, 58, 237, 0.3)",
        "glow-purple-lg": "0 0 40px rgba(124, 58, 237, 0.4)",
        glass: "0 8px 32px rgba(0, 0, 0, 0.4)",
      },
      backdropBlur: {
        xs: "2px",
      },
    },
  },
  plugins: [forms],
};

export default config;
