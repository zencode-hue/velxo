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
        background: "#000000",
        surface: "rgba(255,255,255,0.04)",
        border: "rgba(255,255,255,0.08)",
        accent: "#a78bfa",
        "accent-2": "#818cf8",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        glass: "0 8px 32px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.06)",
        "glow-violet": "0 0 30px rgba(167,139,250,0.25)",
        "glow-violet-lg": "0 0 60px rgba(167,139,250,0.35)",
      },
      backdropBlur: {
        xs: "4px",
        sm: "8px",
        DEFAULT: "12px",
        md: "16px",
        lg: "24px",
        xl: "40px",
      },
      backgroundImage: {
        "glass-shine": "linear-gradient(135deg, rgba(255,255,255,0.08) 0%, transparent 50%)",
        "violet-glow": "radial-gradient(ellipse at center, rgba(167,139,250,0.15) 0%, transparent 70%)",
      },
    },
  },
  plugins: [forms],
};

export default config;
