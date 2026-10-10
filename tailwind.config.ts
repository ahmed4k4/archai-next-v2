import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        abyss: "#020b0b",
        deep: "#031817",
        kelp: "#073b37",
        mist: "#edfffe",
        silver: "#bbc7c6",
        iris: "#8052ff",
        saffron: "#ffb829",
      },
      fontFamily: {
        sans: ["Inter", "Cairo", "system-ui", "sans-serif"],
        display: ["Inter", "Cairo", "system-ui", "sans-serif"],
      },
      transitionTimingFunction: {
        "out-expo": "cubic-bezier(0.16, 1, 0.3, 1)",
      },
      keyframes: {
        "float-soft": {
          "0%, 100%": { transform: "translate3d(0, 0, 0)" },
          "50%": { transform: "translate3d(0, -14px, 0)" },
        },
        "pulse-glow": {
          "0%, 100%": { opacity: ".35", transform: "scale(.96)" },
          "50%": { opacity: ".8", transform: "scale(1.04)" },
        },
      },
      animation: {
        "float-soft": "float-soft 8s ease-in-out infinite",
        "pulse-glow": "pulse-glow 6s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
export default config;
