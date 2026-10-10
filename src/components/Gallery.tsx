"use client";
import { useRef, useState } from "react";

type GalleryProps = { images: any[]; title: string; lang: "ar" | "en" };

export default function Gallery({ images, title, lang }: GalleryProps) {
  const rtl = lang === "ar";
  const [k, setK] = useState(0);
  const dlg = useRef<HTMLDialogElement | null>(null);
  const x0 = useRef(0);
  const n = images.length;
  if (!n) return null;
  const show = (j) => setK((j + n) % n);
  const cur = images[k];
  const alt = cur[`alt_${lang}`] || cur.alt_en || title;
  return (
    <section className="gal reveal" style={{ marginTop: "var(--sp-6)" }}>
      <div
        className="main"
        onTouchStart={(e) => (x0.current = e.touches[0].clientX)}
        onTouchEnd={(e) => {
          const d = e.changedTouches[0].clientX - x0.current;
          if (Math.abs(d) > 40) show(k + (d < 0 ? 1 : -1) * (rtl ? -1 : 1));
        }}
      >
        <img src={cur.public_url} alt={alt} onClick={() => dlg.current?.showModal()} />
        {n > 1 ? (
          <>
            <button className="nv pv" type="button" aria-label="Previous" onClick={() => show(k - 1)}>
              {rtl ? "›" : "‹"}
            </button>
            <button className="nv nx" type="button" aria-label="Next" onClick={() => show(k + 1)}>
              {rtl ? "‹" : "›"}
            </button>
          </>
        ) : null}
      </div>
      {n > 1 ? (
        <div className="thumbs" role="tablist">
          {images.map((x, j) => (
            <img
              key={x.id || j}
              src={x.public_url}
              alt={x[`alt_${lang}`] || title}
              loading="lazy"
              tabIndex={0}
              role="tab"
              className={j === k ? "on" : ""}
              onClick={() => show(j)}
              onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), show(j))}
            />
          ))}
        </div>
      ) : null}
      <dialog ref={dlg} aria-label="Image viewer" onClick={(e) => e.target === dlg.current && dlg.current.close()}>
        <img src={cur.public_url} alt={alt} />
        <div className="row" style={{ justifyContent: "center", padding: 14 }}>
          <button className="btn" type="button" aria-label="Previous" onClick={() => show(k - 1)}>{rtl ? "›" : "‹"}</button>
          <button className="btn" type="button" aria-label="Next" onClick={() => show(k + 1)}>{rtl ? "‹" : "›"}</button>
          <button className="btn" type="button" aria-label="Fullscreen" onClick={() => dlg.current?.requestFullscreen?.()}>⛶</button>
          <button className="btn" type="button" aria-label="Close" onClick={() => dlg.current?.close()}>✕</button>
        </div>
      </dialog>
    </section>
  );
}
