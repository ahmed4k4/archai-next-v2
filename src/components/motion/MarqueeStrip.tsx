"use client";
import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

/**
 * MarqueeStrip — an infinite horizontal scroller with 3D perspective.
 * Duplicates children once so the loop is seamless; reverses direction in RTL.
 */
export default function MarqueeStrip({
  children,
  speed = 34,
  reverse = false,
  perspective = true,
  className,
}: {
  children: ReactNode;
  speed?: number;
  reverse?: boolean;
  perspective?: boolean;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const dir = reverse ? 1 : -1;

  const track = (
    <motion.div
      className="flex gap-6 w-max"
      animate={reduce ? undefined : { x: ["0%", `${dir * 50}%`] }}
      transition={{ duration: speed, repeat: Infinity, ease: "linear" }}
    >
      {children}
      {children}
    </motion.div>
  );

  return (
    <div
      className={`relative overflow-hidden ${className ?? ""}`}
      style={perspective ? { perspective: "900px" } : undefined}
    >
      {perspective ? (
        <div
          style={{ transform: "rotateX(10deg)", transformStyle: "preserve-3d" }}
        >
          {track}
        </div>
      ) : (
        track
      )}
    </div>
  );
}
