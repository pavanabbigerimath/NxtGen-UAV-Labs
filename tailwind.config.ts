import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx,mdx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Aerospace-grade palette (strictly enforced across every page)
        space: {
          950: "#0B0F19", // primary background
          900: "#0F1420",
          800: "#111827", // secondary background
          700: "#1E293B", // elevated surface
          600: "#293548"
        },
        electric: {
          400: "#60A5FA",
          500: "#3B82F6", // primary accent
          600: "#2563EB",
          700: "#1D4ED8"
        },
        cyan: {
          400: "#22D3EE", // secondary accent
          500: "#06B6D4",
          600: "#0891B2"
        },
        coolgray: "#9CA3AF"
      },
      opacity: {
        3: "0.03",
        7: "0.07",
        8: "0.08",
        12: "0.12",
        18: "0.18",
        35: "0.35",
        45: "0.45",
        55: "0.55",
        65: "0.65",
        85: "0.85",
        97: "0.97"
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "system-ui", "sans-serif"]
      },
      backgroundImage: {
        "grid-navy":
          "linear-gradient(to right, rgba(59,130,246,0.07) 1px, transparent 1px), linear-gradient(to bottom, rgba(59,130,246,0.07) 1px, transparent 1px)",
        "radial-fade":
          "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(37,99,235,0.18), transparent 70%)"
      },
      boxShadow: {
        glow: "0 0 40px -12px rgba(59,130,246,0.55)",
        "glow-cyan": "0 0 40px -12px rgba(34,211,238,0.5)",
        panel: "0 24px 60px -30px rgba(0,0,0,0.9)"
      },
      keyframes: {
        marquee: { "0%": { transform: "translateX(0)" }, "100%": { transform: "translateX(-50%)" } },
        floaty: {
          "0%,100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-12px)" }
        },
        pulseRing: {
          "0%": { transform: "scale(0.9)", opacity: "0.7" },
          "100%": { transform: "scale(1.6)", opacity: "0" }
        },
        scanline: { "0%": { transform: "translateY(-100%)" }, "100%": { transform: "translateY(400%)" } }
      },
      animation: {
        marquee: "marquee 40s linear infinite",
        floaty: "floaty 6s ease-in-out infinite",
        pulseRing: "pulseRing 2.4s cubic-bezier(0.24,0,0.38,1) infinite",
        scanline: "scanline 4.5s linear infinite"
      }
    }
  },
  plugins: []
};

export default config;
