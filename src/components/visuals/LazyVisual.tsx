"use client";

import { useEffect, useId, useRef, useState } from "react";
import DynamicVisual, { type VisualName } from "./DynamicVisual";
import { useVisualPreload } from "./VisualPreloadContext";

/**
 * Scenes normally mount shortly before they enter the viewport. During a route
 * transition the incoming page is covered, so all scene instances mount in parallel
 * behind the curtain. Once prepared, scenes remain mounted while Scene3D pauses
 * off-screen rendering to protect frame time and GPU resources.
 */
export default function LazyVisual({
  name,
  className,
  rootMargin = "280px 0px",
}: {
  name: VisualName;
  className?: string;
  rootMargin?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const preloadRouteVisuals = useVisualPreload();
  const rawId = useId();
  const visualId = `visual-${rawId.replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const [prepared, setPrepared] = useState(false);
  const shouldMount = prepared;

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    if (preloadRouteVisuals && !prepared) {
      // Prepare every scene that participates in the current layout before the route curtain
      // opens. Do not allocate WebGL for responsive variants currently display:none (common
      // on phones); they keep observing and will prepare if that breakpoint becomes visible.
      const rect = element.getBoundingClientRect();
      const style = window.getComputedStyle(element);
      const hasLayout = rect.width > 0 && rect.height > 0 && style.display !== "none" && style.visibility !== "hidden";
      // Route transitions may prepare only scenes near the viewport. Avoid mounting every
      // below-the-fold Canvas at once: that stalls the main thread and overwhelms mobile GPUs.
      const nearViewport = rect.bottom > -160 && rect.top < window.innerHeight + 360;
      if (hasLayout && nearViewport) {
        setPrepared(true);
        return;
      }
    }
    if (prepared) return;

    if (!("IntersectionObserver" in window)) {
      setPrepared(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setPrepared(true);
          observer.disconnect();
        }
      },
      { rootMargin, threshold: 0.01 },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [rootMargin, preloadRouteVisuals, prepared]);

  return (
    <div
      ref={ref}
      className={className}
      data-lazy-visual={name}
      data-visual-instance={visualId}
      aria-hidden="true"
    >
      {shouldMount ? (
        <DynamicVisual name={name} instanceId={visualId} className="absolute inset-0" />
      ) : (
        <div className="lazy-visual-placeholder absolute inset-0" />
      )}
    </div>
  );
}
