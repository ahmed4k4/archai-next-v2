"use client";
import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import DynamicVisual, { type VisualName } from "../visuals/DynamicVisual";

/**
 * Lazy 3D panel. The WebGL scene is mounted only shortly before it enters the
 * viewport, keeping initial paint and mobile scrolling light while retaining
 * an active 3D experience when the user reaches the section.
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
  const host = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    if (!("IntersectionObserver" in window)) {
      setReady(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        // Mount only near the viewport and release WebGL resources after leaving it.
        setReady(Boolean(entry?.isIntersecting));
      },
      { rootMargin: "180px 0px", threshold: 0.01 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <motion.div
      ref={host}
      className={`relative aspect-video rounded-3xl overflow-hidden glass ${className ?? ""}`}
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(124,92,255,.16),transparent_45%),radial-gradient(circle_at_70%_65%,rgba(76,226,208,.1),transparent_42%)]" aria-hidden />
      {ready && <DynamicVisual name={name} className="absolute inset-0" />}
      {caption && (
        <div className="absolute bottom-4 left-4 right-4 text-xs font-mono text-ink-3 tracking-widest">
          {caption}
        </div>
      )}
    </motion.div>
  );
}
