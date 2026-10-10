"use client";
import { useEffect, useState } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useReducedMotion,
} from "framer-motion";

/**
 * CursorGlow — a soft violet/mint halo that trails the pointer.
 *
 * Disabled on touch/coarse pointers and under `prefers-reduced-motion`.
 * Uses two springs so the glow lags slightly behind the cursor for depth.
 */
export default function CursorGlow() {
  const reduce = useReducedMotion();
  const [enabled, setEnabled] = useState(false);
  const x = useMotionValue(-200);
  const y = useMotionValue(-200);
  const sx = useSpring(x, { stiffness: 220, damping: 30, mass: 0.6 });
  const sy = useSpring(y, { stiffness: 220, damping: 30, mass: 0.6 });

  useEffect(() => {
    if (reduce) return;
    const fine = window.matchMedia("(pointer: fine)").matches;
    if (!fine) return;
    setEnabled(true);

    const onMove = (e: MouseEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, [reduce, x, y]);

  if (!enabled) return null;

  return (
    <motion.div
      aria-hidden
      className="pointer-events-none fixed top-0 left-0 z-[200] w-[420px] h-[420px] rounded-full -translate-x-1/2 -translate-y-1/2"
      style={{
        x: sx,
        y: sy,
        background:
          "radial-gradient(circle, rgba(124,92,255,.12) 0%, rgba(76,226,208,.06) 45%, transparent 70%)",
        mixBlendMode: "screen",
      }}
    />
  );
}
