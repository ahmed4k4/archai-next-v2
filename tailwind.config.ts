import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  darkMode: ["class", '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        violet: {
          50: "#f3f0ff", 100: "#e5deff", 200: "#cbbcff", 300: "#ad97ff",
          400: "#9275ff", 500: "#7c5cff", 600: "#6742f0",
          700: "#5230d1", 800: "#4022a8", 900: "#2c1679",
        },
        mint: {
          50: "#eafffb", 100: "#cbfff6", 200: "#99ffee", 300: "#5ff5e0",
          400: "#4ce2d0", 500: "#21c4b1", 600: "#129a8c",
          700: "#0d786f", 800: "#0a5f59", 900: "#084945",
        },
        void: {
          50: "#c5cbe0", 100: "#8f96b8", 200: "#59608a", 300: "#3a4166",
          400: "#252b4a", 500: "#1a1f3a", 600: "#11152b",
          700: "#0a0e1f", 800: "#050812", 900: "#030510",
        },
        rose: {
          50: "#fff1f6", 100: "#ffe0ec", 200: "#ffc2d9", 300: "#ff9dc0",
          400: "#ff6b9d", 500: "#f0427a", 600: "#c92a5f",
          700: "#a01f4a", 800: "#7a1638", 900: "#5c1029",
        },
        amber: {
          50: "#fffbeb", 100: "#fef3c7", 200: "#fde68a", 300: "#fcd34d",
          400: "#ffb829", 500: "#f59e0b", 600: "#d97706",
          700: "#b45309", 800: "#92400e", 900: "#78350f",
        },
        ink: {
          0: "var(--ink-0)",
          1: "var(--ink-1)",
          2: "var(--ink-2)",
          3: "var(--ink-3)",
          4: "var(--ink-4)",
        },
      },
      fontFamily: {
        sans: ["Inter", "Cairo", "system-ui", "sans-serif"],
        display: ["Instrument Serif", "Fraunces", "Cairo", "serif"],
        mono: ["JetBrains Mono", "Geist Mono", "monospace"],
      },
      backgroundImage: {
        "grad-primary": "linear-gradient(120deg, #7c5cff 0%, #4ce2d0 100%)",
        "grad-signal": "linear-gradient(90deg, #7c5cff, #9275ff 40%, #4ce2d0 100%)",
        "grad-aurora": "linear-gradient(135deg, #2c1679 0%, #7c5cff 40%, #4ce2d0 100%)",
        "grad-cta": "linear-gradient(120deg, #6742f0 0%, #9275ff 50%, #4ce2d0 100%)",
        "grad-text": "linear-gradient(100deg, #ffffff 0%, #ad97ff 50%, #4ce2d0 100%)",
        "grad-text-light": "linear-gradient(100deg, #0e1024 0%, #5230d1 55%, #0d786f 100%)",
      },
      boxShadow: {
        "glow-violet-sm": "0 0 16px rgba(124,92,255,.32)",
        "glow-violet": "0 0 28px rgba(124,92,255,.42)",
        "glow-violet-lg": "0 0 56px rgba(124,92,255,.55)",
        "glow-mint-sm": "0 0 14px rgba(76,226,208,.28)",
        "glow-mint": "0 0 26px rgba(76,226,208,.4)",
        "glow-mint-lg": "0 0 52px rgba(76,226,208,.5)",
        "glow-rose": "0 0 22px rgba(255,107,157,.38)",
        "inner-glow": "inset 0 1px 0 rgba(255,255,255,.08)",
      },
      borderRadius: { "4xl": "2rem", "5xl": "2.5rem" },
      transitionTimingFunction: {
        "out-expo": "cubic-bezier(0.16, 1, 0.3, 1)",
        spring: "cubic-bezier(0.34, 1.56, 0.64, 1)",
      },
      animation: {
        "gradient-flow": "gradient-flow 8s ease infinite",
        "float-y": "float-y 6s ease-in-out infinite",
        "spin-slow": "spin-slow 20s linear infinite",
        "pulse-glow": "pulse-glow 3s ease-in-out infinite",
      },
      keyframes: {
        "gradient-flow": {
          "0%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
          "100%": { backgroundPosition: "0% 50%" },
        },
        "float-y": {
          "0%,100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-18px)" },
        },
        "spin-slow": {
          "0%": { transform: "rotate(0)" },
          "100%": { transform: "rotate(360deg)" },
        },
        "pulse-glow": {
          "0%,100%": { opacity: "0.55", filter: "blur(24px)" },
          "50%": { opacity: "1", filter: "blur(32px)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;