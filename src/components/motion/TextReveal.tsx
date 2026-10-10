"use client";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import type { ReactNode } from "react";

/**
 * TextReveal — headline that appears word-by-word (optionally letter-by-letter).
 * Wraps each unit in its own span so the animation masks cleanly.
 */
export default function TextReveal({
  text,
  as = "h2",
  className,
  delay = 0,
  by = "word",
  once = true,
}: {
  text: string;
  as?: "h1" | "h2" | "h3" | "p" | "span";
  className?: string;
  delay?: number;
  by?: "word" | "letter";
  once?: boolean;
}) {
  const reduce = useReducedMotion();
  const Comp = motion[as] as typeof motion.h2;
  const units = by === "word" ? text.split(" ") : text.split("");

  const container: Variants = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: by === "word" ? 0.06 : 0.02,
        delayChildren: delay,
      },
    },
  };
  const item: Variants = {
    hidden: { opacity: 0, y: "0.6em", filter: "blur(6px)" },
    show: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
    },
  };

  if (reduce) {
    return <Comp className={className}>{text}</Comp>;
  }

  return (
    <Comp
      className={className}
      variants={container}
      initial="hidden"
      whileInView="show"
      viewport={{ once, amount: 0.4 }}
    >
      {units.map((u, i) => (
        <span key={i} className="inline-block whitespace-pre">
          <motion.span className="inline-block" variants={item}>
            {u}
          </motion.span>
          {by === "word" && i < units.length - 1 ? " " : null}
        </span>
      ))}
    </Comp>
  );
}

export function RevealChildren({
  children,
  delay = 0,
}: {
  children: ReactNode;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}
