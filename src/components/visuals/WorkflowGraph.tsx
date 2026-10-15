"use client";
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Line, Float } from "@react-three/drei";
import * as THREE from "three";
import type { Group, Mesh } from "three";
import Scene3D from "./Scene3D";
import { PALETTE } from "./scene-utils";

/** Six process stages in a ring, with a token hopping stage → stage. */
const STAGES = 6;
const RADIUS = 1.9;
const COLORS = [
  PALETTE.violet,
  PALETTE.mint,
  PALETTE.violetSoft,
  PALETTE.mintSoft,
  PALETTE.rose,
  PALETTE.violetDeep,
];

const positions = Array.from({ length: STAGES }).map((_, i) => {
  const a = (i / STAGES) * Math.PI * 2 - Math.PI / 2;
  return new THREE.Vector3(Math.cos(a) * RADIUS, Math.sin(a) * RADIUS, 0);
});

function StageNode({ index }: { index: number }) {
  const ref = useRef<Mesh>(null);
  const ring = useRef<Mesh>(null);
  const color = COLORS[index % COLORS.length];
  useFrame((state) => {
    if (!ref.current) return;
    /* the active stage is whichever the token is nearest */
    const cycle = (state.clock.elapsedTime * 0.6) % STAGES;
    const dist = Math.min(
      Math.abs(cycle - index),
      STAGES - Math.abs(cycle - index),
    );
    const lit = Math.max(0, 1 - dist * 1.6);
    const mat = ref.current.material as unknown as {
      emissiveIntensity: number;
    };
    mat.emissiveIntensity = 0.4 + lit * 2.6;
    ref.current.scale.setScalar(0.9 + lit * 0.35);
    if (ring.current) {
      const rm = ring.current.material as unknown as { opacity: number };
      rm.opacity = 0.15 + lit * 0.7;
      ring.current.scale.setScalar(1 + lit * 0.5);
    }
  });
  return (
    <Float speed={1} rotationIntensity={0.1} floatIntensity={0.4}>
      <group position={positions[index]}>
        <mesh ref={ref}>
          <icosahedronGeometry args={[0.3, 2]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={0.5}
            metalness={0.85}
            roughness={0.15}
          />
        </mesh>
        <mesh ref={ring}>
          <torusGeometry args={[0.46, 0.012, 12, 64]} />
          <meshBasicMaterial
            color={color}
            transparent
            opacity={0.3}
            toneMapped={false}
          />
        </mesh>
      </group>
    </Float>
  );
}

function Token() {
  const ref = useRef<Mesh>(null);
  useFrame((state) => {
    if (!ref.current) return;
    const cycle = (state.clock.elapsedTime * 0.6) % STAGES;
    const i = Math.floor(cycle);
    const f = cycle - i;
    const a = positions[i % STAGES];
    const b = positions[(i + 1) % STAGES];
    const ease = f < 0.5 ? 2 * f * f : 1 - Math.pow(-2 * f + 2, 2) / 2;
    ref.current.position.lerpVectors(a, b, ease);
    ref.current.position.z = Math.sin(ease * Math.PI) * 0.5;
  });
  return (
    <mesh ref={ref}>
      <sphereGeometry args={[0.11, 20, 20]} />
      <meshStandardMaterial
        color={PALETTE.mintSoft}
        emissive={PALETTE.mintSoft}
        emissiveIntensity={3}
        toneMapped={false}
      />
    </mesh>
  );
}

/** Scene-level sway — must live inside <Canvas>. */
function Spinner({ children }: { children: React.ReactNode }) {
  const group = useRef<Group>(null);
  useFrame((state, delta) => {
    if (!group.current) return;
    group.current.rotation.z += delta * 0.05;
    group.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.25) * 0.35;
  });
  return <group ref={group}>{children}</group>;
}

export default function WorkflowGraph({ className }: { className?: string }) {
  const edges = useMemo(
    () =>
      Array.from({ length: STAGES }).map((_, i) => ({
        pts: [positions[i], positions[(i + 1) % STAGES]].map(
          (v) => [v.x, v.y, v.z] as [number, number, number],
        ),
        color: COLORS[i % COLORS.length],
      })),
    [],
  );

  return (
    <Scene3D fallbackKind="workflow" className={className} camera={{ position: [0, 0, 6.8], fov: 45 }}>
      <Spinner>
        {/* edges */}
        {edges.map((e, i) => (
          <Line
            key={i}
            points={e.pts}
            color={e.color}
            lineWidth={2}
            transparent
            opacity={0.45}
          />
        ))}
        {/* stage nodes */}
        {positions.map((_, i) => (
          <StageNode key={i} index={i} />
        ))}
        <Token />
        {/* hub */}
        <mesh>
          <icosahedronGeometry args={[0.35, 1]} />
          <meshStandardMaterial
            color={PALETTE.ink}
            emissive={PALETTE.violet}
            emissiveIntensity={0.8}
            metalness={0.9}
            roughness={0.2}
          />
        </mesh>
      </Spinner>
    </Scene3D>
  );
}
