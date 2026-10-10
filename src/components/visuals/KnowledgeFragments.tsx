"use client";
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Float, Sparkles, Line } from "@react-three/drei";
import * as THREE from "three";
import type { Mesh, Group } from "three";
import Scene3D from "./Scene3D";
import { PALETTE, spherePoints } from "./scene-utils";

/** Crystal fragments — one per article — drifting in a golden web. */
const NODES = spherePoints(9, 2.2);
const COLORS = [
  PALETTE.gold,
  PALETTE.violetSoft,
  PALETTE.violet,
  PALETTE.gold,
  PALETTE.mint,
  PALETTE.violetSoft,
  PALETTE.violet,
  PALETTE.mint,
  PALETTE.gold,
];

function Fragment({
  position,
  color,
  index,
}: {
  position: [number, number, number];
  color: string;
  index: number;
}) {
  const ref = useRef<Mesh>(null);
  useFrame((state, delta) => {
    if (!ref.current) return;
    ref.current.rotation.x += delta * (0.25 + index * 0.02);
    ref.current.rotation.y += delta * (0.35 + index * 0.015);
    const pulse = 1 + Math.sin(state.clock.elapsedTime * 1.5 + index) * 0.1;
    ref.current.scale.setScalar(pulse);
  });
  return (
    <Float speed={1 + index * 0.1} rotationIntensity={0.5} floatIntensity={1.1}>
      <mesh ref={ref} position={position}>
        <octahedronGeometry args={[0.32 + (index % 3) * 0.08, 0]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.55}
          metalness={0.7}
          roughness={0.12}
          transparent
          opacity={0.92}
          flatShading
        />
      </mesh>
    </Float>
  );
}

/** Scene-level drift — must live inside <Canvas>. */
function Spinner({ children }: { children: React.ReactNode }) {
  const group = useRef<Group>(null);
  useFrame((state, delta) => {
    if (!group.current) return;
    group.current.rotation.y += delta * 0.07;
    group.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.18) * 0.12;
  });
  return <group ref={group}>{children}</group>;
}

export default function KnowledgeFragments({
  className,
}: {
  className?: string;
}) {
  /* thin web linking neighbours */
  const web = NODES.map((_, i) => {
    const a = NODES[i];
    const b = NODES[(i + 2) % NODES.length];
    return [a, b] as [[number, number, number], [number, number, number]];
  });

  return (
    <Scene3D className={className} camera={{ position: [0, 0, 7.2], fov: 46 }}>
      <Spinner>
        {web.map(([a, b], i) => (
          <Line
            key={i}
            points={[new THREE.Vector3(...a), new THREE.Vector3(...b)]}
            color={PALETTE.gold}
            lineWidth={1}
            transparent
            opacity={0.16}
          />
        ))}
        {NODES.map((n, i) => (
          <Fragment
            key={i}
            position={n}
            color={COLORS[i % COLORS.length]}
            index={i}
          />
        ))}
        <Sparkles
          count={90}
          scale={7}
          size={2.4}
          speed={0.4}
          color={PALETTE.gold}
          opacity={0.6}
        />
      </Spinner>
    </Scene3D>
  );
}
