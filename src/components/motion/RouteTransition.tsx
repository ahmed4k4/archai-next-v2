"use client";

import { motion, useAnimationControls, useReducedMotion } from "framer-motion";
import { usePathname } from "next/navigation";
import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { VisualPreloadContext } from "@/components/visuals/VisualPreloadContext";
import { preloadVisualChunks } from "@/components/visuals/preloadVisualChunks";

const useIsomorphicLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;
const MAX_CURTAIN_MS = 1_650;
const MIN_CURTAIN_MS = 420;
const VISUAL_SELECTOR = ".route-content [data-visual-instance]";
const LAZY_VISUAL_SELECTOR = ".route-content [data-lazy-visual]";

type VisualReadyDetail = { route?: string; instanceId?: string; status?: "ready" | "error" };

/**
 * Bounded route curtain that preloads every 3D visual in the active responsive layout.
 * Below-the-fold canvases paint a first frame and then pause their render loop off-screen.
 * A hard 1.65s deadline + a 280ms exit animation keeps total curtain time below ~2s.
 */
export default function RouteTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isArabicRoute = pathname?.startsWith("/ar");
  const reducedMotion = useReducedMotion();
  const controls = useAnimationControls();
  const previousPath = useRef<string | null>(null);
  const transitionActive = useRef(false);
  const transitionId = useRef(0);
  const reducedMotionRef = useRef(false);
  const [showCurtain, setShowCurtain] = useState(true);
  const [preloadVisuals, setPreloadVisuals] = useState(false);

  useEffect(() => {
    reducedMotionRef.current = Boolean(reducedMotion);
    if (reducedMotionRef.current && transitionActive.current) {
      transitionId.current += 1;
      transitionActive.current = false;
      controls.stop();
      controls.set({ opacity: 0, y: "-100%" });
      setShowCurtain(false);
      setPreloadVisuals(false);
    }
  }, [reducedMotion, controls]);

  useIsomorphicLayoutEffect(() => {
    const pathChanged = previousPath.current !== pathname;
    const recoveringInterruptedTransition = !pathChanged && transitionActive.current;
    if (!pathChanged && !recoveringInterruptedTransition) return;
    previousPath.current = pathname;

    const mediaReduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    if (reducedMotionRef.current || mediaReduce) {
      transitionId.current += 1;
      transitionActive.current = false;
      controls.stop();
      controls.set({ opacity: 0, y: "-100%" });
      setShowCurtain(false);
      setPreloadVisuals(false);
      return;
    }

    const currentTransitionId = ++transitionId.current;
    const startedAt = performance.now();
    transitionActive.current = true;
    setShowCurtain(true);
    // The provider was previously hard-coded to false, so below-the-fold LazyVisuals never
    // mounted until scroll. Turn on route-wide visual preparation while the curtain is up.
    setPreloadVisuals(true);
    controls.stop();
    controls.set({ opacity: 1, y: "0%" });

    let disposed = false;
    let settled = false;
    let deadlineTimer = 0;
    let readyRevealTimer = 0;
    let hardHideTimer = 0;
    let observer: MutationObserver | null = null;
    let requestedChunks = new Set<string>();
    const imageListeners = new Map<HTMLImageElement, () => void>();

    const cleanup = () => {
      window.removeEventListener("archai:visual-ready", onVisualReady as EventListener);
      observer?.disconnect();
      observer = null;
      imageListeners.forEach((handler, image) => {
        image.removeEventListener("load", handler);
        image.removeEventListener("error", handler);
      });
      imageListeners.clear();
      window.clearTimeout(deadlineTimer);
      window.clearTimeout(readyRevealTimer);
      window.clearTimeout(hardHideTimer);
    };

    const finalize = () => {
      if (disposed || transitionId.current !== currentTransitionId) return;
      window.clearTimeout(hardHideTimer);
      transitionActive.current = false;
      setShowCurtain(false);
      setPreloadVisuals(false);
    };

    const exit = () => {
      if (disposed || settled) return;
      settled = true;
      cleanup();
      hardHideTimer = window.setTimeout(finalize, 340);
      controls.start({
        y: "-105%",
        opacity: 1,
        transition: { duration: 0.28, ease: [0.76, 0, 0.24, 1] },
      }).then(finalize, finalize);
    };

    const elapsed = () => performance.now() - startedAt;
    const isInViewport = (image: HTMLImageElement) => {
      const rect = image.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0 && rect.bottom > 0 && rect.top < window.innerHeight && rect.right > 0 && rect.left < window.innerWidth;
    };
    const hasLayout = (element: HTMLElement) => {
      const rect = element.getBoundingClientRect();
      const style = window.getComputedStyle(element);
      return rect.width > 0 && rect.height > 0 && style.display !== "none" && style.visibility !== "hidden";
    };
    const routeContainer = () => document.querySelector<HTMLElement>(".route-content");
    const routeReady = () => Boolean(routeContainer()?.querySelector('[data-route-ready="true"]'));
    const criticalImages = () => {
      const root = routeContainer();
      if (!root) return [] as HTMLImageElement[];
      return Array.from(root.querySelectorAll<HTMLImageElement>("img")).filter((image) =>
        isInViewport(image) || image.fetchPriority === "high"
      );
    };
    const routeVisualInstances = () => {
      const root = routeContainer();
      if (!root) return [] as HTMLElement[];
      return Array.from(root.querySelectorAll<HTMLElement>(VISUAL_SELECTOR)).filter(hasLayout);
    };
    const allRouteVisualsResolved = () => routeVisualInstances().every((visual) =>
      visual.dataset.visualReady === "ready" || visual.dataset.visualReady === "error"
    );

    const canReveal = () => {
      if (disposed || settled || elapsed() < MIN_CURTAIN_MS || !routeReady()) return false;
      const imagesReady = criticalImages().every((image) => image.complete);
      // Wait for all 3D instances that actually participate in this responsive layout, not
      // just the hero. A hard deadline below still protects slow devices/network conditions.
      return imagesReady && allRouteVisualsResolved();
    };

    const scheduleReveal = () => {
      if (settled || disposed) return;
      if (canReveal()) {
        window.clearTimeout(readyRevealTimer);
        readyRevealTimer = window.setTimeout(exit, 35);
      }
    };

    const collectRouteVisuals = () => {
      // Preload every scene used by the incoming route. LazyVisual mounts those whose
      // responsive layout is active; Scene3D paints one off-screen frame, then pauses its loop.
      const candidates = Array.from(document.querySelectorAll<HTMLElement>(LAZY_VISUAL_SELECTOR))
        .filter(hasLayout)
        .sort((a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top);
      const freshNames = candidates
        .map((element) => element.dataset.lazyVisual)
        .filter((name): name is string => Boolean(name) && !requestedChunks.has(name));
      freshNames.forEach((name) => requestedChunks.add(name));
      if (freshNames.length) {
        void preloadVisualChunks(freshNames).catch((error) => {
          if (process.env.NODE_ENV !== "production") console.debug("[RouteTransition] non-blocking visual preload skipped", error);
        });
      }
      criticalImages().forEach((image) => {
        if (image.complete || imageListeners.has(image)) return;
        const done = () => {
          image.removeEventListener("load", done);
          image.removeEventListener("error", done);
          imageListeners.delete(image);
          scheduleReveal();
        };
        imageListeners.set(image, done);
        image.addEventListener("load", done, { once: true });
        image.addEventListener("error", done, { once: true });
      });
      scheduleReveal();
    };

    const onVisualReady = (event: Event) => {
      const detail = (event as CustomEvent<VisualReadyDetail>).detail;
      if (detail?.route && detail.route !== pathname) return;
      scheduleReveal();
    };

    window.addEventListener("archai:visual-ready", onVisualReady as EventListener);
    collectRouteVisuals();
    observer = new MutationObserver(() => {
      collectRouteVisuals();
      scheduleReveal();
    });
    const container = routeContainer();
    if (container) observer.observe(container, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["data-visual-ready", "data-route-ready"],
    });

    // Fonts are a best-effort enhancement, not a reason to block the route curtain.
    if (document.fonts?.ready) {
      void document.fonts.ready.then(scheduleReveal).catch(scheduleReveal);
    }

    // Hard upper bound measured from transition start, regardless of DOM mutations.
    deadlineTimer = window.setTimeout(exit, MAX_CURTAIN_MS);
    return () => {
      disposed = true;
      cleanup();
      controls.stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, controls]);

  return (
    <VisualPreloadContext.Provider value={preloadVisuals || Boolean(reducedMotion)}>
      <>
        <motion.div
          className="route-content"
          key={pathname}
          initial={reducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={reducedMotion ? { duration: 0 } : { duration: 0.24, ease: [0.2, 0.75, 0.25, 1] }}
        >
          {children}
        </motion.div>
        {showCurtain && !reducedMotion ? (
          <motion.div className="route-transition-curtain" initial={false} animate={controls} aria-hidden="true">
            <div className="route-transition-stage">
              <div className="route-transition-mark">
                <span className="route-transition-orbit route-transition-orbit-a" />
                <span className="route-transition-orbit route-transition-orbit-b" />
                <span className="route-transition-orbit route-transition-orbit-c" />
                <span className="route-transition-satellite" />
                <span className="route-transition-core" />
              </div>
              <span className="route-transition-wordmark">ARCHAI</span>
              <span className="route-transition-label">{isArabicRoute ? "حلول رقمية تُبنى بهدف" : "DIGITAL SYSTEMS · BUILT WITH INTENT"}</span>
              <span className="route-transition-status"><i /> {isArabicRoute ? "جاري تجهيز الصفحة" : "PREPARING EXPERIENCE"}</span>
            </div>
            <span className="route-transition-line" />
          </motion.div>
        ) : null}
      </>
    </VisualPreloadContext.Provider>
  );
}
