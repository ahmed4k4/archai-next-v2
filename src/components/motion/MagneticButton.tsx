"use client";
import Link from "next/link";
import type { ReactNode, MouseEvent } from "react";
import { useRef } from "react";

type Props = {
  children: ReactNode;
  className?: string;
  strength?: number;
  href?: string;
  onClick?: () => void;
};

/** Tiny pointer-only CTA enhancement. Native transforms keep it outside animation-library bundles. */
export default function MagneticButton({
  children,
  className,
  strength = 0.24,
  href,
  onClick,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  function onMove(event: MouseEvent<HTMLDivElement>) {
    if (window.matchMedia?.("(pointer: coarse)").matches || window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    const element = ref.current;
    if (!element) return;
    const rect = element.getBoundingClientRect();
    const x = (event.clientX - rect.left - rect.width / 2) * strength;
    const y = (event.clientY - rect.top - rect.height / 2) * strength;
    element.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
  }
  function onLeave() {
    if (ref.current) ref.current.style.transform = "translate3d(0, 0, 0)";
  }

  const internalRoute = Boolean(href && href.startsWith("/") && !href.startsWith("//"));
  return (
    <div ref={ref} onMouseMove={onMove} onMouseLeave={onLeave} className="inline-block magnetic-cta-wrap">
      {href && internalRoute ? (
        <Link href={href} prefetch={false} onClick={onClick} className={className}>{children}</Link>
      ) : href ? (
        <a href={href} onClick={onClick} className={className}>{children}</a>
      ) : (
        <button type="button" onClick={onClick} className={className}>{children}</button>
      )}
    </div>
  );
}
