"use client";

import { useRef } from "react";
import { RoundedBox } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import useReducedMotionPreference from "@/hooks/useReducedMotionPreference";
import type { Group, Mesh } from "three";
import Scene3D from "./Scene3D";

/** A tiny abstract software workspace: layered product surfaces, not project-specific data or fake metrics. */
function InterfacePanel({
  position,
  rotation = [0, 0, 0],
  scale = 1,
  variant = "secondary",
}: {
  position: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
  variant?: "primary" | "secondary";
}) {
  const primary = variant === "primary";
  const w = primary ? 1.46 : 1.12;
  const h = primary ? 1.06 : 0.78;
  return (
    <group position={position} rotation={rotation} scale={scale}>
      <RoundedBox args={[w, h, 0.075]} radius={0.075} smoothness={5}>
        <meshPhysicalMaterial color="#101a31" metalness={0.68} roughness={0.24} clearcoat={0.8} clearcoatRoughness={0.2} />
      </RoundedBox>
      <RoundedBox args={[w - 0.085, h - 0.085, 0.012]} radius={0.045} smoothness={4} position={[0, 0, 0.045]}>
        <meshBasicMaterial color="#071123" />
      </RoundedBox>

      {/* Non-semantic UI composition: no project names, numeric claims or hard-coded data. */}
      <mesh position={[-w * 0.32, h * 0.32, 0.056]}>
        <planeGeometry args={[w * 0.24, 0.055]} />
        <meshBasicMaterial color="#64e0d0" transparent opacity={0.84} />
      </mesh>
      <mesh position={[w * 0.27, h * 0.32, 0.056]}>
        <planeGeometry args={[w * 0.18, 0.025]} />
        <meshBasicMaterial color="#9a9fc1" transparent opacity={0.48} />
      </mesh>

      {primary ? (
        <>
          <RoundedBox args={[w * 0.25, h * 0.53, 0.018]} radius={0.025} smoothness={3} position={[-w * 0.33, -h * 0.09, 0.057]}>
            <meshBasicMaterial color="#182747" />
          </RoundedBox>
          <mesh position={[w * 0.14, h * 0.12, 0.058]}>
            <planeGeometry args={[w * 0.48, h * 0.18]} />
            <meshBasicMaterial color="#28375a" transparent opacity={0.88} />
          </mesh>
          <mesh position={[w * 0.1, -h * 0.16, 0.058]}>
            <planeGeometry args={[w * 0.4, 0.018]} />
            <meshBasicMaterial color="#8898bd" transparent opacity={0.5} />
          </mesh>
          <mesh position={[w * 0.05, -h * 0.25, 0.058]}>
            <planeGeometry args={[w * 0.3, 0.018]} />
            <meshBasicMaterial color="#8898bd" transparent opacity={0.28} />
          </mesh>
          <RoundedBox args={[w * 0.25, h * 0.24, 0.016]} radius={0.025} smoothness={3} position={[w * 0.32, -h * 0.27, 0.06]}>
            <meshBasicMaterial color="#263b50" />
          </RoundedBox>
        </>
      ) : (
        <>
          <mesh position={[-w * 0.08, h * 0.02, 0.058]}>
            <planeGeometry args={[w * 0.68, h * 0.22]} />
            <meshBasicMaterial color="#1b2e4b" />
          </mesh>
          <mesh position={[0, -h * 0.28, 0.058]}>
            <planeGeometry args={[w * 0.58, 0.025]} />
            <meshBasicMaterial color="#8b9cbc" transparent opacity={0.35} />
          </mesh>
        </>
      )}
    </group>
  );
}

function ProjectOrbitSystem({ reducedMotion }: { reducedMotion: boolean }) {
  const assembly = useRef<Group>(null);
  const orbitA = useRef<Group>(null);
  const orbitB = useRef<Group>(null);
  const accent = useRef<Mesh>(null);

  useFrame((state, delta) => {
    if (reducedMotion) return;
    const step = Math.min(delta, 0.035);
    if (assembly.current) {
      assembly.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.14) * 0.07;
      assembly.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.19) * 0.035;
      assembly.current.position.y = Math.sin(state.clock.elapsedTime * 0.45) * 0.045;
    }
    if (orbitA.current) orbitA.current.rotation.z += step * 0.06;
    if (orbitB.current) orbitB.current.rotation.z -= step * 0.035;
    if (accent.current) {
      const glow = 0.8 + (Math.sin(state.clock.elapsedTime * 1.1) + 1) * 0.22;
      (accent.current.material as { emissiveIntensity?: number }).emissiveIntensity = glow;
    }
  });

  return (
    <group scale={0.98} rotation={[0.02, -0.12, 0.015]}>
      <group ref={orbitA} rotation={[0.72, -0.28, 0.12]}>
        <mesh>
          <torusGeometry args={[1.95, 0.006, 6, 144]} />
          <meshBasicMaterial color="#8c86ed" transparent opacity={0.32} />
        </mesh>
        <mesh position={[1.95, 0, 0]}>
          <sphereGeometry args={[0.045, 16, 16]} />
          <meshBasicMaterial color="#c5c0ff" toneMapped={false} />
        </mesh>
      </group>
      <group ref={orbitB} rotation={[-0.44, 0.5, -0.62]}>
        <mesh>
          <torusGeometry args={[1.72, 0.004, 6, 132]} />
          <meshBasicMaterial color="#5dd9cb" transparent opacity={0.24} />
        </mesh>
        <mesh position={[-1.72, 0, 0]}>
          <sphereGeometry args={[0.05, 16, 16]} />
          <meshBasicMaterial color="#91fff0" toneMapped={false} />
        </mesh>
      </group>

      <group ref={assembly}>
        <InterfacePanel position={[-1.04, 0.14, -0.48]} rotation={[0.08, 0.48, -0.1]} scale={0.76} />
        <InterfacePanel position={[1.05, -0.17, -0.55]} rotation={[-0.04, -0.43, 0.1]} scale={0.72} />
        <InterfacePanel position={[0, 0, 0.18]} rotation={[0, -0.04, 0]} scale={1.02} variant="primary" />
        <mesh ref={accent} position={[0.62, 0.48, 0.36]}>
          <sphereGeometry args={[0.055, 18, 18]} />
          <meshStandardMaterial color="#c0fff5" emissive="#4ce2d0" emissiveIntensity={0.9} metalness={0.4} roughness={0.18} />
        </mesh>
      </group>
    </group>
  );
}

export default function ProjectOrbit({ className }: { className?: string }) {
  const reducedMotion = Boolean(useReducedMotionPreference());
  return (
    <Scene3D fallbackKind="project" className={className} camera={{ position: [0, 0, 6.3], fov: 42 }} intensity={0.88} tier="hero" mouseParallax>
      <ambientLight intensity={0.56} />
      <directionalLight position={[3.4, 4.2, 4.5]} intensity={1.5} color="#e5edff" />
      <pointLight position={[-2.8, -1.2, 2.7]} intensity={1.05} color="#4ce2d0" />
      <pointLight position={[2.2, 1.8, -2.4]} intensity={0.52} color="#8c7cff" />
      <ProjectOrbitSystem reducedMotion={reducedMotion} />
    </Scene3D>
  );
}
