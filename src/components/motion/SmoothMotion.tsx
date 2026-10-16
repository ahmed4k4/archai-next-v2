"use client";

import type Lenis from "lenis";
import type { ReactNode } from "react";
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

type Props = { children: ReactNode };
type ScrollTriggerLike = { update: () => void; refresh: () => void };
type RevertibleContext = { revert: () => void };
type LenisLike = Pick<Lenis, "destroy" | "resize" | "on" | "off">;
type IdleWindow = Window & {
  requestIdleCallback?: (callback: () => void, options?: { timeout: number }) => number;
  cancelIdleCallback?: (handle: number) => void;
};

/** Run optional motion code only after the page has painted. */
function scheduleIdle(callback: () => void, timeout = 1_500): () => void {
  const idleWindow = window as IdleWindow;
  if (idleWindow.requestIdleCallback) {
    const id = idleWindow.requestIdleCallback(callback, { timeout });
    return () => idleWindow.cancelIdleCallback?.(id);
  }
  const id = window.setTimeout(callback, timeout);
  return () => window.clearTimeout(id);
}

/**
 * Native scrolling is the default. Lenis is an optional desktop-only enhancement,
 * loaded after the user has actually scrolled and the wheel has gone quiet. This keeps
 * its JS and animation loop out of the cold-load critical path. GSAP is separately
 * imported only on desktop routes that use data-gsap-parallax.
 */
export default function SmoothMotion({ children }: Props) {
  const pathname = usePathname();
  const lenisRef = useRef<LenisLike | null>(null);
  const scrollTriggerRef = useRef<ScrollTriggerLike | null>(null);
  const gsapContextRef = useRef<RevertibleContext | null>(null);
  const onLenisScroll = () => scrollTriggerRef.current?.update();

  useEffect(() => {
    const reducedQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const widthQuery = window.matchMedia("(min-width: 900px)");
    const pointerQuery = window.matchMedia("(pointer: fine)");
    let disposed = false;
    let loading = false;
    let intentTimer: number | null = null;

    const clearNativeFallbackClasses = () => {
      document.documentElement.classList.remove("lenis", "lenis-smooth", "lenis-scrolling", "lenis-stopped");
    };
    const destroyLenis = () => {
      const active = lenisRef.current;
      if (active) {
        active.off("scroll", onLenisScroll);
        active.destroy();
        lenisRef.current = null;
      }
      clearNativeFallbackClasses();
    };
    const shouldEnable = () => widthQuery.matches && pointerQuery.matches && !reducedQuery.matches;

    const loadLenis = () => {
      if (!shouldEnable() || lenisRef.current || loading || disposed) return;
      loading = true;
      void import("lenis").then(({ default: LenisCtor }) => {
        if (disposed || !shouldEnable()) return;
        const instance = new LenisCtor({
          autoRaf: true,
          smoothWheel: true,
          syncTouch: false,
          anchors: true,
          lerp: 0.12,
          wheelMultiplier: 1,
          touchMultiplier: 1,
          overscroll: true,
          prevent: (node) => node instanceof HTMLElement && node.hasAttribute("data-lenis-prevent"),
        });
        lenisRef.current = instance as unknown as LenisLike;
        instance.on("scroll", onLenisScroll);
      }).catch((error: unknown) => {
        if (process.env.NODE_ENV !== "production") console.debug("[SmoothMotion] Lenis enhancement skipped", error);
        clearNativeFallbackClasses();
      }).finally(() => {
        loading = false;
      });
    };

    const onScrollIntent = () => {
      if (!shouldEnable() || lenisRef.current || loading) return;
      if (intentTimer !== null) window.clearTimeout(intentTimer);
      // Let the native scroll complete first, then progressively enhance later scrolling.
      intentTimer = window.setTimeout(() => {
        intentTimer = null;
        loadLenis();
      }, 850);
    };
    const syncConditions = () => {
      if (!shouldEnable()) {
        if (intentTimer !== null) window.clearTimeout(intentTimer);
        intentTimer = null;
        destroyLenis();
      }
    };

    window.addEventListener("scroll", onScrollIntent, { passive: true });
    reducedQuery.addEventListener?.("change", syncConditions);
    widthQuery.addEventListener?.("change", syncConditions);
    pointerQuery.addEventListener?.("change", syncConditions);

    return () => {
      disposed = true;
      if (intentTimer !== null) window.clearTimeout(intentTimer);
      window.removeEventListener("scroll", onScrollIntent);
      reducedQuery.removeEventListener?.("change", syncConditions);
      widthQuery.removeEventListener?.("change", syncConditions);
      pointerQuery.removeEventListener?.("change", syncConditions);
      gsapContextRef.current?.revert();
      gsapContextRef.current = null;
      scrollTriggerRef.current = null;
      destroyLenis();
    };
  }, []);

  useEffect(() => {
    const root = document.getElementById("site-content");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const desktopPointer = window.matchMedia("(min-width: 900px) and (pointer: fine)").matches;
    if (!root || reduce || !desktopPointer || !root.querySelector("[data-gsap-parallax]")) {
      const frame = window.requestAnimationFrame(() => lenisRef.current?.resize());
      return () => window.cancelAnimationFrame(frame);
    }

    let cancelled = false;
    const cancelScheduled = scheduleIdle(() => {
      void Promise.all([import("gsap"), import("gsap/ScrollTrigger")]).then(([gsapModule, triggerModule]) => {
        if (cancelled) return;
        const gsap = gsapModule.gsap;
        const ScrollTrigger = triggerModule.ScrollTrigger;
        gsap.registerPlugin(ScrollTrigger);
        scrollTriggerRef.current = ScrollTrigger;

        gsapContextRef.current?.revert();
        gsapContextRef.current = gsap.context(() => {
          const elements = root.querySelectorAll<HTMLElement>("[data-gsap-parallax]");
          elements.forEach((element) => {
            const raw = Number(element.dataset.gsapParallax || 12);
            const distance = Math.min(24, Math.max(0, Number.isFinite(raw) ? raw : 12));
            if (!distance) return;
            const trigger = element.closest<HTMLElement>("[data-gsap-scene]") || element;
            gsap.fromTo(element, { y: -distance * 0.25 }, {
              y: distance * 0.25,
              ease: "none",
              scrollTrigger: {
                trigger,
                start: "top bottom",
                end: "bottom top",
                scrub: 0.9,
                invalidateOnRefresh: true,
              },
            });
          });
        }, root);
        lenisRef.current?.resize();
        ScrollTrigger.refresh();
      }).catch((error: unknown) => {
        if (process.env.NODE_ENV !== "production") console.debug("[SmoothMotion] GSAP enhancement skipped", error);
      });
    });

    return () => {
      cancelled = true;
      cancelScheduled();
      gsapContextRef.current?.revert();
      gsapContextRef.current = null;
      scrollTriggerRef.current = null;
    };
  }, [pathname]);

  return <>{children}</>;
}
