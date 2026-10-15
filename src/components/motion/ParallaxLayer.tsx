"use client";
import { useRef, type ReactNode } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
} from "framer-motion";

/**
 * ParallaxLayer — moves its children at a different rate to the page scroll.
 * `speed` > 0 drifts down (slower), < 0 drifts up (faster). Pure transform, so
 * it stays on the compositor. Disabled under reduced-motion.
 */
export default function ParallaxLayer({
  children,
  speed = 0.3,
  className,
}: {
  children: ReactNode;
  speed?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const distance = 120 * speed;
  const y = useTransform(scrollYProgress, [0, 1], [distance, -distance]);

  return (
    <motion.div
      ref={ref}
      style={reduce ? undefined : { y }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
