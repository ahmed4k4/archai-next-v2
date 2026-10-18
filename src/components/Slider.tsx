"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { pick, tr, safeUrl, projectCover } from "@/lib/i18n";
import type { Locale } from "@/lib/types";

type SliderProps = {
  items: any[];
  lang: Locale;
  label: string;
  id?: string;
};

export default function Slider({ items, lang, label, id }: SliderProps) {
  const T = tr(lang);
  const ar = lang === "ar";
  const track = useRef<HTMLDivElement | null>(null);
  const hold = useRef(false);
  const [i, setI] = useState(0);
  const n = items.length;

  const cur = () => {
    const el = track.current;
    return el ? Math.round(Math.abs(el.scrollLeft) / el.clientWidth) : 0;
  };

  const go = useCallback(
    (k: number) => {
      const el = track.current;
      if (!el) return;
      const t = (k + n) % n;
      el.scrollTo({
        left: (ar ? -1 : 1) * t * el.clientWidth,
        behavior: "smooth",
      });
    },
    [n, ar]
  );

  useEffect(() => {
    if (n < 2) return;
    const timer = setInterval(() => {
      if (!hold.current && !document.hidden) go(cur() + 1);
    }, 6500);
    return () => clearInterval(timer);
  }, [n, go]);

  if (!n) return null;

  return (
    <section
      id={id}
      className="featured-slider-enter relative rounded-4xl overflow-hidden glass mt-8"
      aria-label={label}
      onMouseEnter={() => (hold.current = true)}
      onMouseLeave={() => (hold.current = false)}
      onTouchStart={() => (hold.current = true)}
    >
      <div
        className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide min-h-[520px]"
        ref={track}
        onScroll={() => setI(cur())}
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {items.map((x, j) => {
          const src = projectCover(x);
          const title = pick(x, "title", lang);
          const liveUrl = safeUrl(x.live_url);
          return (
            <article
              key={x.id}
              className="flex-[0_0_100%] snap-start relative min-h-[520px] flex items-end bg-void-800 overflow-hidden"
            >
              {src && (
                <img
                  src={src}
                  alt={title}
                  loading={j === 0 ? "eager" : "lazy"}
                  decoding="async"
                  fetchPriority={j === 0 ? "high" : "low"}
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).style.display = "none";
                  }}
                  className="featured-slider-image absolute inset-0 w-full h-full object-cover"
                  style={{ transform: j === i ? "scale(1.06)" : "scale(1)" }}
                />
              )}

              <div className="absolute inset-0 bg-gradient-to-t from-void-900 via-void-900/60 to-transparent" />

              {/* Animated corner accent */}
              <div className="absolute top-6 right-6 w-24 h-24 border-t-2 border-r-2 border-violet-500/40 rounded-tr-3xl" />
              <div className="absolute top-6 left-6 w-24 h-24 border-t-2 border-l-2 border-mint-400/40 rounded-tl-3xl" />

              <div className="relative z-10 p-8 lg:p-14 max-w-3xl">
                <span className="featured-slider-copy featured-slider-copy-1 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/20 backdrop-blur-md border border-amber-500/40 text-amber-300 text-[10px] font-mono uppercase tracking-widest">
                  ★ {T("feat")}
                </span>

                <h3 className="featured-slider-copy featured-slider-copy-2 mt-4 font-display text-3xl lg:text-5xl font-medium text-white leading-tight">
                  {title}
                </h3>

                <p className="featured-slider-copy featured-slider-copy-3 mt-4 text-white/85 text-base lg:text-lg leading-relaxed max-w-xl">
                  {pick(x, "summary", lang)}
                </p>

                <div className="featured-slider-copy featured-slider-copy-4 mt-7 flex flex-wrap gap-3">
                  {liveUrl && (
                    <a
                      className="btn-primary"
                      target="_blank"
                      rel="noopener noreferrer"
                      href={liveUrl}
                    >
                      {T("visit")}
                      <span>↗</span>
                    </a>
                  )}
                  <Link
                    className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-white/25 bg-white/5 text-white text-sm font-semibold backdrop-blur-md hover:bg-white/10 hover:border-white/40 transition-all"
                    href={`/${lang}/projects/${x.slug || x.id}`}
                  >
                    {T("details")}
                  </Link>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {n > 1 && (
        <>
          <button
            className="absolute top-1/2 -translate-y-1/2 left-4 z-10 w-11 h-11 grid place-items-center rounded-full border border-white/20 bg-black/60 backdrop-blur-md text-white hover:bg-violet-500 hover:border-violet-500 transition-all"
            type="button"
            aria-label="Previous"
            onClick={() => go(cur() - 1)}
          >
            {ar ? "›" : "‹"}
          </button>
          <button
            className="absolute top-1/2 -translate-y-1/2 right-4 z-10 w-11 h-11 grid place-items-center rounded-full border border-white/20 bg-black/60 backdrop-blur-md text-white hover:bg-violet-500 hover:border-violet-500 transition-all"
            type="button"
            aria-label="Next"
            onClick={() => go(cur() + 1)}
          >
            {ar ? "‹" : "›"}
          </button>

          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
            {items.map((x, j) => (
              <button
                key={x.id}
                className={`h-2 rounded-full transition-all ${
                  j === i
                    ? "w-7 bg-grad-primary shadow-glow-violet"
                    : "w-2 bg-white/40 hover:bg-white/70"
                }`}
                onClick={() => go(j)}
                aria-label={`Go to slide ${j + 1}`}
                aria-selected={j === i}
                role="tab"
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}