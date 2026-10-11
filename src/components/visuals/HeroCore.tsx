"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import type { Group, Mesh } from "three";
import Scene3D from "./Scene3D";
import { useScrollProgressRef } from "./scene-system";

const VIOLET = "#8f7aff";
const VIOLET_SOFT = "#c8c0ff";
const MINT = "#54e5d4";
const DARK = "#080c1c";

function Ring({ radius, tilt, speed, opacity = 0.5, color = VIOLET_SOFT }: {
  radius: number;
  tilt: [number, number, number];
  speed: number;
  opacity?: number;
  color?: string;
}) {
  const ref = useRef<Mesh>(null);
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.z += delta * speed;
  });
  return (
    <mesh ref={ref} rotation={tilt}>
      <torusGeometry args={[radius, 0.012, 10, 180]} />
      <meshBasicMaterial color={color} transparent opacity={opacity} toneMapped={false} />
    </mesh>
  );
}

function OrbitModule({ index, radius }: { index: number; radius: number }) {
  const ref = useRef<Group>(null);
  const seed = index * Math.PI * 2 / 6;
  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime;
    const a = seed + t * 0.13 * (index % 2 ? -1 : 1);
    const vertical = Math.sin(t * 0.38 + seed) * 0.055;
    ref.current.position.set(
      Math.cos(a) * radius,
      Math.sin(a * 1.5 + seed) * 0.12 + vertical,
      Math.sin(a) * radius * 0.62,
    );
    ref.current.rotation.y = -a + Math.PI / 2;
    ref.current.rotation.x = Math.sin(t * 0.3 + seed) * 0.06;
  });

  return (
    <group ref={ref}>
      <RoundedBox args={[0.42, 0.25, 0.12]} radius={0.035} smoothness={4}>
        <meshPhysicalMaterial
          color={DARK}
          metalness={0.92}
          roughness={0.2}
          clearcoat={1}
          clearcoatRoughness={0.08}
          emissive={index % 2 ? MINT : VIOLET}
          emissiveIntensity={0.18}
        />
      </RoundedBox>
      <mesh position={[0, 0, 0.07]}>
        <boxGeometry args={[0.20, 0.012, 0.008]} />
        <meshBasicMaterial color={index % 2 ? MINT : VIOLET_SOFT} toneMapped={false} />
      </mesh>
      <mesh position={[0.13, 0, 0.071]}>
        <sphereGeometry args={[0.018, 12, 12]} />
        <meshBasicMaterial color={MINT} toneMapped={false} />
      </mesh>
    </group>
  );
}

function HeroSculpture() {
  const root = useRef<Group>(null);
  const core = useRef<Mesh>(null);
  const shell = useRef<Mesh>(null);
  const inner = useRef<Mesh>(null);
  const { progress, target } = useScrollProgressRef();
  const modules = useMemo(() => Array.from({ length: 6 }, (_, i) => i), []);

  useFrame((state, delta) => {
    if (!root.current) return;
    progress.current += (target.current - progress.current) * (1 - Math.pow(0.0015, delta));
    const p = progress.current;
    const t = state.clock.elapsedTime;

    // The hero remains visually anchored. Scroll changes its viewing angle, not its location.
    root.current.rotation.y += delta * 0.035;
    root.current.rotation.y += ((p - 0.5) * 0.22 - root.current.rotation.y * 0.015) * delta;
    root.current.rotation.x = THREE.MathUtils.lerp(root.current.rotation.x, Math.sin(p * Math.PI) * 0.055, 0.035);
    root.current.position.y = THREE.MathUtils.lerp(root.current.position.y, Math.sin(t * 0.32) * 0.035 + Math.sin(p * Math.PI) * 0.08, 0.035);
    root.current.position.x = THREE.MathUtils.lerp(root.current.position.x, Math.sin(p * Math.PI * 2) * 0.08, 0.035);

    if (core.current) {
      core.current.rotation.x += delta * 0.11;
      core.current.rotation.y -= delta * 0.17;
      core.current.scale.setScalar(1 + Math.sin(t * 0.75) * 0.018);
    }
    if (inner.current) {
      inner.current.rotation.x -= delta * 0.22;
      inner.current.rotation.z += delta * 0.15;
    }
    if (shell.current) {
      shell.current.rotation.y += delta * 0.07;
      shell.current.rotation.z -= delta * 0.045;
    }
  });

  return (
    <group ref={root} scale={1.12}>
      {/* Soft field behind the sculpture gives it separation without a decorative grid. */}
      <mesh position={[0, 0, -0.9]} scale={3.4}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshBasicMaterial color={"#6556ff"} transparent opacity={0.035} depthWrite={false} />
      </mesh>

      {/* Main engineered core */}
      <mesh ref={core}>
        <icosahedronGeometry args={[0.82, 3]} />
        <meshPhysicalMaterial
          color={VIOLET}
          metalness={0.82}
          roughness={0.16}
          clearcoat={1}
          clearcoatRoughness={0.06}
          emissive={"#34247d"}
          emissiveIntensity={0.25}
        />
      </mesh>

      {/* Inner glass energy volume */}
      <mesh ref={inner} scale={0.62}>
        <octahedronGeometry args={[0.92, 2]} />
        <meshPhysicalMaterial
          color={MINT}
          metalness={0.15}
          roughness={0.08}
          transmission={0.22}
          transparent
          opacity={0.34}
          emissive={MINT}
          emissiveIntensity={0.35}
        />
      </mesh>

      {/* Fine technical shell */}
      <mesh ref={shell} scale={1.08}>
        <icosahedronGeometry args={[0.82, 2]} />
        <meshBasicMaterial color={VIOLET_SOFT} wireframe transparent opacity={0.13} toneMapped={false} />
      </mesh>

      {/* Three deliberate orbital planes — each has a different depth axis. */}
      <Ring radius={1.16} tilt={[0.95, 0.15, 0.12]} speed={0.22} opacity={0.58} color={MINT} />
      <Ring radius={1.48} tilt={[0.28, -0.72, 0.42]} speed={-0.14} opacity={0.42} color={VIOLET_SOFT} />
      <Ring radius={1.82} tilt={[0.62, 0.28, -0.55]} speed={0.08} opacity={0.24} color={VIOLET_SOFT} />

      {modules.map((index) => <OrbitModule key={index} index={index} radius={1.52} />)}

      {/* Tiny axis markers add precision without becoming a UI gimmick. */}
      <mesh position={[0, 1.45, 0]}>
        <sphereGeometry args={[0.026, 12, 12]} />
        <meshBasicMaterial color={MINT} toneMapped={false} />
      </mesh>
      <mesh position={[0, -1.45, 0]}>
        <sphereGeometry args={[0.018, 12, 12]} />
        <meshBasicMaterial color={VIOLET_SOFT} toneMapped={false} />
      </mesh>
    </group>
  );
}

export default function HeroCore({ className }: { className?: string }) {
  return (
    <Scene3D
      className={className}
      camera={{ position: [0, 0, 6.4], fov: 37 }}
      lights={false}
      tier="hero"
      mouseParallax
    >
      <ambientLight intensity={0.52} />
      <directionalLight position={[4, 5, 6]} intensity={2.2} color="#f6f3ff" />
      <pointLight position={[-3.5, 1, 2.5]} intensity={1.4} color={VIOLET} />
      <pointLight position={[3, -1.5, 2]} intensity={1.15} color={MINT} />
      <HeroSculpture />
    </Scene3D>
  );
}
