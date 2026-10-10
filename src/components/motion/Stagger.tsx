"use client";
import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { stagger, viewportOnce } from "@/lib/motion";

export default function Stagger({
  children,
  delay = 0.08,
  delayChildren = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  delayChildren?: number;
  className?: string;
}) {
  return (
    <motion.div
      variants={stagger(delay, delayChildren)}
      initial="hidden"
      whileInView="show"
      viewport={viewportOnce}
      className={className}
    >
      {children}
    </motion.div>
  );
}