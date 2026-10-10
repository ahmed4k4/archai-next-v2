"use client";
import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { pageEnter } from "@/lib/motion";

export default function PageTransition({ children }: { children: ReactNode }) {
  return (
    <motion.div variants={pageEnter} initial="hidden" animate="show" exit="exit">
      {children}
    </motion.div>
  );
}