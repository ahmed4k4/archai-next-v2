"use client";

import { usePathname } from "next/navigation";
import { useCallback, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { VisualPreloadContext } from "@/components/visuals/VisualPreloadContext";

const useIsomorphicLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;
const prefersReducedMotion = () => typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
const CLICK_WATCHDOG_MS = 12_000;
const ROUTE_WATCHDOG_MS = 45_000;
const MIN_REVEAL_MS = 320;
const ROUTE_VISUAL_SELECTOR = ".route-content [data-lazy-visual]";

type VisualReadyDetail = { route?: string; instanceId?: string; status?: "ready" | "error" };

/**
 * Starts the transition on click and keeps the curtain covering the incoming route until
 * its fonts, critical images, finite entrance animations, and every on-page visual slot have
 * settled. On desktop, the incoming route's WebGL scenes are prepared serially under the
 * curtain. Infinite ambient animations are intentionally not treated as unfinished work.
 */
export default function RouteTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isArabicRoute = pathname?.startsWith("/ar");
  const previousPath = useRef<string | null>(null);
  const monitoredRoute = useRef<string | null>(null);
  // Render the intro curtain in the server HTML so it is visible from the first paint,
  // instead of waiting for hydration before showing the opening animation.
  const transitionActive = useRef(true);
  const transitionId = useRef(0);
  const transitionStartedAt = useRef(0);
  const watchdog = useRef<number | null>(null);
  const finishRef = useRef<() => void>(() => undefined);
  const [showCurtain, setShowCurtain] = useState(true);
  const [curtainPhase, setCurtainPhase] = useState<"ready" | "cover" | "exit" | "hidden">("cover");
  const [preloadVisuals, setPreloadVisuals] = useState(true);
  const [initialIntro, setInitialIntro] = useState(true);
  const curtainFrame = useRef<number | null>(null);
  const curtainTimer = useRef<number | null>(null);

  const finishTransition = useCallback(() => {
    if (!transitionActive.current) return;
    transitionActive.current = false;
    if (watchdog.current !== null) {
      window.clearTimeout(watchdog.current);
      watchdog.current = null;
    }
    if (curtainFrame.current !== null) {
      window.cancelAnimationFrame(curtainFrame.current);
      curtainFrame.current = null;
    }
    const finishedId = transitionId.current;
    setInitialIntro(false);
    setCurtainPhase("exit");
    if (curtainTimer.current !== null) window.clearTimeout(curtainTimer.current);
    curtainTimer.current = window.setTimeout(() => {
      if (transitionId.current !== finishedId) return;
      setShowCurtain(false);
      setCurtainPhase("hidden");
      setPreloadVisuals(false);
      curtainTimer.current = null;
    }, 290);
  }, []);

  const beginTransition = useCallback(() => {
    if (prefersReducedMotion()) {
      setShowCurtain(false);
      setCurtainPhase("hidden");
      setPreloadVisuals(false);
      setInitialIntro(false);
      transitionActive.current = false;
      return;
    }
    const id = ++transitionId.current;
    setInitialIntro(false);
    transitionActive.current = true;
    transitionStartedAt.current = performance.now();
    setShowCurtain(true);
    setCurtainPhase("ready");
    setPreloadVisuals(false);
    if (watchdog.current !== null) window.clearTimeout(watchdog.current);
    if (curtainTimer.current !== null) window.clearTimeout(curtainTimer.current);
    if (curtainFrame.current !== null) window.cancelAnimationFrame(curtainFrame.current);
    // A second frame lets the curtain's off-screen transform paint before its CSS transition.
    curtainFrame.current = window.requestAnimationFrame(() => {
      curtainFrame.current = window.requestAnimationFrame(() => {
        curtainFrame.current = null;
        if (transitionId.current === id && transitionActive.current) setCurtainPhase("cover");
      });
    });
    // Route requests or client errors must never leave the transition overlay stuck.
    watchdog.current = window.setTimeout(() => finishRef.current(), CLICK_WATCHDOG_MS);
  }, []);

  useEffect(() => {
    finishRef.current = finishTransition;
  }, [finishTransition]);

  // Capture intent before Next.js starts its asynchronous route request. Do not prevent the
  // click or call router.push here: the actual anchor/Next Link remains the navigation owner.
  useEffect(() => {
    if (prefersReducedMotion()) return;
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
  }, [beginTransition]);

  useIsomorphicLayoutEffect(() => {
    if (!pathname) return;
    const previous = previousPath.current;
    const isInitialLoad = previous === null;
    previousPath.current = pathname;

    // React Strict Mode replays effects in development. Re-arm the readiness watcher when
    // the first setup was cleaned up, but do not restart an already watched route.
    if (!isInitialLoad && previous === pathname &&
        (!transitionActive.current || monitoredRoute.current === pathname)) return;

    if (prefersReducedMotion()) {
      transitionActive.current = false;
      if (watchdog.current !== null) {
        window.clearTimeout(watchdog.current);
        watchdog.current = null;
      }
      setShowCurtain(false);
      setCurtainPhase("hidden");
      setPreloadVisuals(false);
      setInitialIntro(false);
      return;
    }

    if (isInitialLoad) {
      // The server-rendered intro is already covering the page. Start its readiness clock
      // on hydration and prepare the initial route visuals just like an in-app destination.
      transitionActive.current = true;
      transitionStartedAt.current = performance.now();
      setShowCurtain(true);
      setCurtainPhase("cover");
      setPreloadVisuals(true);
    } else if (!transitionActive.current) {
      beginTransition();
    }
    monitoredRoute.current = pathname;
    // The click animation is already moving. Once Next confirms the destination, keep the
    // curtain covering the page while its images, fonts, entrance animations, and visuals settle.
    // A long watchdog remains only as a failsafe for a broken/failed scene or route request.
    if (watchdog.current !== null) window.clearTimeout(watchdog.current);
    watchdog.current = window.setTimeout(() => finishRef.current(), ROUTE_WATCHDOG_MS);
    setPreloadVisuals(true);

    let disposed = false;
    let observer: MutationObserver | null = null;
    let revealTimer = 0;
    const imageListeners = new Map<HTMLImageElement, () => void>();
    const root = () => document.querySelector<HTMLElement>(".route-content");
    const hasLayout = (element: HTMLElement) => {
      const rect = element.getBoundingClientRect();
      const style = window.getComputedStyle(element);
      return rect.width > 0 && rect.height > 0 && style.display !== "none" && style.visibility !== "hidden";
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
    const routeVisuals = () => {
      const content = root();
      if (!content) return [] as HTMLElement[];
      return Array.from(content.querySelectorAll<HTMLElement>(ROUTE_VISUAL_SELECTOR));
    };
    const visualsReady = () => routeVisuals().every((visual) => {
      // Display:none tabs/menus are not part of the active experience. Lightweight CSS
      // scenes are already rendered and ready; WebGL scenes must signal their first frame.
      if (!hasLayout(visual)) return true;
      // CSS is the intentional final visual on constrained/mobile devices. On capable
      // desktops, wait for LazyVisual to confirm capability and then for a WebGL first frame.
      if (visual.dataset.visualCapability === "css") return true;
      if (visual.dataset.visualCapability !== "webgl") return false;
      return visual.dataset.visualReady === "ready" || visual.dataset.visualReady === "error";
    });
    const finiteAnimationsReady = () => {
      const content = root();
      if (!content || typeof content.getAnimations !== "function") return true;
      return content.getAnimations({ subtree: true }).every((animation) => {
        // Infinite ambient loops (or user-paused animations) should never block navigation.
        if (animation.playState !== "running" && !animation.pending) return true;
        const timing = animation.effect?.getComputedTiming();
        if (!timing || timing.iterations === Infinity || !Number.isFinite(timing.endTime)) return true;
        const endTimeMs = Number(timing.endTime);
        if (!Number.isFinite(endTimeMs)) return true;
        return Number(animation.currentTime ?? 0) >= endTimeMs;
      });
    };
    const pageReady = () => {
      const content = root();
      if (!content || content.children.length === 0) return false;
      if (content.querySelector('[aria-busy="true"], [data-route-loading="true"]')) return false;
      // Important archive/marketing routes explicitly mark completed server content. Other
      // routes are accepted once their rendered DOM is present and no loading boundary remains.
      return Boolean(content.querySelector('[data-route-ready="true"]')) || content.children.length > 0;
    };
    const device = navigator as Navigator & { deviceMemory?: number };
    const lightweightDevice = window.matchMedia("(max-width: 767px), (pointer: coarse)").matches ||
      (navigator.hardwareConcurrency || 8) <= 4 ||
      (typeof device.deviceMemory === "number" && device.deviceMemory <= 4);
    const canReveal = () => {
      if (disposed || !transitionActive.current) return false;
      const elapsed = performance.now() - transitionStartedAt.current;
      if (elapsed < MIN_REVEAL_MS || !pageReady()) return false;
      const imagesReady = criticalImages().every((image) => image.complete);
      const fontsReady = !document.fonts || document.fonts.status === "loaded";
      const animationReady = finiteAnimationsReady();
      // Mobile keeps the designed CSS scene instead of compiling WebGL. Desktop waits for
      // every mounted destination scene to report a first frame or a handled fallback error.
      const deviceVisualsReady = lightweightDevice || visualsReady();
      return imagesReady && fontsReady && animationReady && deviceVisualsReady;
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

      // LazyVisual watches the preload context and serially prepares the destination's
      // laid-out visual scenes while this curtain keeps the incomplete page covered.
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
      attributeFilter: ["data-visual-ready", "data-visual-mode", "data-visual-capability", "aria-busy", "data-route-ready"],
    });
    const fontPromise = document.fonts?.ready;
    if (fontPromise) void fontPromise.then(checkReady).catch(checkReady);

    return () => {
      disposed = true;
      if (monitoredRoute.current === pathname) monitoredRoute.current = null;
      window.removeEventListener("archai:visual-ready", onVisualReady as EventListener);
      observer?.disconnect();
      imageListeners.forEach((handler, image) => {
        image.removeEventListener("load", handler);
        image.removeEventListener("error", handler);
      });
      window.clearTimeout(revealTimer);
    };
  }, [pathname, beginTransition]);

  useEffect(() => () => {
    if (watchdog.current !== null) window.clearTimeout(watchdog.current);
    if (curtainFrame.current !== null) window.cancelAnimationFrame(curtainFrame.current);
    if (curtainTimer.current !== null) window.clearTimeout(curtainTimer.current);
  }, []);

  return (
    <VisualPreloadContext.Provider value={preloadVisuals}>
      <>
        <div className="route-content" key={pathname}>
          {children}
        </div>
        {showCurtain ? (
          <div
            className={`route-transition-curtain ${curtainPhase === "cover" ? "is-cover" : ""} ${curtainPhase === "exit" ? "is-exit" : ""} ${initialIntro ? "is-initial" : ""}`}
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
              <span className="route-transition-status"><i /> {isArabicRoute ? "جاري تجهيز الصفحة والمجسمات" : "PREPARING PAGE & 3D VISUALS"}</span>
            </div>
            <span className="route-transition-line" />
          </div>
        ) : null}
      </>
    </VisualPreloadContext.Provider>
  );
}
