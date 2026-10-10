"use client";
import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { MeshTransmissionMaterial } from "@react-three/drei";
import type { Mesh, Group } from "three";
import Scene3D from "./Scene3D";
import { PALETTE, mulberry32 } from "./scene-utils";

/** Glass bubbles, each holding a question mark, floating like open questions. */
const COUNT = 9;

function Bubble({
  position,
  scale,
  delay,
  speed,
  color,
}: {
  position: [number, number, number];
  scale: number;
  delay: number;
  speed: number;
  color: string;
}) {
  const ref = useRef<MtGroup>(null);
  useFrame((state) => {
    const g = ref.current;
    if (!g) return;
    const t = state.clock.elapsedTime + delay;
    g.position.y = position[1] + Math.sin(t * speed) * 0.5;
    g.position.x = position[0] + Math.cos(t * speed * 0.6) * 0.25;
    g.rotation.y += 0.004;
    /* gentle re-form pulse */
    const p = 1 + Math.sin(t * 0.9) * 0.08;
    g.scale.setScalar(scale * p);
  });
  return (
    <group ref={ref} position={position} scale={scale}>
      <mesh>
        <sphereGeometry args={[1, 48, 48]} />
        <MeshTransmissionMaterial
          backside
          samples={4}
          thickness={0.5}
          chromaticAberration={0.5}
          anisotropy={0.3}
          distortion={0.2}
          distortionScale={0.3}
          temporalDistortion={0.08}
          color={color}
          transmission={1}
          roughness={0.03}
          ior={1.42}
        />
      </mesh>
      {/* the question mark */}
      <mesh position={[0, 0, 0]} rotation={[0, 0, 0]}>
        <torusGeometry args={[0.32, 0.08, 12, 24, Math.PI * 1.5]} />
        <meshStandardMaterial
          color={PALETTE.mintSoft}
          emissive={PALETTE.mintSoft}
          emissiveIntensity={1.6}
          metalness={0.3}
          roughness={0.3}
          toneMapped={false}
        />
      </mesh>
      <mesh position={[0, -0.62, 0]}>
        <sphereGeometry args={[0.07, 14, 14]} />
        <meshStandardMaterial
          color={PALETTE.mintSoft}
          emissive={PALETTE.mintSoft}
          emissiveIntensity={1.6}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}

type MtGroup = Group;

/** Slow cloud rotation — must live inside <Canvas>. */
function Spinner({ children }: { children: React.ReactNode }) {
  const group = useRef<Group>(null);
  useFrame((_, delta) => {
    if (group.current) group.current.rotation.y += delta * 0.09;
  });
  return <group ref={group}>{children}</group>;
}

export default function QABubbles({ className }: { className?: string }) {
  const { bubbles } = useMemo(() => {
    const rng = mulberry32(21);
    return {
      bubbles: Array.from({ length: COUNT }).map((_, i) => {
        const a = (i / COUNT) * Math.PI * 2;
        const r = 1.4 + rng() * 1.6;
        return {
          position: [Math.cos(a) * r, (rng() - 0.5) * 2.4, Math.sin(a) * r] as [
            number,
            number,
            number,
          ],
          scale: 0.3 + rng() * 0.5,
          delay: rng() * 6,
          speed: 0.4 + rng() * 0.5,
          color:
            i % 3 === 0
              ? PALETTE.mint
              : i % 3 === 1
                ? PALETTE.violet
                : PALETTE.violetSoft,
        };
      }),
    };
  }, []);

  return (
    <Scene3D className={className} camera={{ position: [0, 0, 7.5], fov: 47 }}>
      <Spinner>
        {bubbles.map((b, i) => (
          <Bubble key={i} {...b} />
        ))}
      </Spinner>
    </Scene3D>
  );
}
