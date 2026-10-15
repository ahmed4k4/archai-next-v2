"use client";

import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { ReactNode } from "react";
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

gsap.registerPlugin(ScrollTrigger);

type Props = { children: ReactNode };

/**
 * Lenis enhances desktop wheel input without replacing browser scrolling on touch
 * devices. ScrollTrigger scenes are rebuilt on route changes so new pages never
 * inherit stale triggers from the previous route.
 */
export default function SmoothMotion({ children }: Props) {
  const pathname = usePathname();
  const lenisRef = useRef<Lenis | null>(null);
  const gsapContextRef = useRef<gsap.Context | null>(null);

  useEffect(() => {
    const reducedQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const widthQuery = window.matchMedia("(min-width: 900px)");
    const pointerQuery = window.matchMedia("(pointer: fine)");
    const updateScrollTriggers = () => ScrollTrigger.update();
    const clearNativeFallbackClasses = () => {
      document.documentElement.classList.remove("lenis", "lenis-smooth", "lenis-scrolling", "lenis-stopped");
    };

    const destroyLenis = () => {
      const active = lenisRef.current;
      if (!active) {
        clearNativeFallbackClasses();
        return;
      }
      active.off("scroll", updateScrollTriggers);
      active.destroy();
      lenisRef.current = null;
      clearNativeFallbackClasses();
    };

    const syncLenis = () => {
      const shouldEnable = widthQuery.matches && pointerQuery.matches && !reducedQuery.matches;
      if (!shouldEnable) {
        destroyLenis();
        return;
      }
      if (lenisRef.current) return;

      try {
        const instance = new Lenis({
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
        lenisRef.current = instance;
        instance.on("scroll", updateScrollTriggers);
      } catch (error) {
        console.warn("[SmoothMotion] Lenis unavailable; keeping native scrolling enabled.", error);
        destroyLenis();
      }
    };

    syncLenis();
    reducedQuery.addEventListener?.("change", syncLenis);
    widthQuery.addEventListener?.("change", syncLenis);
    pointerQuery.addEventListener?.("change", syncLenis);

    return () => {
      reducedQuery.removeEventListener?.("change", syncLenis);
      widthQuery.removeEventListener?.("change", syncLenis);
      pointerQuery.removeEventListener?.("change", syncLenis);
      gsapContextRef.current?.revert();
      gsapContextRef.current = null;
      destroyLenis();
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    const frame = window.requestAnimationFrame(() => {
      if (cancelled) return;
      gsapContextRef.current?.revert();
      gsapContextRef.current = null;

      const root = document.getElementById("site-content");
      if (root) {
        gsapContextRef.current = gsap.context(() => {
          const elements = root.querySelectorAll<HTMLElement>("[data-gsap-parallax]");
          elements.forEach((element) => {
            const raw = Number(element.dataset.gsapParallax || 12);
            const distance = Math.min(24, Math.max(0, Number.isFinite(raw) ? raw : 12));
            if (!distance) return;
            const trigger = element.closest<HTMLElement>("[data-gsap-scene]") || element;
            gsap.fromTo(
              element,
              { y: -distance * 0.25 },
              {
                y: distance * 0.25,
                ease: "none",
                scrollTrigger: {
                  trigger,
                  start: "top bottom",
                  end: "bottom top",
                  scrub: 0.9,
                  invalidateOnRefresh: true,
                },
              },
            );
          });
        }, root);
      }

      lenisRef.current?.resize();
      ScrollTrigger.refresh();
    });

    return () => {
      cancelled = true;
      window.cancelAnimationFrame(frame);
    };
  }, [pathname]);

  return <>{children}</>;
}
