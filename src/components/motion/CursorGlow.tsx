"use client";

import { useEffect, useRef, useState } from "react";

/** Desktop-only pointer halo driven by one requestAnimationFrame, without a motion runtime. */
export default function CursorGlow() {
  const ref = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const finePointer = window.matchMedia("(pointer: fine)");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setEnabled(finePointer.matches && !reducedMotion.matches);
    sync();
    finePointer.addEventListener?.("change", sync);
    reducedMotion.addEventListener?.("change", sync);

    let frame = 0;
    let x = -220;
    let y = -220;
    const onMove = (event: PointerEvent) => {
      x = event.clientX;
      y = event.clientY;
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        if (ref.current) {
          ref.current.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;
        }
      });
    };
    if (finePointer.matches && !reducedMotion.matches) {
      window.addEventListener("pointermove", onMove, { passive: true });
    }
    return () => {
      finePointer.removeEventListener?.("change", sync);
      reducedMotion.removeEventListener?.("change", sync);
      window.removeEventListener("pointermove", onMove);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  if (!enabled) return null;

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none fixed top-0 left-0 z-[200] h-[420px] w-[420px] rounded-full"
      style={{
        transform: "translate3d(-220px, -220px, 0) translate(-50%, -50%)",
        background: "radial-gradient(circle, rgba(124,92,255,.12) 0%, rgba(76,226,208,.06) 45%, transparent 70%)",
        mixBlendMode: "screen",
      }}
    />
  );
}
