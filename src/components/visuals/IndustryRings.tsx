"use client";
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Float, Sphere } from "@react-three/drei";
import type { Group, Mesh } from "three";
import Scene3D from "./Scene3D";
import { PALETTE } from "./scene-utils";

/** Industries as satellites orbiting a glowing aurora core. */
const RINGS = [
  { r: 1.5, color: PALETTE.violet, tilt: 1.2, speed: 0.9, moons: 3 },
  { r: 1.9, color: PALETTE.mint, tilt: 0.4, speed: -0.7, moons: 3 },
  { r: 2.3, color: PALETTE.violetSoft, tilt: 0.9, speed: 1.1, moons: 2 },
  { r: 2.7, color: PALETTE.mintSoft, tilt: 1.5, speed: -0.6, moons: 2 },
  { r: 3.1, color: PALETTE.rose, tilt: 0.2, speed: 0.8, moons: 2 },
];

function RingBand({
  radius,
  color,
  tilt,
  speed,
}: {
  radius: number;
  color: string;
  tilt: number;
  speed: number;
}) {
  const ref = useRef<Mesh>(null);
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.z += delta * 0.25 * speed;
  });
  return (
    <mesh ref={ref} rotation={[tilt, 0.15, 0]}>
      <torusGeometry args={[radius, 0.012, 16, 200]} />
      <meshBasicMaterial
        color={color}
        transparent
        opacity={0.4}
        toneMapped={false}
      />
    </mesh>
  );
}

/** A moon that brightens as it swings toward the camera. */
function Moon({
  radius,
  color,
  tilt,
  speed,
  phase,
  size,
}: {
  radius: number;
  color: string;
  tilt: number;
  speed: number;
  phase: number;
  size: number;
}) {
  const ref = useRef<Mesh>(null);
  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime * speed + phase;
    ref.current.position.set(Math.cos(t) * radius, 0, Math.sin(t) * radius);
    const glow = (Math.sin(t) + 1) / 2;
    const mat = ref.current.material as unknown as {
      emissiveIntensity: number;
    };
    mat.emissiveIntensity = 0.8 + glow * 2;
    ref.current.scale.setScalar(0.85 + glow * 0.35);
  });
  return (
    <group rotation={[tilt, 0, 0]}>
      <mesh ref={ref}>
        <sphereGeometry args={[size, 24, 24]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={1}
          metalness={0.85}
          roughness={0.12}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}

function AuroraCore() {
  const ref = useRef<Mesh>(null);
  const shell = useRef<Mesh>(null);
  useFrame((state, delta) => {
    if (ref.current) {
      ref.current.rotation.y += delta * 0.2;
      ref.current.scale.setScalar(
        1 + Math.sin(state.clock.elapsedTime * 1.3) * 0.06,
      );
    }
    if (shell.current) {
      shell.current.rotation.y -= delta * 0.4;
      shell.current.rotation.x += delta * 0.15;
    }
  });
  return (
    <group>
      <mesh ref={ref}>
        <icosahedronGeometry args={[0.95, 4]} />
        <meshStandardMaterial
          color={PALETTE.violetDeep}
          emissive={PALETTE.violet}
          emissiveIntensity={0.9}
          metalness={0.9}
          roughness={0.15}
        />
      </mesh>
      <mesh ref={shell} scale={1.18}>
        <icosahedronGeometry args={[0.95, 3]} />
        <meshStandardMaterial
          color={PALETTE.mint}
          emissive={PALETTE.mint}
          emissiveIntensity={1.8}
          wireframe
          transparent
          opacity={0.45}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}

/** Scene-level drift — must live inside <Canvas>. */
function Spinner({ children }: { children: React.ReactNode }) {
  const group = useRef<Group>(null);
  useFrame((state, delta) => {
    if (group.current) {
      group.current.rotation.y += delta * 0.08;
      group.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.2) * 0.1;
    }
  });
  return <group ref={group}>{children}</group>;
}

export default function IndustryRings({ className }: { className?: string }) {
  return (
    <Scene3D className={className} camera={{ position: [0, 0, 8.2], fov: 45 }}>
      <Float speed={1} rotationIntensity={0.15} floatIntensity={0.5}>
        <Spinner>
          <AuroraCore />
          {RINGS.map((ring, i) => (
            <RingBand
              key={`b${i}`}
              radius={ring.r}
              color={ring.color}
              tilt={ring.tilt}
              speed={ring.speed}
            />
          ))}
          {RINGS.flatMap((ring, i) =>
            Array.from({ length: ring.moons }).map((_, k) => (
              <Moon
                key={`m${i}-${k}`}
                radius={ring.r}
                color={ring.color}
                tilt={ring.tilt}
                speed={ring.speed * (k % 2 === 0 ? 1 : -1) * 0.35}
                phase={(k / ring.moons) * Math.PI * 2 + i}
                size={k === 0 ? 0.11 : 0.08}
              />
            )),
          )}
          <Sphere args={[0.03, 8, 8]} position={[0, 0, 0]}>
            <meshBasicMaterial color={PALETTE.mintSoft} toneMapped={false} />
          </Sphere>
        </Spinner>
      </Float>
    </Scene3D>
  );
}
