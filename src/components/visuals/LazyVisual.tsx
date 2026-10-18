"use client";

import { useEffect, useId, useRef, useState } from "react";
import dynamic from "next/dynamic";
import type { VisualName } from "./DynamicVisual";
import VisualPlaceholder, { type VisualPlaceholderKind } from "./VisualPlaceholder";
import { useVisualPreload } from "./VisualPreloadContext";
import { releaseVisualPreparation, requestVisualPreparation } from "./visual-preparation-queue";

// Keep even the scene registry out of the initial client bundle. It is imported only
// after the optional WebGL enhancement is actually mounted on a capable desktop.
const DynamicVisual = dynamic(() => import("./DynamicVisual"), { ssr: false, loading: () => null });

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

function canRun3DOnTouch() {
  // Touch-first layouts use the scene-specific CSS visual. This avoids downloading or
  // compiling Three.js/R3F on phones and tablets, including devices that over-report cores.
  return false;
}

/**
 * Render a high-quality CSS visual immediately. WebGL is an enhancement for powerful,
 * fine-pointer desktop devices only; phones/tablets keep the lightweight scene and never fetch
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
    const element = ref.current;
    const pointerQuery = window.matchMedia("(pointer: coarse)");
    const update = () => {
      const lightweight = prefersLightweightScenes();
      // Mark that the real device capability has been measured. The route curtain must
      // not mistake the server-rendered CSS placeholder for a completed desktop WebGL scene.
      if (element) element.dataset.visualCapability = lightweight ? "css" : "webgl";
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
    const touchEnhancement = lightweightMode && canRun3DOnTouch();
    if (!element || (lightweightMode && !touchEnhancement) || prepared) return;

    // On a cold page load the CSS illustration is already complete. Do not fetch and
    // compile Three.js in Lighthouse's initial interactive window just to replace it.
    // A real user gesture promotes the visual after a short idle grace period; a 10 s
    // safety timer still enhances desktop visuals for people who do not interact.
    // Route transitions are different: navigation is explicit intent, so scenes are
    // queued immediately under the curtain and the curtain waits for their first frame.
    let cancelScheduled: (() => void) | null = null;
    let observer: IntersectionObserver | null = null;
    let timer: number | null = null;
    let autoEnhanceTimer: number | null = null;
    let eligible = false;
    let userIntentSeen = false;
    let preparationRequested = false;
    const idleWindow = window as IdleWindow;
    const intentEvents = ["pointerdown", "wheel", "touchstart", "keydown", "scroll"] as const;

    const removeIntentListeners = () => {
      intentEvents.forEach((eventName) => window.removeEventListener(eventName, onIntent));
    };

    const queuePreparation = (kind: "route" | "intent" | "idle") => {
      if (preparationRequested || cancelScheduled || timer !== null) return;
      preparationRequested = true;
      if (autoEnhanceTimer !== null) {
        window.clearTimeout(autoEnhanceTimer);
        autoEnhanceTimer = null;
      }
      removeIntentListeners();

      const rect = element.getBoundingClientRect();
      const visible = rect.bottom > 0 && rect.top < window.innerHeight;
      const delay = kind === "route" ? (visible ? 90 : 160) : kind === "intent" ? 520 : 0;
      timer = window.setTimeout(() => {
        timer = null;
        const enqueue = () => {
          cancelScheduled = requestVisualPreparation(visualId, () => setPrepared(true));
        };

        if (kind === "route") {
          enqueue();
          return;
        }

        // Keep the enhancement away from active input/layout work whenever supported.
        if (idleWindow.requestIdleCallback) {
          const id = idleWindow.requestIdleCallback(enqueue, { timeout: kind === "intent" ? 1_800 : 2_200 });
          cancelScheduled = () => idleWindow.cancelIdleCallback?.(id);
        } else {
          const id = window.setTimeout(enqueue, kind === "intent" ? 650 : 1_000);
          cancelScheduled = () => window.clearTimeout(id);
        }
      }, delay);
    };

    function onIntent() {
      userIntentSeen = true;
      if (!eligible || preloadRouteVisuals || preparationRequested) return;
      queuePreparation("intent");
    }

    intentEvents.forEach((eventName) => window.addEventListener(eventName, onIntent, { passive: true, once: false }));

    const scheduleIfVisibleAndIdle = () => {
      if (cancelScheduled || timer !== null || preparationRequested) return;
      const rect = element.getBoundingClientRect();
      const style = window.getComputedStyle(element);
      const hasLayout = rect.width > 0 && rect.height > 0 && style.display !== "none" && style.visibility !== "hidden";
      // During a route transition wait briefly for destination layout, then prepare every
      // laid-out scene under the curtain. Off-screen scenes remain serialized by the queue.
      if (!hasLayout) {
        if (preloadRouteVisuals) {
          timer = window.setTimeout(() => {
            timer = null;
            scheduleIfVisibleAndIdle();
          }, 90);
        }
        return;
      }
      const nearViewport = rect.bottom > -80 && rect.top < window.innerHeight + 160;
      if (!nearViewport && !preloadRouteVisuals) return;
      observer?.disconnect();
      observer = null;
      eligible = true;

      if (preloadRouteVisuals) {
        queuePreparation("route");
        return;
      }

      if (userIntentSeen) {
        queuePreparation("intent");
        return;
      }

      // Background enhancement is intentionally outside the first several seconds of
      // interaction. The high-quality CSS placeholder stays visible and has no layout shift.
      if (autoEnhanceTimer === null) {
        autoEnhanceTimer = window.setTimeout(() => {
          autoEnhanceTimer = null;
          queuePreparation("idle");
        }, 10_000);
      }
    };

    if (preloadRouteVisuals) {
      scheduleIfVisibleAndIdle();
    } else if (!("IntersectionObserver" in window)) {
      scheduleIfVisibleAndIdle();
    } else {
      observer = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) scheduleIfVisibleAndIdle();
      }, { rootMargin, threshold: 0.01 });
      observer.observe(element);
    }

    return () => {
      observer?.disconnect();
      removeIntentListeners();
      if (timer !== null) window.clearTimeout(timer);
      if (autoEnhanceTimer !== null) window.clearTimeout(autoEnhanceTimer);
      cancelScheduled?.();
    };
  }, [name, rootMargin, preloadRouteVisuals, prepared, lightweightMode]);

  const shouldMount = prepared && (!lightweightMode || canRun3DOnTouch());

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
      data-visual-mode={shouldMount ? "webgl" : lightweightMode ? "css" : "pending"}
      aria-hidden="true"
    >
      <div className="lazy-visual-placeholder absolute inset-0">
        <VisualPlaceholder kind={PLACEHOLDER_KIND[name]} />
      </div>
      {shouldMount ? (
        <DynamicVisual name={name} instanceId={visualId} className="absolute inset-0" />
      ) : null}
    </div>
  );
}
