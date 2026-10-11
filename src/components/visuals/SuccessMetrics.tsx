"use client";
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import type { Mesh, Group } from "three";
import Scene3D from "./Scene3D";
import { PALETTE } from "./scene-utils";

/** 8 metric columns that rise and fall like a live dashboard. */
const BARS = 8;
const COLORS = [
  PALETTE.violet,
  PALETTE.violetSoft,
  PALETTE.mint,
  PALETTE.mintSoft,
  PALETTE.violet,
  PALETTE.rose,
  PALETTE.mintSoft,
  PALETTE.violetSoft,
];

function Bar({ index, x }: { index: number; x: number }) {
  const ref = useRef<Mesh>(null);
  const base = 0.5 + (index % 4) * 0.35;
  useFrame((state) => {
    if (!ref.current) return;
    const wave =
      Math.sin(state.clock.elapsedTime * 1.1 + index * 0.7) * 0.5 + 0.5;
    const h = base + wave * 1.9;
    ref.current.scale.y = h;
    ref.current.position.y = h / 2 - 1.4;
    const mat = ref.current.material as unknown as {
      emissiveIntensity: number;
    };
    mat.emissiveIntensity = 0.4 + wave * 1.4;
  });
  return (
    <Float speed={0.8} rotationIntensity={0.05} floatIntensity={0.2}>
      <mesh ref={ref} position={[x, -0.5, 0]}>
        <boxGeometry args={[0.42, 1, 0.42]} />
        <meshStandardMaterial
          color={COLORS[index]}
          emissive={COLORS[index]}
          emissiveIntensity={0.6}
          metalness={0.75}
          roughness={0.2}
        />
      </mesh>
    </Float>
  );
}

function MetricOrb({ index, x }: { index: number; x: number }) {
  const ref = useRef<Mesh>(null);
  useFrame((state) => {
    if (!ref.current) return;
    const wave =
      Math.sin(state.clock.elapsedTime * 1.1 + index * 0.7) * 0.5 + 0.5;
    const h = 0.5 + (index % 4) * 0.35 + wave * 1.9;
    ref.current.position.y = h - 1.4 + 0.28;
  });
  return (
    <mesh ref={ref} position={[x, 0, 0]}>
      <sphereGeometry args={[0.13, 20, 20]} />
      <meshStandardMaterial
        color={COLORS[index]}
        emissive={COLORS[index]}
        emissiveIntensity={2.4}
        toneMapped={false}
      />
    </mesh>
  );
}

/** Soft floating platform — gives the metric bars depth without a distracting grid. */
function MetricPlatform() {
  const ref = useRef<Group>(null);
  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.16) * 0.06;
    ref.current.position.y = -1.48 + Math.sin(state.clock.elapsedTime * 0.32) * 0.04;
  });
  return (
    <group ref={ref}>
      <mesh rotation={[-Math.PI / 2.6, 0, 0]}>
        <cylinderGeometry args={[4.5, 4.8, 0.08, 64]} />
        <meshPhysicalMaterial color={PALETTE.violet} transparent opacity={0.11} metalness={0.7} roughness={0.28} />
      </mesh>
      <mesh rotation={[-Math.PI / 2.6, 0, 0]} position={[0, 0.05, 0]}>
        <torusGeometry args={[3.7, 0.018, 8, 96]} />
        <meshBasicMaterial color={PALETTE.mint} transparent opacity={0.3} toneMapped={false} />
      </mesh>
    </group>
  );
}

export default function SuccessMetrics({ className }: { className?: string }) {
  const xs = Array.from({ length: BARS }).map(
    (_, i) => (i - (BARS - 1) / 2) * 0.72,
  );
  return (
    <Scene3D
      className={className}
      camera={{ position: [0, 0.6, 7], fov: 46 }}
      mouseParallax={false}
    >
      <MetricPlatform />
      {xs.map((x, i) => (
        <Bar key={`b${i}`} index={i} x={x} />
      ))}
      {xs.map((x, i) => (
        <MetricOrb key={`o${i}`} index={i} x={x} />
      ))}
    </Scene3D>
  );
}
