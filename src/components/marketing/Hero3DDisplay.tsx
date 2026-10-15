"use client";
import { motion } from "framer-motion";
import LazyVisual from "../visuals/LazyVisual";
import type { VisualName } from "../visuals/DynamicVisual";

/**
 * Small reusable 3D block that can be inserted anywhere on any page
 * to add a distinct animated visual mid-page.
 */
export default function Hero3DDisplay({
  name,
  caption,
  className,
}: {
  name: VisualName;
  caption?: string;
  className?: string;
}) {
  return (
    <motion.div
      className={`relative aspect-video rounded-3xl overflow-hidden glass scanlines ${className ?? ""}`}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      <LazyVisual name={name} className="absolute inset-0" rootMargin="280px 0px" />
      {caption && (
        <div className="absolute bottom-4 left-4 right-4 text-xs font-mono text-ink-3 tracking-widest">
          {caption}
        </div>
      )}
    </motion.div>
  );
}