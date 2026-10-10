"use client";
import { useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { useReducedMotion } from "framer-motion";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import { PALETTE } from "../scene-system";

/** Shared backdrop canvas — subtle, non-interactive, cheap. */
export default function BackdropWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const reduce = useReducedMotion();
  const [mobile, setMobile] = useState(false);
  const [light, setLight] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const sync = () => {
      setMobile(mq.matches);
      setLight(document.documentElement.dataset.theme === "light");
    };
    sync();
    const onTheme = () => setLight(document.documentElement.dataset.theme === "light");
    window.addEventListener("archai:theme-change", onTheme);
    return () => window.removeEventListener("archai:theme-change", onTheme);
  }, []);

  return (
    <div className={`pointer-events-none fixed inset-0 z-0 ${light ? "opacity-35" : "opacity-55"}`}>
      <Canvas
        camera={{ position: [0, 0, 10], fov: 50 }}
        dpr={mobile ? [1, 1] : [1, 1.25]}
        frameloop={reduce ? "demand" : "always"}
        gl={{ alpha: true, antialias: false, powerPreference: "low-power" }}
        style={{ pointerEvents: "none", width: "100%", height: "100%" }}
      >
        <fog attach="fog" args={[light ? "#f7f9ff" : "#050812", 10, 30]} />
        <ambientLight intensity={0.55} />
        <pointLight
          position={[0, 0, 5]}
          intensity={1.2}
          color={PALETTE.violet.light}
        />
        {children}
        {!reduce && !mobile && (
          <EffectComposer multisampling={0}>
            <Bloom
              intensity={0.6}
              luminanceThreshold={0.4}
              luminanceSmoothing={0.5}
              mipmapBlur
            />
          </EffectComposer>
        )}
      </Canvas>
    </div>
  );
}
