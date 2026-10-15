"use client";
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import type { Mesh, Group } from "three";
import Scene3D from "./Scene3D";
import { PALETTE } from "./scene-utils";

/** The company as a core; teammates orbit it, some carrying a "skill" moon. */
const CREW = [
  {
    r: 1.6,
    color: PALETTE.violet,
    size: 0.16,
    speed: 0.55,
    tilt: 1.1,
    moon: true,
  },
  {
    r: 1.9,
    color: PALETTE.mint,
    size: 0.14,
    speed: -0.45,
    tilt: 0.4,
    moon: false,
  },
  {
    r: 2.2,
    color: PALETTE.violetSoft,
    size: 0.15,
    speed: 0.4,
    tilt: 1.4,
    moon: true,
  },
  {
    r: 2.5,
    color: PALETTE.mintSoft,
    size: 0.13,
    speed: -0.35,
    tilt: 0.7,
    moon: false,
  },
  {
    r: 2.8,
    color: PALETTE.rose,
    size: 0.14,
    speed: 0.32,
    tilt: 1.0,
    moon: true,
  },
  {
    r: 3.1,
    color: PALETTE.violetDeep,
    size: 0.12,
    speed: -0.28,
    tilt: 0.2,
    moon: false,
  },
];

function Person({ cfg, index }: { cfg: (typeof CREW)[number]; index: number }) {
  const orbit = useRef<Group>(null);
  const core = useRef<Mesh>(null);
  const moon = useRef<Group>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime * cfg.speed + index;
    if (orbit.current) {
      orbit.current.position.set(Math.cos(t) * cfg.r, 0, Math.sin(t) * cfg.r);
    }
    if (core.current) {
      core.current.rotation.y += 0.02;
    }
    if (moon.current && cfg.moon) {
      const mt = state.clock.elapsedTime * 1.6 + index;
      moon.current.position.set(
        Math.cos(mt) * 0.34,
        Math.sin(mt) * 0.18,
        Math.sin(mt) * 0.34,
      );
    }
  });

  return (
    <group rotation={[cfg.tilt, 0, 0]}>
      <group ref={orbit}>
        <mesh ref={core}>
          <sphereGeometry args={[cfg.size, 24, 24]} />
          <meshStandardMaterial
            color={cfg.color}
            emissive={cfg.color}
            emissiveIntensity={1.4}
            metalness={0.85}
            roughness={0.15}
            toneMapped={false}
          />
        </mesh>
        {cfg.moon && (
          <group ref={moon}>
            <mesh>
              <sphereGeometry args={[0.06, 16, 16]} />
              <meshStandardMaterial
                color={PALETTE.mintSoft}
                emissive={PALETTE.mintSoft}
                emissiveIntensity={2.4}
                toneMapped={false}
              />
            </mesh>
          </group>
        )}
      </group>
    </group>
  );
}

function OrbitTrace({
  r,
  tilt,
  color,
}: {
  r: number;
  tilt: number;
  color: string;
}) {
  return (
    <mesh rotation={[tilt, 0, 0]}>
      <torusGeometry args={[r, 0.006, 8, 128]} />
      <meshBasicMaterial
        color={color}
        transparent
        opacity={0.16}
        toneMapped={false}
      />
    </mesh>
  );
}

/** The pulsing company core — must live inside <Canvas>. */
function CompanyCore() {
  const core = useRef<Mesh>(null);
  const shell = useRef<Mesh>(null);
  useFrame((state, delta) => {
    if (core.current) {
      core.current.rotation.y += delta * 0.18;
      core.current.scale.setScalar(
        1 + Math.sin(state.clock.elapsedTime * 1.2) * 0.06,
      );
    }
    if (shell.current) {
      shell.current.rotation.y -= delta * 0.3;
    }
  });
  return (
    <>
      <mesh ref={core}>
        <icosahedronGeometry args={[0.85, 3]} />
        <meshStandardMaterial
          color={PALETTE.violetDeep}
          emissive={PALETTE.violet}
          emissiveIntensity={0.9}
          metalness={0.9}
          roughness={0.15}
        />
      </mesh>
      <mesh ref={shell} scale={1.18}>
        <icosahedronGeometry args={[0.85, 2]} />
        <meshBasicMaterial
          color={PALETTE.mint}
          wireframe
          transparent
          opacity={0.28}
          toneMapped={false}
        />
      </mesh>
    </>
  );
}

export default function TeamOrbit({ className }: { className?: string }) {
  const { rings } = useMemo(
    () => ({
      rings: CREW.map((c) => ({ r: c.r, tilt: c.tilt, color: c.color })),
    }),
    [],
  );

  return (
    <Scene3D
      fallbackKind="team"
      className={className}
      camera={{ position: [0, 2.2, 7.5], fov: 46 }}
    >
      <Float speed={1} rotationIntensity={0.12} floatIntensity={0.4}>
        <CompanyCore />

        {rings.map((r, i) => (
          <OrbitTrace key={i} r={r.r} tilt={r.tilt} color={r.color} />
        ))}
        {CREW.map((c, i) => (
          <Person key={i} cfg={c} index={i} />
        ))}
      </Float>
    </Scene3D>
  );
}
