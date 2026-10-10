"use client";
import { motion, type Variants } from "framer-motion";
import type { ReactNode } from "react";
import { fadeUp } from "@/lib/motion";

export default function StaggerItem({
  children,
  variant = fadeUp,
  className,
}: {
  children: ReactNode;
  variant?: Variants;
  className?: string;
}) {
  return (
    <motion.div variants={variant} className={className}>
      {children}
    </motion.div>
  );
}