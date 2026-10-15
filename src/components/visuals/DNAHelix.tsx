"use client";
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Sparkles, Line } from "@react-three/drei";
import * as THREE from "three";
import type { Group, Mesh } from "three";
import Scene3D from "./Scene3D";
import { PALETTE } from "./scene-utils";

/** Double helix — the team & values strand, rising forever. */
const COUNT = 44;
const HEIGHT = 9;
const RADIUS = 1.25;

function Backbone({ offset, color }: { offset: number; color: string }) {
  const points = useMemo(() => {
    const pts: [number, number, number][] = [];
    for (let i = 0; i < COUNT; i++) {
      const y = (i / (COUNT - 1)) * HEIGHT - HEIGHT / 2;
      const a = i * 0.42 + offset;
      pts.push([Math.cos(a) * RADIUS, y, Math.sin(a) * RADIUS]);
    }
    return pts;
  }, [offset]);
  return (
    <Line
      points={points}
      color={color}
      lineWidth={1.6}
      transparent
      opacity={0.5}
    />
  );
}

function Rung({ index, group }: { index: number; group: Group | null }) {
  const ref = useRef<Mesh>(null);
  const y = (index / (COUNT - 1)) * HEIGHT - HEIGHT / 2;
  const a = index * 0.42;
  const x1 = Math.cos(a) * RADIUS;
  const z1 = Math.sin(a) * RADIUS;
  const x2 = Math.cos(a + Math.PI) * RADIUS;
  const z2 = Math.sin(a + Math.PI) * RADIUS;
  const len = Math.hypot(x2 - x1, z2 - z1);
  const mid: [number, number, number] = [(x1 + x2) / 2, y, (z1 + z2) / 2];
  const rotY = -Math.atan2(z2 - z1, x2 - x1);

  useFrame((state) => {
    if (!ref.current) return;
    const glow =
      (Math.sin(state.clock.elapsedTime * 1.2 + index * 0.35) + 1) / 2;
    const mat = ref.current.material as unknown as { opacity: number };
    mat.opacity = 0.2 + glow * 0.6;
    void group;
  });

  return (
    <mesh ref={ref} position={mid} rotation={[0, rotY, Math.PI / 2]}>
      <cylinderGeometry args={[0.012, 0.012, len, 6]} />
      <meshBasicMaterial
        color={index % 2 === 0 ? PALETTE.mint : PALETTE.violetSoft}
        transparent
        opacity={0.35}
        toneMapped={false}
      />
    </mesh>
  );
}

function Nucleotide({ index }: { index: number }) {
  const ref = useRef<Mesh>(null);
  const y = (index / (COUNT - 1)) * HEIGHT - HEIGHT / 2;
  const a = index * 0.42;
  const isLeft = index % 2 === 0;
  useFrame((state) => {
    if (!ref.current) return;
    const glow =
      (Math.sin(state.clock.elapsedTime * 1.2 + index * 0.35) + 1) / 2;
    ref.current.scale.setScalar(0.7 + glow * 0.6);
  });
  return (
    <>
      <mesh
        ref={ref}
        position={[Math.cos(a) * RADIUS, y, Math.sin(a) * RADIUS]}
      >
        <sphereGeometry args={[0.13, 20, 20]} />
        <meshStandardMaterial
          color={isLeft ? PALETTE.violet : PALETTE.mint}
          emissive={isLeft ? PALETTE.violet : PALETTE.mint}
          emissiveIntensity={1.4}
          metalness={0.8}
          roughness={0.15}
          toneMapped={false}
        />
      </mesh>
      <mesh
        position={[
          Math.cos(a + Math.PI) * RADIUS,
          y,
          Math.sin(a + Math.PI) * RADIUS,
        ]}
      >
        <sphereGeometry args={[0.11, 20, 20]} />
        <meshStandardMaterial
          color={isLeft ? PALETTE.mint : PALETTE.violet}
          emissive={isLeft ? PALETTE.mint : PALETTE.violet}
          emissiveIntensity={1.4}
          metalness={0.8}
          roughness={0.15}
          toneMapped={false}
        />
      </mesh>
    </>
  );
}

/** Rising + spinning helix — must live inside <Canvas>. */
function Spinner({ children }: { children: React.ReactNode }) {
  const group = useRef<Group>(null);
  const phase = useRef(0);
  useFrame((_, delta) => {
    if (!group.current) return;
    phase.current = (phase.current + delta * 0.55) % (Math.PI * 2);
    /* rise forever, wrapping seamlessly */
    group.current.position.y =
      ((phase.current / (Math.PI * 2)) * (HEIGHT / COUNT)) % (HEIGHT / COUNT);
    group.current.rotation.y += delta * 0.25;
  });
  return <group ref={group}>{children}</group>;
}

export default function DNAHelix({ className }: { className?: string }) {
  return (
    <Scene3D fallbackKind="helix" className={className} camera={{ position: [0, 0, 7.5], fov: 46 }}>
      <Spinner>
        <Backbone offset={0} color={PALETTE.violet} />
        <Backbone offset={Math.PI} color={PALETTE.mint} />
        {Array.from({ length: COUNT }).map((_, i) => (
          <Rung key={`r${i}`} index={i} group={null} />
        ))}
        {Array.from({ length: COUNT }).map((_, i) => (
          <Nucleotide key={`n${i}`} index={i} />
        ))}
        <Sparkles
          count={80}
          scale={[5, 9, 5]}
          size={2}
          speed={0.3}
          color={PALETTE.mintSoft}
          opacity={0.65}
        />
      </Spinner>
    </Scene3D>
  );
}
