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
        background: "#0a0b0f",
        surface: "#111318",
        "surface-2": "#161b27",
        "surface-3": "#1e2535",
        border: "#1e2535",
        accent: "#3b82f6",
        "accent-light": "#60a5fa",
        "accent-hover": "#2563eb",
        indigo: {
          400: "#818cf8",
          500: "#6366f1",
          600: "#4f46e5",
        },
        sky: {
          400: "#38bdf8",
          500: "#0ea5e9",
        },
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "blue-glow": "radial-gradient(ellipse at center, rgba(59,130,246,0.15) 0%, transparent 70%)",
        "indigo-glow": "radial-gradient(ellipse at center, rgba(99,102,241,0.12) 0%, transparent 70%)",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        "glow-blue": "0 0 20px rgba(59,130,246,0.35)",
        "glow-blue-lg": "0 0 40px rgba(59,130,246,0.5)",
        "glow-indigo": "0 0 20px rgba(99,102,241,0.4)",
        glass: "0 8px 32px rgba(0, 0, 0, 0.5)",
      },
      backdropBlur: { xs: "2px" },
    },
  },
  plugins: [forms],
};

export default config;
