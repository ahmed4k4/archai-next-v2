"use client";

import { useCallback, type CSSProperties, type PointerEvent, type ReactNode } from "react";

type SpotlightStyle = CSSProperties & {
  "--spotlight-x"?: string;
  "--spotlight-y"?: string;
};

/** Lightweight pointer-following spotlight for surfaces; no canvas or animation loop. */
export default function SpotlightPanel({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const handlePointerMove = useCallback((event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "touch") return;
    const rect = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty("--spotlight-x", `${event.clientX - rect.left}px`);
    event.currentTarget.style.setProperty("--spotlight-y", `${event.clientY - rect.top}px`);
  }, []);

  const style: SpotlightStyle = { "--spotlight-x": "50%", "--spotlight-y": "50%" };

  return (
    <div
      className={`spotlight-panel ${className}`}
      style={style}
      onPointerMove={handlePointerMove}
      onPointerLeave={(event) => {
        event.currentTarget.style.setProperty("--spotlight-x", "50%");
        event.currentTarget.style.setProperty("--spotlight-y", "50%");
      }}
    >
      {children}
    </div>
  );
}
