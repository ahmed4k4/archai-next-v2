"use client";
import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Locale } from "@/lib/types";

type GalleryProps = {
  images: any[];
  title: string;
  lang: Locale;
};

export default function Gallery({ images, title, lang }: GalleryProps) {
  const rtl = lang === "ar";
  const [k, setK] = useState(0);
  const [open, setOpen] = useState(false);
  const x0 = useRef(0);
  const n = images.length;

  if (!n) return null;

  const show = (j: number) => setK((j + n) % n);
  const cur = images[k];
  const alt = cur[`alt_${lang}`] || cur.alt_en || title;

  return (
    <>
      <motion.section
        className="mt-10"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
      >
        {/* Main image */}
        <div
          className="relative aspect-video rounded-3xl overflow-hidden glass cursor-zoom-in group"
          onTouchStart={(e) => (x0.current = e.touches[0].clientX)}
          onTouchEnd={(e) => {
            const d = e.changedTouches[0].clientX - x0.current;
            if (Math.abs(d) > 40) show(k + (d < 0 ? 1 : -1) * (rtl ? -1 : 1));
          }}
          onClick={() => setOpen(true)}
        >
          <AnimatePresence mode="wait">
            <motion.img
              key={k}
              src={cur.public_url}
              alt={alt}
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.opacity = "0.35";
              }}
              className="w-full h-full object-contain bg-black/40"
              initial={{ opacity: 0, scale: 1.02 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35 }}
            />
          </AnimatePresence>

          {/* Zoom hint */}
          <div className="absolute top-4 right-4 px-3 py-1.5 rounded-lg bg-black/70 backdrop-blur-md border border-violet-500/40 text-violet-200 text-[10px] font-mono uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
            ⛶ {rtl ? "تكبير" : "Zoom"}
          </div>

          {n > 1 && (
            <>
              <button
                className="absolute top-1/2 -translate-y-1/2 left-4 w-11 h-11 grid place-items-center rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white hover:bg-violet-500 hover:border-violet-500 transition-all z-10"
                type="button"
                aria-label="Previous"
                onClick={(e) => {
                  e.stopPropagation();
                  show(k - 1);
                }}
              >
                {rtl ? "›" : "‹"}
              </button>
              <button
                className="absolute top-1/2 -translate-y-1/2 right-4 w-11 h-11 grid place-items-center rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white hover:bg-violet-500 hover:border-violet-500 transition-all z-10"
                type="button"
                aria-label="Next"
                onClick={(e) => {
                  e.stopPropagation();
                  show(k + 1);
                }}
              >
                {rtl ? "‹" : "›"}
              </button>
            </>
          )}

          {n > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-full bg-black/70 backdrop-blur-md text-white text-xs font-mono">
              {k + 1} / {n}
            </div>
          )}
        </div>

        {/* Thumbnails */}
        {n > 1 && (
          <div className="flex gap-2 overflow-x-auto mt-4 pb-2 scrollbar-thin scrollbar-track-transparent">
            {images.map((x, j) => (
              <motion.button
                key={x.id || j}
                type="button"
                onClick={() => show(j)}
                whileHover={{ y: -4 }}
                className={`relative w-24 h-16 flex-none rounded-lg overflow-hidden border-2 transition-all ${
                  j === k
                    ? "border-violet-500 shadow-glow-violet"
                    : "border-transparent opacity-50 hover:opacity-90"
                }`}
              >
                <img
                  src={x.public_url}
                  alt={x[`alt_${lang}`] || title}
                  loading="lazy"
                  className="w-full h-full object-cover"
                />
              </motion.button>
            ))}
          </div>
        )}
      </motion.section>

      {/* Fullscreen modal */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[300] bg-black/95 backdrop-blur-xl flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
          >
            <motion.img
              key={k}
              src={cur.public_url}
              alt={alt}
              className="max-w-[92vw] max-h-[85vh] object-contain"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            />

            {/* Controls */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3">
              {n > 1 && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      show(k - 1);
                    }}
                    className="w-11 h-11 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-violet-500 transition-all"
                    aria-label="Previous"
                  >
                    {rtl ? "›" : "‹"}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      show(k + 1);
                    }}
                    className="w-11 h-11 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-violet-500 transition-all"
                    aria-label="Next"
                  >
                    {rtl ? "‹" : "›"}
                  </button>
                </>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setOpen(false);
                }}
                className="px-5 h-11 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-rose-500 transition-all text-sm"
              >
                ESC
              </button>
            </div>

            <button
              onClick={() => setOpen(false)}
              className="absolute top-6 right-6 w-11 h-11 grid place-items-center rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-xl hover:bg-rose-500 transition-all"
              aria-label="Close"
            >
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}