/**
 * Theme tokens as TS constants — for programmatic use in
 * WebGL scenes, canvas, and charts that can't read CSS variables.
 */

export const BRAND = {
  violet: {
    50: "#f3f0ff",
    100: "#e5deff",
    200: "#cbbcff",
    300: "#ad97ff",
    400: "#9275ff",
    500: "#7c5cff",
    600: "#6742f0",
    700: "#5230d1",
    800: "#4022a8",
    900: "#2c1679",
  },
  mint: {
    50: "#eafffb",
    100: "#cbfff6",
    200: "#99ffee",
    300: "#5ff5e0",
    400: "#4ce2d0",
    500: "#21c4b1",
    600: "#129a8c",
    700: "#0d786f",
    800: "#0a5f59",
    900: "#084945",
  },
  rose: {
    400: "#ff6b9d",
    500: "#f0427a",
    600: "#c92a5f",
  },
} as const;

export const GRADIENTS = {
  primary: "linear-gradient(120deg, #7c5cff 0%, #4ce2d0 100%)",
  signal: "linear-gradient(90deg, #7c5cff, #9275ff 40%, #4ce2d0 100%)",
  aurora: "linear-gradient(135deg, #2c1679 0%, #7c5cff 40%, #4ce2d0 100%)",
  cta: "linear-gradient(120deg, #6742f0 0%, #9275ff 50%, #4ce2d0 100%)",
  text: "linear-gradient(100deg, #ffffff 0%, #ad97ff 50%, #4ce2d0 100%)",
} as const;

export const SCENE_COLORS = {
  dark: {
    ambient: "#7c5cff",
    keyLight: "#ad97ff",
    fillLight: "#4ce2d0",
    rimLight: "#ff6b9d",
    background: "#030510",
  },
  light: {
    ambient: "#6742f0",
    keyLight: "#9275ff",
    fillLight: "#21c4b1",
    rimLight: "#f0427a",
    background: "#f7f9ff",
  },
} as const;

export const MOTION = {
  easeOut: [0.16, 1, 0.3, 1] as const,
  easeSpring: [0.34, 1.56, 0.64, 1] as const,
  easeSmooth: [0.4, 0, 0.2, 1] as const,
  duration: {
    fast: 0.2,
    base: 0.32,
    slow: 0.52,
    cinematic: 1,
  },
} as const;

export function currentTheme(): "dark" | "light" {
  if (typeof document === "undefined") return "dark";
  return (document.documentElement.dataset.theme as "dark" | "light") || "dark";
}