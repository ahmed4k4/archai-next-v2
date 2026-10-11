"use client";
import { Canvas, type CanvasProps, useThree, useFrame } from "@react-three/fiber";
import { Preload, AdaptiveDpr, AdaptiveEvents } from "@react-three/drei";
import { Component, Suspense, useEffect, useState, useRef, type ReactNode } from "react";
import * as THREE from "three";
import { useScrollProgressRef } from "./scene-system";
import { useReducedMotion } from "framer-motion";

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
};

/** Keep a WebGL/context error contained to this scene instead of the page. */
class SceneBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(error: unknown) {
    console.warn("[Scene3D] scene failed to render:", error);
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}


/** Subtle pointer-driven camera drift + slow breathing. Disabled under reduced-motion. */
function CameraParallax({ enabled, baseZ = 6, strength = 1 }: { enabled: boolean; baseZ?: number; strength?: number }) {
  const { camera } = useThree();
  const { progress, target } = useScrollProgressRef();
  const baseX = useRef(camera.position.x);
  const baseY = useRef(camera.position.y);
  useFrame((state, delta) => {
    if (!enabled) return;
    const t = 1 - Math.pow(0.001, delta);
    progress.current += (target.current - progress.current) * (1 - Math.pow(0.001, delta));
    const p = progress.current;
    const x = baseX.current + state.pointer.x * 0.9 * strength + Math.sin(p * Math.PI * 2) * 0.22 * strength;
    const y = baseY.current + state.pointer.y * 0.5 * strength + Math.cos(p * Math.PI * 2) * 0.16 * strength;
    camera.position.x += (x - camera.position.x) * t * 0.6;
    camera.position.y += (y - camera.position.y) * t * 0.6;
    camera.position.z = baseZ + Math.sin(state.clock.elapsedTime * 0.5) * 0.16 + Math.sin(p * Math.PI * 2) * 0.55 * strength;
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
}: Props) {
  const reduce = useReducedMotion();
  const [mobile, setMobile] = useState(false);
  const [lowPower, setLowPower] = useState(false);

  useEffect(() => {
    setMobile(window.matchMedia("(max-width: 767px)").matches);
    const nav = navigator as Navigator & { deviceMemory?: number };
    setLowPower((nav.hardwareConcurrency || 8) <= 4 || (nav.deviceMemory || 8) <= 4);
  }, []);

  const dpr: [number, number] = mobile || lowPower
    ? tier === "hero" && !lowPower
      ? [1, 1.35]
      : [1, 1]
    : tier === "hero"
      ? [1, 1.75]
      : [1, 1.35];

  const baseZ = (camera as { position?: [number, number, number] })?.position?.[2] ?? 6;

  /* frameloop="demand" yields a frozen frame under reduced-motion. */
  return (
    <div className={className} style={{ width: "100%", height: "100%" }}>
      <SceneBoundary>
        <Canvas
          camera={camera}
          dpr={dpr}
          frameloop={reduce ? "demand" : "always"}
          gl={{ alpha: true, antialias: !mobile && !lowPower, powerPreference: mobile || lowPower ? "low-power" : "high-performance", preserveDrawingBuffer: false }}
          style={{ pointerEvents: "none", width: "100%", height: "100%" }}
        >
          {lights && (
            <>
              <ambientLight intensity={0.75 * intensity} />
              <directionalLight position={[4, 4, 4]} intensity={1.4 * intensity} color="#ad97ff" />
              <pointLight position={[-4, -3, 2]} intensity={1.6 * intensity} color="#4ce2d0" />
              <pointLight position={[3, 3, -3]} intensity={1.1 * intensity} color="#ff6b9d" />
            </>
          )}
          <CameraParallax enabled={mouseParallax && !reduce && !mobile && !lowPower} baseZ={baseZ} strength={tier === "hero" ? 1 : 0.6} />
          <Suspense fallback={null}>{children}</Suspense>
          {!reduce && !mobile && !lowPower && composer}
          <Preload all />
          <AdaptiveDpr pixelated />
          <AdaptiveEvents />
        </Canvas>
      </SceneBoundary>
    </div>
  );
}