"use client";

import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";
import type { ReactNode } from "react";
import { useRef } from "react";

type Props = {
  children: ReactNode;
  className?: string;
  as?: "article" | "div" | "a" | "span";
  href?: string;
  initial?: any;
  whileInView?: any;
  viewport?: any;
};

/** Scroll-linked information surface: every data card subtly tilts, rises and gains depth as it crosses the viewport. */
export default function Scroll3DCard({ children, className = "", as = "article", href, initial, whileInView, viewport }: Props) {
  const ref = useRef<HTMLElement | null>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 92%", "end 8%"] });
  const smooth = useSpring(scrollYProgress, { stiffness: 80, damping: 22, mass: 0.45 });
  const rotateX = useTransform(smooth, [0, 0.5, 1], [4.5, 0, -4.5]);
  const rotateY = useTransform(smooth, [0, 0.5, 1], [-3.5, 0, 3.5]);
  const rotateZ = useTransform(smooth, [0, 0.5, 1], [-0.35, 0, 0.35]);
  const y = useTransform(smooth, [0, 0.5, 1], [18, 0, -14]);
  const z = useTransform(smooth, [0, 0.5, 1], [0, 18, 0]);
  const scale = useTransform(smooth, [0, 0.5, 1], [0.97, 1.005, 0.985]);
  const opacity = useTransform(smooth, [0, 0.12, 0.88, 1], [0.68, 1, 1, 0.9]);

  const motionProps = {
    ref: ref as never,
    style: reduce ? undefined : { rotateX, rotateY, rotateZ, y, z, scale, opacity },
    whileHover: reduce ? undefined : { rotateX: -1.2, rotateY: 1.5, z: 24, y: -3, scale: 1.012 },
    initial,
    whileInView,
    viewport,
  } as const;

  if (as === "a") {
    return <motion.a href={href} {...motionProps} className={className}>{children}</motion.a>;
  }
  if (as === "div") {
    return <motion.div {...motionProps} className={className}>{children}</motion.div>;
  }
  if (as === "span") {
    return <motion.span {...motionProps} className={className}>{children}</motion.span>;
  }
  return <motion.article {...motionProps} className={className}>{children}</motion.article>;
}
