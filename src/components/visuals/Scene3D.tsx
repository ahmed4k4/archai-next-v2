"use client";
import { Canvas, type CanvasProps, useThree, useFrame } from "@react-three/fiber";
import { Component, Suspense, useEffect, useRef, useState, type ReactNode } from "react";
import { useReducedMotion } from "framer-motion";
import VisualPlaceholder, { type VisualPlaceholderKind } from "./VisualPlaceholder";

type Props = {
  children: ReactNode;
  className?: string;
  camera?: CanvasProps["camera"];
  intensity?: number;
  /** Let the camera gently follow the pointer for depth (desktop only). */
  mouseParallax?: boolean;
  /** Provide your own lights (skips the default 4-light rig). */
  lights?: boolean;
  /** Optional post-processing composer rendered inside the Canvas. */
  composer?: ReactNode;
  /** Quality tier — "hero" raises dpr for the flagship scene. */
  tier?: "default" | "hero";
  /** Match the lightweight loading art to the semantic scene. */
  fallbackKind?: VisualPlaceholderKind;
};

/** Keep a WebGL/context error contained to this scene instead of the page. */
class SceneBoundary extends Component<{ children: ReactNode; onError?: () => void }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(error: unknown) {
    console.warn("[Scene3D] scene failed to render:", error);
    this.props.onError?.();
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

/** Signals readiness from inside R3F, after the first scene frame has been scheduled. */
function FirstFrameReady({ onReady }: { onReady: () => void }) {
  const marked = useRef(false);
  const invalidate = useThree((state) => state.invalidate);
  useEffect(() => {
    // Even an off-screen demand-rendered canvas gets one frame to signal readiness.
    invalidate();
  }, [invalidate]);
  useFrame(() => {
    if (marked.current) return;
    marked.current = true;
    onReady();
  });
  return null;
}

/** Subtle pointer-driven camera drift + slow breathing. Disabled under reduced-motion. */
function CameraParallax({ enabled, baseZ = 6, strength = 1 }: { enabled: boolean; baseZ?: number; strength?: number }) {
  const { camera } = useThree();
  const target = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (!enabled) return;
    const onPointerMove = (event: PointerEvent) => {
      target.current.x = (event.clientX / Math.max(1, window.innerWidth)) * 2 - 1;
      target.current.y = 1 - (event.clientY / Math.max(1, window.innerHeight)) * 2;
    };
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    return () => window.removeEventListener("pointermove", onPointerMove);
  }, [enabled]);

  useFrame((state, delta) => {
    if (!enabled) return;
    const t = 1 - Math.pow(0.001, Math.min(delta, 0.04)); // frame-rate independent ease
    const x = target.current.x * 0.72 * strength;
    const y = target.current.y * 0.38 * strength;
    camera.position.x += (x - camera.position.x) * t * 0.42;
    camera.position.y += (y - camera.position.y) * t * 0.42;
    camera.position.z = baseZ + Math.sin(state.clock.elapsedTime * 0.42) * 0.055;
    camera.lookAt(0, 0, 0);
  });
  return null;
}

export default function Scene3D({
  children,
  className,
  camera = { position: [0, 0, 6], fov: 42 },
  intensity = 1,
  mouseParallax = true,
  lights = true,
  composer,
  tier = "default",
  fallbackKind = "abstract",
}: Props) {
  const reduce = useReducedMotion();
  const hostRef = useRef<HTMLDivElement>(null);
  // Start with the safe tier so first hydration on a phone never spins up every canvas.
  const [mobile, setMobile] = useState(true);
  // Start with demand rendering: many scenes can mount together during route preloading.
  // A single explicit invalidate still paints the first frame and signals readiness.
  const [inView, setInView] = useState(false);
  const readyFrameRef = useRef<number>(0);

  useEffect(() => {
    setMobile(window.matchMedia("(max-width: 767px)").matches);
  }, []);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    if (!("IntersectionObserver" in window)) {
      setInView(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { rootMargin: "140px 0px", threshold: 0.01 },
    );
    observer.observe(host);
    return () => observer.disconnect();
  }, []);

  useEffect(() => () => {
    if (readyFrameRef.current) window.cancelAnimationFrame(readyFrameRef.current);
  }, []);

  const dispatchReady = (status: "ready" | "error") => {
    if (typeof window === "undefined") return;
    const host = hostRef.current;
    const visualRoot = host?.closest<HTMLElement>("[data-visual-instance]");
    const instanceId = visualRoot?.dataset.visualInstance;
    // CSS expects "true" for a successfully rendered Canvas and "error" for fallback mode.
    // The route-transition event still uses the semantic "ready" / "error" statuses.
    if (host) host.dataset.sceneReady = status === "ready" ? "true" : "error";
    if (visualRoot) visualRoot.dataset.visualReady = status;
    if (readyFrameRef.current) window.cancelAnimationFrame(readyFrameRef.current);
    const routeAtCreation = window.location.pathname;
    readyFrameRef.current = window.requestAnimationFrame(() => {
      readyFrameRef.current = 0;
      window.dispatchEvent(new CustomEvent("archai:visual-ready", {
        detail: { route: routeAtCreation, instanceId, status },
      }));
    });
  };

  const markCanvasReady = () => dispatchReady("ready");

  // The planetary artwork is wider than a phone viewport; widen the camera framing on small screens.
  const cameraRecord = camera as { position?: [number, number, number]; fov?: number };
  const effectiveCamera = mobile && tier === "hero" && cameraRecord && typeof cameraRecord === "object" && !Array.isArray(camera)
    ? ({ ...cameraRecord, fov: Math.max(cameraRecord.fov ?? 42, 51) } as CanvasProps["camera"])
    : camera;

  // Several independent WebGL canvases can coexist on content-rich pages.
  // Cap pixel ratio to protect frame time and GPU memory while retaining crispness.
  const dpr: [number, number] = mobile
    ? tier === "hero"
      ? [1, 1.15]
      : [1, 1]
    : tier === "hero"
      ? [1, 1.35]
      : [1, 1.22];

  const baseZ = cameraRecord?.position?.[2] ?? 6;

  // Only the flagship scene keeps animating continuously on phones. Other 3D scenes
  // paint one high-quality frame when near the viewport and preserve CPU/GPU for scrolling.
  const shouldAnimate = !reduce && inView && (!mobile || tier === "hero");

  return (
    <div ref={hostRef} className={`scene-canvas ${className ?? ""}`} style={{ width: "100%", height: "100%" }}>
      <div className="scene-fallback-art" aria-hidden="true">
        <VisualPlaceholder kind={fallbackKind} />
      </div>
      <SceneBoundary onError={() => dispatchReady("error")}>
        {/* Off-screen scenes stay mounted but stop per-frame work until visible. */}
        <Canvas
          camera={effectiveCamera}
          dpr={dpr}
          frameloop={shouldAnimate ? "always" : "demand"}
          gl={{
            alpha: true,
            antialias: !mobile && tier === "hero",
            powerPreference: tier === "hero" ? "high-performance" : "low-power",
            preserveDrawingBuffer: false,
          }}
          style={{ pointerEvents: "none", width: "100%", height: "100%" }}
        >
          {lights && (
            <>
              <ambientLight intensity={0.75 * intensity} />
              <directionalLight position={[4, 4, 4]} intensity={1.4 * intensity} color="#ad97ff" />
              <pointLight position={[-4, -3, 2]} intensity={1.25 * intensity} color="#4ce2d0" />
              {tier === "hero" ? <pointLight position={[3, 3, -3]} intensity={0.72 * intensity} color="#ff6b9d" /> : null}
            </>
          )}
          <CameraParallax enabled={mouseParallax && !reduce && !mobile} baseZ={baseZ} strength={tier === "hero" ? 1 : 0.6} />
          <Suspense fallback={null}>
            <>{children}<FirstFrameReady onReady={markCanvasReady} /></>
          </Suspense>
          {!reduce && composer}
        </Canvas>
      </SceneBoundary>
    </div>
  );
}