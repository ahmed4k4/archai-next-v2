"use client";

import { useEffect, useId, useRef, useState } from "react";
import DynamicVisual, { type VisualName } from "./DynamicVisual";
import VisualPlaceholder, { type VisualPlaceholderKind } from "./VisualPlaceholder";
import { useVisualPreload } from "./VisualPreloadContext";
import { releaseVisualPreparation, requestVisualPreparation } from "./visual-preparation-queue";

const PLACEHOLDER_KIND: Record<VisualName, VisualPlaceholderKind> = {
  HeroCore: "planet",
  ServiceConstellation: "constellation",
  IndustryRings: "rings",
  DNAHelix: "helix",
  WorkflowGraph: "workflow",
  KnowledgeFragments: "knowledge",
  SignalBeacon: "beacon",
  SuccessMetrics: "metrics",
  TeamOrbit: "team",
  QABubbles: "faq",
  ProjectOrbit: "project",
};

type IdleWindow = Window & {
  requestIdleCallback?: (callback: () => void, options?: { timeout: number }) => number;
  cancelIdleCallback?: (handle: number) => void;
};

function prefersLightweightScenes() {
  const touchLike = window.matchMedia("(max-width: 767px), (pointer: coarse)").matches;
  const device = navigator as Navigator & { deviceMemory?: number };
  const lowCpu = (navigator.hardwareConcurrency || 8) <= 4;
  const lowMemory = typeof device.deviceMemory === "number" && device.deviceMemory <= 4;
  return touchLike || lowCpu || lowMemory;
}

/**
 * Render a high-quality CSS visual immediately. WebGL is an enhancement for powerful,
 * fine-pointer devices only; phones/tablets keep the lightweight scene and never fetch
 * React Three Fiber / Three.js scene chunks during ordinary browsing.
 */
export default function LazyVisual({
  name,
  className,
  rootMargin = "180px 0px",
}: {
  name: VisualName;
  className?: string;
  rootMargin?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const preloadRouteVisuals = useVisualPreload();
  const rawId = useId();
  const visualId = `visual-${rawId.replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const [lightweightMode, setLightweightMode] = useState(true);
  const [prepared, setPrepared] = useState(false);

  useEffect(() => {
    const pointerQuery = window.matchMedia("(pointer: coarse)");
    const update = () => {
      const lightweight = prefersLightweightScenes();
      setLightweightMode(lightweight);
      if (lightweight) setPrepared(false);
    };
    update();
    window.addEventListener("resize", update, { passive: true });
    pointerQuery.addEventListener?.("change", update);
    return () => {
      window.removeEventListener("resize", update);
      pointerQuery.removeEventListener?.("change", update);
    };
  }, []);

  useEffect(() => {
    const element = ref.current;
    if (!element || lightweightMode) return;
    if (prepared) return;

    // Do not initialize Three.js during cold page load or while a route transition is
    // revealing the new document. The CSS scene is immediate; WebGL is progressively
    // enhanced only after real interaction and a quiet main-thread window.
    let cancelScheduled: (() => void) | null = null;
    let observer: IntersectionObserver | null = null;
    let eligible = false;
    let timer: number | null = null;
    const idleWindow = window as IdleWindow;

    const scheduleIfVisibleAndIdle = () => {
      if (!eligible || cancelScheduled || timer !== null) return;
      const rect = element.getBoundingClientRect();
      const style = window.getComputedStyle(element);
      const hasLayout = rect.width > 0 && rect.height > 0 && style.display !== "none" && style.visibility !== "hidden";
      const nearViewport = rect.bottom > -80 && rect.top < window.innerHeight + 160;
      if (!hasLayout || !nearViewport) return;
      observer?.disconnect();
      observer = null;

      // Give input/navigation priority, then load one scene while the browser is idle.
      timer = window.setTimeout(() => {
        timer = null;
        const enqueue = () => {
          cancelScheduled = requestVisualPreparation(visualId, () => setPrepared(true));
        };
        if (idleWindow.requestIdleCallback) {
          const id = idleWindow.requestIdleCallback(enqueue, { timeout: 3_500 });
          cancelScheduled = () => idleWindow.cancelIdleCallback?.(id);
        } else {
          const id = window.setTimeout(enqueue, 1_600);
          cancelScheduled = () => window.clearTimeout(id);
        }
      }, preloadRouteVisuals ? 1_600 : 1_200);
    };

    const grantEligibility = () => {
      eligible = true;
      scheduleIfVisibleAndIdle();
      // Off-screen observers remain attached until their placeholder enters the viewport.
      window.removeEventListener("pointerdown", grantEligibility);
      window.removeEventListener("wheel", grantEligibility);
      window.removeEventListener("keydown", grantEligibility);
    };

    if (!("IntersectionObserver" in window)) {
      observer = null;
    } else {
      observer = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) scheduleIfVisibleAndIdle();
      }, { rootMargin, threshold: 0.01 });
      observer.observe(element);
    }

    // Wait for deliberate input (press, scroll, or keyboard) before loading Three.js.
    // Passive pointer movement alone is common during first paint and must not trigger
    // the very expensive WebGL chunks on the initial Lighthouse/page-load critical path.
    window.addEventListener("pointerdown", grantEligibility, { once: true, passive: true });
    window.addEventListener("wheel", grantEligibility, { once: true, passive: true });
    window.addEventListener("keydown", grantEligibility, { once: true });
    return () => {
      observer?.disconnect();
      window.removeEventListener("pointerdown", grantEligibility);
      window.removeEventListener("wheel", grantEligibility);
      window.removeEventListener("keydown", grantEligibility);
      if (timer !== null) window.clearTimeout(timer);
      cancelScheduled?.();
    };
  }, [rootMargin, preloadRouteVisuals, prepared, lightweightMode]);

  const shouldMount = prepared && !lightweightMode;

  useEffect(() => {
    if (!shouldMount) return;
    const release = () => releaseVisualPreparation(visualId);
    const onReady = (event: Event) => {
      const detail = (event as CustomEvent<{ instanceId?: string }>).detail;
      if (detail?.instanceId === visualId) release();
    };
    const current = ref.current;
    if (current?.dataset.visualReady === "ready" || current?.dataset.visualReady === "error") {
      release();
    }
    window.addEventListener("archai:visual-ready", onReady as EventListener);
    const failsafe = window.setTimeout(release, 6_500);
    return () => {
      window.removeEventListener("archai:visual-ready", onReady as EventListener);
      window.clearTimeout(failsafe);
      release();
    };
  }, [shouldMount, visualId]);

  return (
    <div
      ref={ref}
      className={className}
      data-lazy-visual={name}
      data-visual-instance={shouldMount ? visualId : undefined}
      data-visual-mode={lightweightMode ? "css" : shouldMount ? "webgl" : "pending"}
      aria-hidden="true"
    >
      {shouldMount ? (
        <DynamicVisual name={name} instanceId={visualId} className="absolute inset-0" />
      ) : (
        <div className="lazy-visual-placeholder absolute inset-0">
          <VisualPlaceholder kind={PLACEHOLDER_KIND[name]} />
        </div>
      )}
    </div>
  );
}
