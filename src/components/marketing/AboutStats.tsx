"use client";
import { motion, useReducedMotion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import type { Locale } from "@/lib/types";
import { AnimatedNumber } from "../motion";

/** Animated stat counters with a subtle 3D pop-in, for /about. */
const STATS = [
  { value: 2, suffix: "", ar: "لغتان للموقع", en: "Site languages" },
  { value: 6, suffix: "", ar: "مجالات تقنية", en: "Capability areas" },
  { value: 4, suffix: "", ar: "مراحل للتنفيذ", en: "Delivery stages" },
  { value: 1, suffix: "", ar: "منظومة متكاملة", en: "Connected approach" },
];

export default function AboutStats({ lang }: { lang: Locale }) {
  const ar = lang === "ar";
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });
  const reduce = useReducedMotion();

  return (
    <section className="wrap py-20" ref={ref}>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        {STATS.map((s, i) => (
          <motion.div
            key={s.en}
            className="relative p-6 rounded-3xl glass overflow-hidden text-center"
            initial={reduce ? { opacity: 1, rotateX: 0, y: 0 } : { opacity: 0, rotateX: 35, y: 40 }}
            whileInView={{ opacity: 1, rotateX: 0, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{
              duration: 0.7,
              delay: i * 0.1,
              ease: [0.16, 1, 0.3, 1],
            }}
            style={{ transformPerspective: 900 }}
          >
            <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full bg-grad-primary opacity-10 blur-2xl" />
            <div className="relative font-display text-4xl lg:text-5xl font-medium bg-grad-text-light dark:bg-grad-text bg-clip-text text-transparent">
              {inView ? <AnimatedNumber value={s.value} /> : 0}
              {s.suffix}
            </div>
            <div className="relative mt-2 text-[11px] font-mono uppercase tracking-widest text-ink-4">
              {ar ? s.ar : s.en}
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
