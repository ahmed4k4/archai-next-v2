import type { Variants, Transition } from "framer-motion";

/* ---------- Shared transitions ---------- */
export const EASE = {
  out: [0.16, 1, 0.3, 1] as [number, number, number, number],
  spring: [0.34, 1.56, 0.64, 1] as [number, number, number, number],
  smooth: [0.4, 0, 0.2, 1] as [number, number, number, number],
  expo: [0.87, 0, 0.13, 1] as [number, number, number, number],
};

export const T = {
  fast: { duration: 0.2, ease: EASE.out } as Transition,
  base: { duration: 0.32, ease: EASE.out } as Transition,
  slow: { duration: 0.52, ease: EASE.out } as Transition,
  cinematic: { duration: 1, ease: EASE.out } as Transition,
  spring: { type: "spring", stiffness: 220, damping: 24 } as Transition,
};

/* ---------- Entrance variants ---------- */
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 32, filter: "blur(6px)" },
  show: { opacity: 1, y: 0, filter: "blur(0px)", transition: T.slow },
};

export const fadeDown: Variants = {
  hidden: { opacity: 0, y: -32 },
  show: { opacity: 1, y: 0, transition: T.slow },
};

export const fadeLeft: Variants = {
  hidden: { opacity: 0, x: 48 },
  show: { opacity: 1, x: 0, transition: T.slow },
};

export const fadeRight: Variants = {
  hidden: { opacity: 0, x: -48 },
  show: { opacity: 1, x: 0, transition: T.slow },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.88 },
  show: { opacity: 1, scale: 1, transition: T.slow },
};

export const blurIn: Variants = {
  hidden: { opacity: 0, filter: "blur(24px)" },
  show: { opacity: 1, filter: "blur(0px)", transition: T.cinematic },
};

export const rotateIn: Variants = {
  hidden: { opacity: 0, rotate: -12, scale: 0.9 },
  show: { opacity: 1, rotate: 0, scale: 1, transition: T.slow },
};

export const textReveal: Variants = {
  hidden: { opacity: 0, y: 60, rotateX: -25, filter: "blur(12px)" },
  show: { opacity: 1, y: 0, rotateX: 0, filter: "blur(0px)", transition: T.cinematic },
};

/* ---------- Stagger containers ---------- */
export const stagger = (delay = 0.08, delayChildren = 0): Variants => ({
  hidden: {},
  show: { transition: { staggerChildren: delay, delayChildren } },
});

export const staggerFast = stagger(0.05);
export const staggerSlow = stagger(0.14);

/* ---------- 3D variants ---------- */
export const flipIn: Variants = {
  hidden: { opacity: 0, rotateY: -90, transformPerspective: 1200 },
  show: { opacity: 1, rotateY: 0, transition: { duration: 0.8, ease: EASE.expo } },
};

export const card3D: Variants = {
  hidden: { opacity: 0, y: 40, rotateX: 12, transformPerspective: 1000 },
  show: { opacity: 1, y: 0, rotateX: 0, transition: T.slow },
};

/* ---------- Idle float (loop) ---------- */
export const floatY = {
  y: [0, -18, 0],
  transition: { duration: 6, repeat: Infinity, ease: "easeInOut" },
};

export const floatX = {
  x: [0, 18, 0],
  transition: { duration: 7, repeat: Infinity, ease: "easeInOut" },
};

export const floatDiag = {
  x: [0, 14, -10, 0],
  y: [0, -22, 12, 0],
  rotate: [0, 3, -3, 0],
  transition: { duration: 8, repeat: Infinity, ease: "easeInOut" },
};

/* ---------- Hover ---------- */
export const hoverLift = {
  whileHover: { y: -6, transition: T.fast },
  whileTap: { y: 0, scale: 0.98 },
};

export const hoverScale = {
  whileHover: { scale: 1.04, transition: T.fast },
  whileTap: { scale: 0.98 },
};

export const hoverGlow = {
  whileHover: { boxShadow: "0 0 56px rgba(124,92,255,.55)", transition: T.fast },
};

/* ---------- Page transitions ---------- */
export const pageEnter: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.4, ease: EASE.out } },
  exit: { opacity: 0, transition: { duration: 0.25 } },
};

/* ---------- Scroll reveal defaults ---------- */
export const viewportOnce = { once: true, amount: 0.15 } as const;
export const viewportAmount = (amount: number) => ({ once: true, amount });