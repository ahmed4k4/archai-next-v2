import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { damp3, damp } from "maath/easing";
import { Vector3 } from "three";
import type { Group, Object3D } from "three";

/* ================================================================== *
 * PALETTE — one source of truth for every scene.
 * Each hue carries base / light / dark / emissive so materials never
 * have to hard-code a hex again.
 * ================================================================== */

export const PALETTE = {
  violet: {
    base: "#7c5cff",
    light: "#ad97ff",
    dark: "#4022a8",
    emissive: "#9275ff",
  },
  mint: {
    base: "#4ce2d0",
    light: "#5ff5e0",
    dark: "#0d786f",
    emissive: "#4ce2d0",
  },
  rose: {
    base: "#ff6b9d",
    light: "#ffb8cf",
    dark: "#c92a5f",
    emissive: "#ff6b9d",
  },
  gold: {
    base: "#ffb829",
    light: "#ffd479",
    dark: "#b47b00",
    emissive: "#ffb829",
  },
  ink: { base: "#ffffff", muted: "#ad97ff", dim: "#8f96b8" },
} as const;

/** Flat hex shortcuts (still used by a few older helpers). */
export const HEX = {
  violet: PALETTE.violet.base,
  violetLight: PALETTE.violet.light,
  violetDark: PALETTE.violet.dark,
  mint: PALETTE.mint.base,
  mintLight: PALETTE.mint.light,
  rose: PALETTE.rose.base,
  gold: PALETTE.gold.base,
  ink: "#0a0e1f",
} as const;

/* ================================================================== *
 * MOTION — rotation / pulse speed constants so every scene moves in
 * the same register instead of at arbitrary speeds.
 * ================================================================== */

export const MOTION = {
  slow: 0.06,
  base: 0.15,
  fast: 0.3,
  breath: 0.4,
  orbit: 0.2,
} as const;

/* ================================================================== *
 * EASINGS — hand-rolled so we don't add a library.
 * ================================================================== */

export const EASINGS = {
  expo: (t: number) => (t === 0 ? 0 : Math.pow(2, 10 * t - 10)),
  back: (t: number) => 1 + 2.7 * Math.pow(t - 1, 3) + 1.7 * Math.pow(t - 1, 2),
  elastic: (t: number) =>
    t === 0 || t === 1
      ? t
      : -Math.pow(2, 10 * t - 10) *
        Math.sin(((t * 10 - 10.75) * (Math.PI * 2)) / 3),
  outExpo: (t: number) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t)),
  inOut: (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2),
} as const;

/* ================================================================== *
 * SPRING HELPERS — damp-based smoothing via maath, frame-rate safe.
 * ================================================================== */

/** Smoothly damp a vec3 object (a `group.position`, etc.) toward a target. */
export function useDampVec3(
  ref: React.RefObject<Object3D>,
  target: [number, number, number],
  smoothTime = 0.5,
) {
  useFrame((_, delta) => {
    if (!ref.current) return;
    damp3(ref.current.position, target, smoothTime, delta);
  });
}

/** Smoothly damp a single scalar toward `target` (returns a ref of the value). */
export function useDampScalar(target: number, smoothTime = 0.5) {
  const value = useRef(0);
  useFrame((_, delta) => {
    damp(value, "current", target, smoothTime, delta);
  });
  return value;
}

/** Smoothly damp a group's rotation toward a target Euler. */
export function useDampRotation(
  ref: React.RefObject<Object3D>,
  target: [number, number, number],
  smoothTime = 0.6,
) {
  const cur = useRef(new Vector3());
  const tgt = useRef(new Vector3(target[0], target[1], target[2]));
  useFrame((_, delta) => {
    tgt.current.set(target[0], target[1], target[2]);
    damp3(cur.current, tgt.current, smoothTime, delta);
    if (ref.current)
      ref.current.rotation.set(cur.current.x, cur.current.y, cur.current.z);
  });
}

/**
 * A staged 0→1 reveal, driven inside useFrame.
 * Returns a getter that maps elapsed seconds → eased progress (0–1).
 */
export function useReveal(
  duration: number,
  delay = 0,
  easing: (t: number) => number = EASINGS.outExpo,
) {
  const elapsed = useRef(0);
  useFrame((_, delta) => {
    elapsed.current += delta;
  });
  return () =>
    easing(Math.min(1, Math.max(0, (elapsed.current - delay) / duration)));
}

/* ================================================================== *
 * MATERIAL PRESETS — consistent PBR across scenes.
 * ================================================================== */

export const MATERIAL = {
  /** Dark anodised metal — the "hardware" look. */
  metalDark: { color: "#0a0e1f", metalness: 0.95, roughness: 0.15 },
  /** Polished accent metal. */
  metalAccent: (hex: string) => ({
    color: hex,
    metalness: 0.9,
    roughness: 0.18,
  }),
  /** Emissive "energy" surface. */
  energy: (hex: string, intensity = 2) => ({
    color: hex,
    emissive: hex,
    emissiveIntensity: intensity,
    toneMapped: false,
  }),
} as const;

export type { Vector3, Group };
