"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { pick, tr, safeUrl } from "../lib/i18n";

type SliderProps = { items: any[]; lang: "ar" | "en"; label: string; id?: string };

export default function Slider({ items, lang, label, id }: SliderProps) {
  const T = tr(lang);
  const rtl = lang === "ar";
  const track = useRef<HTMLDivElement | null>(null);
  const hold = useRef(false);
  const [i, setI] = useState(0);
  const n = items.length;

  const cur = () => {
    const el = track.current;
    return el ? Math.round(Math.abs(el.scrollLeft) / el.clientWidth) : 0;
  };
  const go = useCallback(
    (k) => {
      const el = track.current;
      if (!el) return;
      const t = (k + n) % n;
      el.scrollTo({ left: (rtl ? -1 : 1) * t * el.clientWidth, behavior: "smooth" });
    },
    [n, rtl]
  );

  useEffect(() => {
    if (n < 2) return;
    const timer = setInterval(() => {
      if (!hold.current && !document.hidden) go(cur() + 1);
    }, 5500);
    return () => clearInterval(timer);
  }, [n, go]);

  if (!n) return null;
  return (
    <section
      id={id}
      className="slider reveal"
      aria-label={label}
      onMouseEnter={() => (hold.current = true)}
      onMouseLeave={() => (hold.current = false)}
      onTouchStart={() => (hold.current = true)}
    >
      <div className="track" ref={track} onScroll={() => setI(cur())}>
        {items.map((x, j) => {
          const src = x.featured_image || x.cover_image;
          const title = pick(x, "title", lang);
          return (
            <article className={`slide${j === i ? " on" : ""}`} key={x.id}>
              {src ? <img src={src} alt={title} loading={j === 0 ? "eager" : "lazy"} decoding="async" /> : null}
              <div className="tx">
                <span className="badge">★ {T("feat")}</span>
                <h3>{title}</h3>
                <p>{pick(x, "summary", lang)}</p>
                <div className="row">
                  {x.live_url ? (
                    <a className="btn p" target="_blank" rel="noopener noreferrer" href={safeUrl(x.live_url)}>
                      {T("visit")} ↗
                    </a>
                  ) : null}
                  <Link className="btn" href={`/${lang}/projects/${x.id}`}>
                    {T("details")}
                  </Link>
                </div>
              </div>
            </article>
          );
        })}
      </div>
      {n > 1 ? (
        <>
          <button className="nv pv" type="button" aria-label="Previous" onClick={() => go(cur() - 1)}>
            {rtl ? "›" : "‹"}
          </button>
          <button className="nv nx" type="button" aria-label="Next" onClick={() => go(cur() + 1)}>
            {rtl ? "‹" : "›"}
          </button>
          <div className="dots" role="tablist">
            {items.map((x, j) => (
              <i key={x.id} className={j === i ? "on" : ""} onClick={() => go(j)} role="tab" aria-selected={j === i} />
            ))}
          </div>
        </>
      ) : null}
    </section>
  );
}
