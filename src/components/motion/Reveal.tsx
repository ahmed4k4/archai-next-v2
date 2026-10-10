"use client";
import { motion, type Variants } from "framer-motion";
import type { ReactNode } from "react";
import { fadeUp, viewportOnce } from "@/lib/motion";

type Props = {
  children: ReactNode;
  variant?: Variants;
  delay?: number;
  className?: string;
  as?: "div" | "section" | "article" | "li" | "span";
};

export default function Reveal({
  children,
  variant = fadeUp,
  delay = 0,
  className,
  as = "div",
}: Props) {
  const Comp = motion[as] as any;
  return (
    <Comp
      variants={variant}
      initial="hidden"
      whileInView="show"
      viewport={viewportOnce}
      transition={{ delay }}
      className={className}
    >
      {children}
    </Comp>
  );
}