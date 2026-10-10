"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import type { ReactNode } from "react";
import gsap from "gsap";

export function MotionDirector() {
  const pathname = usePathname();
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    let observer: IntersectionObserver | undefined;
    const ctx = gsap.context(() => {
      const heroItems = gsap.utils.toArray<HTMLElement>(".hero-main > *");
      if (heroItems.length) {
        gsap.fromTo(heroItems, { y: 24, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.8, stagger: 0.1, ease: "power3.out", clearProps: "all", delay: 0.08 });
      }
      const cards = gsap.utils.toArray<HTMLElement>(".marketing-card");
      const observed = new WeakSet<Element>();
      const io = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting || observed.has(entry.target)) return;
          observed.add(entry.target);
          gsap.fromTo(entry.target, { y: 26, autoAlpha: 0, rotateX: 2 }, { y: 0, autoAlpha: 1, rotateX: 0, duration: 0.72, ease: "power3.out", clearProps: "all" });
          io.unobserve(entry.target);
        });
      }, { threshold: 0.12 });
      observer = io;
      cards.forEach((card) => io.observe(card));
    });
    return () => { observer?.disconnect(); ctx.revert(); };
  }, [pathname]);
  return null;
}

export function MotionAccent({ children }: { children: ReactNode }) {
  return <motion.span className="motion-accent" initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.5 }} transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}>{children}</motion.span>;
}
