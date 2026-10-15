"use client";
import Link from "next/link";
import { motion, useMotionValue, useSpring } from "framer-motion";
import type { ReactNode, MouseEvent } from "react";
import { useRef } from "react";

type Props = {
  children: ReactNode;
  className?: string;
  strength?: number;
  href?: string;
  onClick?: () => void;
};

export default function MagneticButton({
  children,
  className,
  strength = 0.35,
  href,
  onClick,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 200, damping: 20 });
  const sy = useSpring(y, { stiffness: 200, damping: 20 });

  function onMove(e: MouseEvent<HTMLDivElement>) {
    if (window.matchMedia?.("(pointer: coarse)").matches || window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    x.set((e.clientX - rect.left - rect.width / 2) * strength);
    y.set((e.clientY - rect.top - rect.height / 2) * strength);
  }
  function onLeave() {
    x.set(0);
    y.set(0);
  }

  const internalRoute = Boolean(href && href.startsWith("/") && !href.startsWith("//"));
  return (
    <motion.div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{ x: sx, y: sy }}
      className="inline-block"
    >
      {href && internalRoute ? (
        <Link href={href} prefetch={true} onClick={onClick} className={className}>
          {children}
        </Link>
      ) : href ? (
        <motion.a href={href} onClick={onClick} className={className}>
          {children}
        </motion.a>
      ) : (
        <motion.button type="button" onClick={onClick} className={className}>
          {children}
        </motion.button>
      )}
    </motion.div>
  );
}
