"use client";

import { motion, useAnimationControls, useReducedMotion } from "framer-motion";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { VisualPreloadContext } from "@/components/visuals/VisualPreloadContext";
import { preloadVisualChunks } from "@/components/visuals/preloadVisualChunks";

const useIsomorphicLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;
const CLICK_WATCHDOG_MS = 1_350;
const ROUTE_WATCHDOG_MS = 2_400;
const MIN_REVEAL_MS = 320;
const ENTER_MS = 220;
const VISIBLE_VISUAL_SELECTOR = ".route-content [data-visual-instance]";
const LAZY_VISUAL_SELECTOR = ".route-content [data-lazy-visual]";

type VisualReadyDetail = { route?: string; instanceId?: string; status?: "ready" | "error" };

/**
 * Starts the transition on the user's click (not after the server has returned the new
 * pathname), then reveals the destination as soon as its content, critical images, and
 * above-the-fold 3D scene are ready. Below-the-fold scenes remain lazy to protect mobile GPUs.
 */
export default function RouteTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isArabicRoute = pathname?.startsWith("/ar");
  const reducedMotion = useReducedMotion();
  const controls = useAnimationControls();
  const previousPath = useRef<string | null>(null);
  const transitionActive = useRef(false);
  const transitionId = useRef(0);
  const transitionStartedAt = useRef(0);
  const watchdog = useRef<number | null>(null);
  const finishRef = useRef<() => void>(() => undefined);
  const [showCurtain, setShowCurtain] = useState(false);
  const [preloadVisuals, setPreloadVisuals] = useState(false);

  const finishTransition = useCallback(() => {
    if (!transitionActive.current) return;
    transitionActive.current = false;
    if (watchdog.current !== null) {
      window.clearTimeout(watchdog.current);
      watchdog.current = null;
    }
    const finishedId = transitionId.current;
    controls.stop();
    controls.start({
      y: "-105%",
      opacity: 1,
      transition: { duration: 0.26, ease: [0.76, 0, 0.24, 1] },
    }).then(() => {
      if (transitionId.current !== finishedId) return;
      setShowCurtain(false);
      setPreloadVisuals(false);
    }, () => {
      if (transitionId.current !== finishedId) return;
      setShowCurtain(false);
      setPreloadVisuals(false);
    });
  }, [controls]);

  const beginTransition = useCallback(() => {
    if (reducedMotion || (typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches)) {
      setShowCurtain(false);
      setPreloadVisuals(false);
      return;
    }
    const id = ++transitionId.current;
    transitionActive.current = true;
    transitionStartedAt.current = performance.now();
    setShowCurtain(true);
    setPreloadVisuals(false);
    if (watchdog.current !== null) window.clearTimeout(watchdog.current);
    controls.stop();
    controls.set({ y: "100%", opacity: 1 });
    requestAnimationFrame(() => {
      if (transitionId.current !== id || !transitionActive.current) return;
      controls.start({
        y: "0%",
        opacity: 1,
        transition: { duration: ENTER_MS / 1000, ease: [0.2, 0.8, 0.2, 1] },
      });
    });
    // A failed route request or a WebGL failure can never leave an overlay stuck forever.
    watchdog.current = window.setTimeout(() => finishRef.current(), CLICK_WATCHDOG_MS);
  }, [controls, reducedMotion]);

  useEffect(() => {
    finishRef.current = finishTransition;
  }, [finishTransition]);

  // Capture intent before Next.js starts its asynchronous route request. Do not prevent the
  // click or call router.push here: the actual anchor/Next Link remains the navigation owner.
  useEffect(() => {
    if (reducedMotion) return;
    const onDocumentClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      if (!(event.target instanceof Element)) return;
      const anchor = event.target.closest<HTMLAnchorElement>("a[href]");
      if (!anchor || anchor.hasAttribute("download") || anchor.target && anchor.target !== "_self") return;
      if (anchor.dataset.noRouteTransition !== undefined) return;

      let target: URL;
      try { target = new URL(anchor.href, window.location.href); }
      catch { return; }
      const localizedRoute = (path: string) => /^\/(?:ar|en)(?:\/|$)/.test(path);
      if (target.origin !== window.location.origin || !localizedRoute(target.pathname) || !localizedRoute(window.location.pathname)) return;
      if (target.pathname === window.location.pathname) return;
      beginTransition();
    };
    const onProgrammaticIntent = (event: Event) => {
      const detail = (event as CustomEvent<{ href?: string }>).detail;
      if (typeof detail?.href !== "string") return;
      try {
        const target = new URL(detail.href, window.location.href);
        if (target.origin !== window.location.origin || target.pathname === window.location.pathname) return;
        if (!/^\/(?:ar|en)(?:\/|$)/.test(target.pathname) || !/^\/(?:ar|en)(?:\/|$)/.test(window.location.pathname)) return;
        beginTransition();
      } catch {}
    };
    document.addEventListener("click", onDocumentClick, true);
    window.addEventListener("archai:navigation-intent", onProgrammaticIntent as EventListener);
    return () => {
      document.removeEventListener("click", onDocumentClick, true);
      window.removeEventListener("archai:navigation-intent", onProgrammaticIntent as EventListener);
    };
  }, [beginTransition, reducedMotion]);

  useIsomorphicLayoutEffect(() => {
    if (!pathname) return;
    const previous = previousPath.current;
    previousPath.current = pathname;
    // A direct page load should render normally; route transitions are for actual navigation.
    if (previous === null || previous === pathname) return;

    if (reducedMotion || window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      transitionActive.current = false;
      setShowCurtain(false);
      setPreloadVisuals(false);
      return;
    }

    if (!transitionActive.current) beginTransition();
    // The click animation is already moving. Once Next confirms the destination, give its
    // server content, critical images, and visible visual scene a fresh readiness window.
    // The short click watchdog only applies if navigation never starts at all.
    if (watchdog.current !== null) window.clearTimeout(watchdog.current);
    watchdog.current = window.setTimeout(() => finishRef.current(), ROUTE_WATCHDOG_MS);
    setPreloadVisuals(true);

    let disposed = false;
    let observer: MutationObserver | null = null;
    let revealTimer = 0;
    const imageListeners = new Map<HTMLImageElement, () => void>();
    const requestedChunks = new Set<string>();
    const root = () => document.querySelector<HTMLElement>(".route-content");
    const hasLayout = (element: HTMLElement) => {
      const rect = element.getBoundingClientRect();
      const style = window.getComputedStyle(element);
      return rect.width > 0 && rect.height > 0 && style.display !== "none" && style.visibility !== "hidden";
    };
    const inViewport = (element: HTMLElement) => {
      const rect = element.getBoundingClientRect();
      return rect.bottom > 0 && rect.top < window.innerHeight && rect.right > 0 && rect.left < window.innerWidth;
    };
    const criticalImages = () => {
      const content = root();
      if (!content) return [] as HTMLImageElement[];
      return Array.from(content.querySelectorAll<HTMLImageElement>("img")).filter((image) => {
        const rect = image.getBoundingClientRect();
        const visible = rect.bottom > 0 && rect.top < window.innerHeight && rect.right > 0 && rect.left < window.innerWidth;
        return visible || image.fetchPriority === "high";
      });
    };
    const visibleVisuals = () => {
      const content = root();
      if (!content) return [] as HTMLElement[];
      return Array.from(content.querySelectorAll<HTMLElement>(VISIBLE_VISUAL_SELECTOR)).filter((visual) => hasLayout(visual) && inViewport(visual));
    };
    const pageReady = () => {
      const content = root();
      if (!content || content.children.length === 0) return false;
      if (content.querySelector('[aria-busy="true"], [data-route-loading="true"]')) return false;
      // Important archive/marketing routes explicitly mark completed server content. Other
      // routes are accepted once their rendered DOM is present and no loading boundary remains.
      return Boolean(content.querySelector('[data-route-ready="true"]')) || content.children.length > 0;
    };
    const visualsReady = () => visibleVisuals().every((visual) =>
      visual.dataset.visualReady === "ready" || visual.dataset.visualReady === "error"
    );
    const canReveal = () => {
      if (disposed || !transitionActive.current || performance.now() - transitionStartedAt.current < MIN_REVEAL_MS) return false;
      return pageReady() && criticalImages().every((image) => image.complete) && visualsReady();
    };
    const checkReady = () => {
      if (disposed || !transitionActive.current) return;
      if (canReveal()) {
        finishRef.current();
        return;
      }
      window.clearTimeout(revealTimer);
      const elapsed = performance.now() - transitionStartedAt.current;
      revealTimer = window.setTimeout(checkReady, Math.max(45, MIN_REVEAL_MS - elapsed, 90));
    };
    const scheduleCheck = () => {
      criticalImages().forEach((image) => {
        if (image.complete || imageListeners.has(image)) return;
        const done = () => {
          image.removeEventListener("load", done);
          image.removeEventListener("error", done);
          imageListeners.delete(image);
          checkReady();
        };
        imageListeners.set(image, done);
        image.addEventListener("load", done, { once: true });
        image.addEventListener("error", done, { once: true });
      });

      // Fetch chunks only for scenes at/near the viewport; never spin up every below-fold
      // WebGL scene on mobile just to decorate a page transition.
      const candidates = Array.from(document.querySelectorAll<HTMLElement>(LAZY_VISUAL_SELECTOR))
        .filter((element) => {
          if (!hasLayout(element)) return false;
          const rect = element.getBoundingClientRect();
          return rect.bottom > -160 && rect.top < window.innerHeight + 360;
        })
        .sort((a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top);
      const names = [...new Set(candidates.map((element) => element.dataset.lazyVisual).filter((name): name is string => Boolean(name)))];
      const freshNames = names.filter((name) => !requestedChunks.has(name));
      freshNames.forEach((name) => requestedChunks.add(name));
      if (freshNames.length) {
        void preloadVisualChunks(freshNames).catch((error) => {
          if (process.env.NODE_ENV !== "production") console.debug("[RouteTransition] non-blocking visual preload skipped", error);
        });
      }
      checkReady();
    };
    const onVisualReady = (event: Event) => {
      const detail = (event as CustomEvent<VisualReadyDetail>).detail;
      if (detail?.route && detail.route !== pathname) return;
      checkReady();
    };

    window.addEventListener("archai:visual-ready", onVisualReady as EventListener);
    scheduleCheck();
    observer = new MutationObserver(() => scheduleCheck());
    if (root()) observer.observe(root()!, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["data-visual-ready", "aria-busy", "data-route-ready"],
    });
    const fontPromise = document.fonts?.ready;
    if (fontPromise) void fontPromise.then(checkReady).catch(checkReady);

    return () => {
      disposed = true;
      window.removeEventListener("archai:visual-ready", onVisualReady as EventListener);
      observer?.disconnect();
      imageListeners.forEach((handler, image) => {
        image.removeEventListener("load", handler);
        image.removeEventListener("error", handler);
      });
      window.clearTimeout(revealTimer);
    };
  }, [pathname, beginTransition, reducedMotion]);

  useEffect(() => () => {
    if (watchdog.current !== null) window.clearTimeout(watchdog.current);
    controls.stop();
  }, [controls]);

  return (
    <VisualPreloadContext.Provider value={preloadVisuals}>
      <>
        <motion.div
          className="route-content"
          key={pathname}
          // Do not SSR the actual route hidden while hydration / client JS boots. The curtain
          // already supplies the navigation animation; direct visits should paint immediately.
          initial={false}
          animate={{ opacity: 1, y: 0 }}
          transition={reducedMotion ? { duration: 0 } : { duration: 0.16, ease: [0.2, 0.75, 0.25, 1] }}
        >
          {children}
        </motion.div>
        {showCurtain && !reducedMotion ? (
          <motion.div
            className="route-transition-curtain"
            initial={{ y: "100%", opacity: 1 }}
            animate={controls}
            aria-hidden="true"
          >
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
