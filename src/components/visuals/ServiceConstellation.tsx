"use client";
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Float, Line, Sparkles } from "@react-three/drei";
import * as THREE from "three";
import type { Group, Mesh } from "three";
import Scene3D from "./Scene3D";
import {
  PALETTE,
  curveBetween,
  pointOnCurve,
  spherePoints,
} from "./scene-utils";

/** 6 service nodes on a sphere, wired by curved lines with packets flowing along them. */
const COLORS = [
  PALETTE.violet,
  PALETTE.mint,
  PALETTE.violetSoft,
  PALETTE.mintSoft,
  PALETTE.rose,
  PALETTE.violetDeep,
];

const NODES = spherePoints(6, 2.1);

/** One packet travelling a curve, left to right. */
function Packet({
  curve,
  color,
  speed,
  offset,
}: {
  curve: THREE.Vector3[];
  color: string;
  speed: number;
  offset: number;
}) {
  const ref = useRef<Mesh>(null);
  useFrame((state) => {
    if (!ref.current) return;
    const t = (state.clock.elapsedTime * speed + offset) % 1;
    const p = pointOnCurve(curve, t);
    ref.current.position.copy(p);
  });
  return (
    <mesh ref={ref}>
      <sphereGeometry args={[0.07, 12, 12]} />
      <meshBasicMaterial color={color} toneMapped={false} />
    </mesh>
  );
}

function Node({
  position,
  color,
  index,
}: {
  position: [number, number, number];
  color: string;
  index: number;
}) {
  const ref = useRef<Mesh>(null);
  useFrame((state) => {
    if (!ref.current) return;
    /* each node lights up in turn */
    const phase = (state.clock.elapsedTime * 0.5 + index / NODES.length) % 1;
    const d = Math.min(phase, 1 - phase);
    const lit = Math.max(0, 1 - d * 8);
    const mat = ref.current.material as unknown as {
      emissiveIntensity: number;
    };
    mat.emissiveIntensity = 0.5 + lit * 2.4;
    const s = 1 + lit * 0.25;
    ref.current.scale.setScalar(s);
  });
  return (
    <Float speed={1.1} rotationIntensity={0.3} floatIntensity={0.7}>
      <mesh ref={ref} position={position}>
        <icosahedronGeometry args={[0.28, 3]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.6}
          metalness={0.8}
          roughness={0.15}
        />
      </mesh>
    </Float>
  );
}

function Core() {
  const ref = useRef<Mesh>(null);
  useFrame((state, delta) => {
    if (!ref.current) return;
    ref.current.rotation.y += delta * 0.35;
    ref.current.rotation.x += delta * 0.12;
    ref.current.scale.setScalar(
      1 + Math.sin(state.clock.elapsedTime * 1.4) * 0.07,
    );
  });
  return (
    <group>
      <mesh ref={ref}>
        <icosahedronGeometry args={[0.62, 1]} />
        <meshStandardMaterial
          color={PALETTE.violet}
          emissive={PALETTE.violetDeep}
          emissiveIntensity={1.1}
          metalness={0.85}
          roughness={0.12}
          flatShading
        />
      </mesh>
      <mesh scale={1.35}>
        <icosahedronGeometry args={[0.62, 1]} />
        <meshBasicMaterial
          color={PALETTE.mint}
          wireframe
          transparent
          opacity={0.3}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}

/** Slow whole-scene rotation — must live inside <Canvas>. */
function Spinner({ children }: { children: React.ReactNode }) {
  const group = useRef<Group>(null);
  useFrame((_, delta) => {
    if (group.current) group.current.rotation.y += delta * 0.06;
  });
  return <group ref={group}>{children}</group>;
}

export default function ServiceConstellation({
  className,
}: {
  className?: string;
}) {
  const curves = useMemo(() => {
    const list: { pts: THREE.Vector3[]; color: string }[] = [];
    for (let i = 0; i < NODES.length; i++) {
      const a = new THREE.Vector3(...NODES[i]);
      const b = new THREE.Vector3(...NODES[(i + 1) % NODES.length]);
      list.push({
        pts: curveBetween(a, b, 0.4).map(
          (p) => new THREE.Vector3(p.x, p.y, p.z),
        ),
        color: COLORS[i % COLORS.length],
      });
    }
    /* two chords across the sphere for extra web density */
    const c1 = new THREE.Vector3(...NODES[0]);
    const c2 = new THREE.Vector3(...NODES[3]);
    list.push({
      pts: curveBetween(c1, c2, 0.55).map(
        (p) => new THREE.Vector3(p.x, p.y, p.z),
      ),
      color: PALETTE.mintSoft,
    });
    const c3 = new THREE.Vector3(...NODES[1]);
    const c4 = new THREE.Vector3(...NODES[4]);
    list.push({
      pts: curveBetween(c3, c4, 0.55).map(
        (p) => new THREE.Vector3(p.x, p.y, p.z),
      ),
      color: PALETTE.violetSoft,
    });
    return list;
  }, []);

  return (
    <Scene3D fallbackKind="constellation" className={className} camera={{ position: [0, 0, 7], fov: 45 }}>
      <Spinner>
        <Core />
        {NODES.map((n, i) => (
          <Node
            key={i}
            position={n}
            color={COLORS[i % COLORS.length]}
            index={i}
          />
        ))}
        {curves.map((c, i) => (
          <Line
            key={i}
            points={c.pts}
            color={c.color}
            lineWidth={1.2}
            transparent
            opacity={0.55}
          />
        ))}
        {curves.map((c, i) => (
          <Packet
            key={`pkt-${i}`}
            curve={c.pts}
            color={c.color}
            speed={0.22}
            offset={i / curves.length}
          />
        ))}
        <Sparkles
          count={70}
          scale={6.5}
          size={2.2}
          speed={0.35}
          color={PALETTE.mintSoft}
          opacity={0.7}
        />
      </Spinner>
    </Scene3D>
  );
}
