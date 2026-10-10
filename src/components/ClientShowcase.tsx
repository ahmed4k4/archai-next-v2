"use client";
import { motion, useReducedMotion } from "framer-motion";
import type { Locale } from "@/lib/types";
import { Reveal } from "./motion";
import { fadeUp } from "@/lib/motion";

/** Capability marquee — avoids implying unverified client relationships. */
const CAPABILITIES = [
  "WEB PLATFORMS",
  "AI INTEGRATION",
  "DIGITAL PRODUCTS",
  "EMBEDDED SYSTEMS",
  "IOT & TELEMETRY",
  "BUSINESS AUTOMATION",
  "DATA & APIs",
  "UX ENGINEERING",
  "CLOUD DELIVERY",
  "PERFORMANCE",
];

export default function ClientShowcase({ lang }: { lang: Locale }) {
  const ar = lang === "ar";
  const reduce = useReducedMotion();
  const items = [...CAPABILITIES, ...CAPABILITIES];

  return (
    <section
      className="relative py-16 overflow-hidden"
      aria-label={ar ? "مجالاتنا التقنية" : "Technology capabilities"}
    >
      <div className="wrap">
        <Reveal variant={fadeUp}>
          <div className="flex items-center gap-3 mb-8">
            <span className="w-6 h-px bg-mint-400" />
            <span className="section-kicker mb-0">
              {ar ? "قدرات تقنية مترابطة" : "CONNECTED CAPABILITIES"}
            </span>
          </div>
        </Reveal>
      </div>

      {/* 3D-perspective marquee */}
      <div style={{ perspective: "800px" }} className="relative">
        <div
          className="relative overflow-hidden"
          style={{ transform: "rotateX(12deg)", transformStyle: "preserve-3d" }}
        >
          <motion.div
            className="flex gap-6 w-max"
            animate={
              reduce ? undefined : { x: ar ? ["-50%", "0%"] : ["0%", "-50%"] }
            }
            transition={{ duration: 42, repeat: Infinity, ease: "linear" }}
          >
            {items.map((name, i) => (
              <div
                key={`${name}-${i}`}
                className="group flex items-center gap-3 px-6 py-4 rounded-2xl border border-violet-500/15 bg-white/[0.02] backdrop-blur-sm shrink-0"
                style={{ boxShadow: "0 12px 40px rgba(3,5,16,.35)" }}
              >
                <span className="w-2 h-2 rounded-full bg-mint-400 shadow-glow-mint-sm" />
                <span className="font-mono text-sm tracking-[0.18em] text-ink-2 group-hover:text-ink-0 transition-colors whitespace-nowrap">
                  {name}
                </span>
              </div>
            ))}
          </motion.div>
          {/* edge fades */}
          <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-[var(--bg-0)] to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-[var(--bg-0)] to-transparent" />
        </div>
      </div>
    </section>
  );
}
