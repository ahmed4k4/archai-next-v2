"use client";
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import type { Mesh } from "three";
import Scene3D from "./Scene3D";
import { PALETTE, mulberry32 } from "./scene-utils";

/** A pulsing beacon emitting expanding rings, with signals converging inward. */
function Beacon() {
  const ref = useRef<Mesh>(null);
  useFrame((state, delta) => {
    if (!ref.current) return;
    ref.current.rotation.y += delta * 0.3;
    const p = 1 + Math.sin(state.clock.elapsedTime * 2.2) * 0.12;
    ref.current.scale.setScalar(p);
  });
  return (
    <mesh ref={ref}>
      <icosahedronGeometry args={[0.7, 3]} />
      <meshStandardMaterial
        color={PALETTE.mint}
        emissive={PALETTE.mint}
        emissiveIntensity={1.6}
        metalness={0.8}
        roughness={0.15}
      />
    </mesh>
  );
}

function Wave({ delay, color }: { delay: number; color: string }) {
  const ref = useRef<Mesh>(null);
  useFrame((state) => {
    if (!ref.current) return;
    const t = (state.clock.elapsedTime * 0.35 + delay) % 1;
    const s = 0.6 + t * 4.2;
    ref.current.scale.setScalar(s);
    const mat = ref.current.material as unknown as { opacity: number };
    mat.opacity = (1 - t) * 0.5;
  });
  return (
    <mesh ref={ref} rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[0.85, 0.92, 64]} />
      <meshBasicMaterial
        color={color}
        transparent
        opacity={0.4}
        side={2}
        toneMapped={false}
      />
    </mesh>
  );
}

/** Incoming signals drifting toward the core. */
function IncomingSignals() {
  const ref = useRef<Mesh[]>([]);
  const rng = useRef(mulberry32(7));
  const seeds = useRef(
    Array.from({ length: 14 }).map(() => ({
      theta: rng.current() * Math.PI * 2,
      phi: Math.acos(2 * rng.current() - 1),
      speed: 0.25 + rng.current() * 0.35,
      offset: rng.current(),
    })),
  );
  useFrame((state) => {
    seeds.current.forEach((s, i) => {
      const mesh = ref.current[i];
      if (!mesh) return;
      const t = (state.clock.elapsedTime * s.speed + s.offset) % 1;
      const r = 4 - t * 3.3; // travel inward
      mesh.position.set(
        Math.sin(s.phi) * Math.cos(s.theta) * r,
        Math.cos(s.phi) * r,
        Math.sin(s.phi) * Math.sin(s.theta) * r,
      );
      const mat = mesh.material as unknown as { opacity: number };
      mat.opacity = 0.15 + t * 0.8;
    });
  });
  return (
    <>
      {seeds.current.map((_, i) => (
        <mesh
          key={i}
          ref={(m) => {
            if (m) ref.current[i] = m;
          }}
        >
          <sphereGeometry args={[0.05, 10, 10]} />
          <meshBasicMaterial
            color={PALETTE.violetSoft}
            transparent
            opacity={0.5}
            toneMapped={false}
          />
        </mesh>
      ))}
    </>
  );
}

export default function SignalBeacon({ className }: { className?: string }) {
  return (
    <Scene3D
      className={className}
      camera={{ position: [0, 3.4, 6], fov: 48 }}
      intensity={1.05}
    >
      <Float speed={1.2} rotationIntensity={0.2} floatIntensity={0.5}>
        <Beacon />
      </Float>
      <Wave delay={0} color={PALETTE.mint} />
      <Wave delay={0.2} color={PALETTE.violetSoft} />
      <Wave delay={0.4} color={PALETTE.mintSoft} />
      <Wave delay={0.6} color={PALETTE.violet} />
      <Wave delay={0.8} color={PALETTE.mint} />
      <IncomingSignals />
    </Scene3D>
  );
}
