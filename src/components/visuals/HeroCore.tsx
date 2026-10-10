"use client";
import { useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import {
  RoundedBox,
  MeshDistortMaterial,
  MeshTransmissionMaterial,
  Environment,
  Lightformer,
  Line,
} from "@react-three/drei";
import {
  EffectComposer,
  Bloom,
  Vignette,
  ChromaticAberration,
} from "@react-three/postprocessing";
import {
  AdditiveBlending,
  CatmullRomCurve3,
  Color,
  Vector2,
  Vector3,
} from "three";
import type { Group, Mesh } from "three";
import Scene3D from "./Scene3D";
import { PALETTE, HEX, EASINGS, MOTION } from "./scene-system";

/* ==================================================================== *
 * HeroCore — "AI Processing Core"
 *
 * The story: a glass compute cube sits inside a PCB (three orbiting
 * circuit rings). 24 compute nodes populate the rings and light up as
 * they work. Dashed data lines wire the nodes together and packets
 * stream along them. The whole thing assembles over five narrative
 * beats, then breathes forever.
 *
 * Every shape here is *symbolic*: a cube is a chip, a ring is a PCB
 * trace, a node is a compute unit, a line is a data bus.
 * ==================================================================== */

/* ------------------------------------------------------------------ *
 * Layer 1 — BACKGROUND (radial gradient + light noise, cheap)
 * ------------------------------------------------------------------ */

const BG_VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const BG_FRAG = /* glsl */ `
  uniform float uTime;
  uniform vec3 uA;
  uniform vec3 uB;
  uniform vec3 uC;
  varying vec2 vUv;

  float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7)))*43758.5453); }
  float noise(vec2 p){
    vec2 i = floor(p), f = fract(p);
    vec2 u = f*f*(3.0-2.0*f);
    return mix(mix(hash(i), hash(i+vec2(1,0)), u.x),
               mix(hash(i+vec2(0,1)), hash(i+vec2(1,1)), u.x), u.y);
  }

  void main(){
    vec2 uv = vUv;
    float t = uTime * 0.04;

    /* three corner gradients blended */
    float dA = 1.0 - smoothstep(0.0, 1.4, distance(uv, vec2(0.15, 0.85)));
    float dB = 1.0 - smoothstep(0.0, 1.4, distance(uv, vec2(0.85, 0.15)));
    float dC = 1.0 - smoothstep(0.0, 1.6, distance(uv, vec2(0.5, 0.5)));

    float n = noise(uv * 3.0 + t) * 0.4 + 0.6;

    vec3 col = uA * dA + uB * dB + uC * dC;
    col *= n;

    float alpha = (dA + dB) * 0.28 + dC * 0.18;
    gl_FragColor = vec4(col, alpha);
  }
`;

function Backdrop() {
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uA: { value: new Color(HEX.violet) },
      uB: { value: new Color(HEX.mint) },
      uC: { value: new Color(HEX.rose) },
    }),
    [],
  );
  useFrame((state) => {
    uniforms.uTime.value = state.clock.elapsedTime;
  });
  return (
    <mesh position={[0, 0, -8]} scale={[26, 16, 1]}>
      <planeGeometry args={[1, 1]} />
      <shaderMaterial
        vertexShader={BG_VERT}
        fragmentShader={BG_FRAG}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={AdditiveBlending}
      />
    </mesh>
  );
}

/* ------------------------------------------------------------------ *
 * Layer 2 — CORE CUBE (glass chip with a plasma brain)
 * ------------------------------------------------------------------ */

type Reveal = (delay: number, duration?: number) => number;

function CoreCube({ reveal }: { reveal: Reveal }) {
  const compact = useThree((state) => state.size.width < 768);
  const group = useRef<Group>(null);
  const plasma = useRef<Mesh>(null);
  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    const r = reveal(0);
    if (group.current) {
      group.current.scale.setScalar(r);
      group.current.rotation.y += delta * MOTION.base;
      group.current.rotation.x = Math.sin(t * 0.5) * 0.05;
    }
    if (plasma.current) {
      plasma.current.rotation.y -= delta * MOTION.fast;
      plasma.current.scale.setScalar(0.9 + Math.sin(t * 2.2) * 0.06);
    }
  });
  return (
    <group ref={group} scale={0.001}>
      {/* beveled glass chip */}
      <RoundedBox args={[1.6, 1.6, 1.6]} radius={0.08} smoothness={8}>
        <MeshTransmissionMaterial
          transmission={1}
          thickness={3}
          roughness={0.02}
          chromaticAberration={0.18}
          anisotropy={0.2}
          distortion={compact ? 0.08 : 0.18}
          distortionScale={0.12}
          temporalDistortion={0.04}
          ior={1.45}
          samples={compact ? 2 : 6}
          resolution={compact ? 128 : 256}
          backside
          color="#c9bcff"
          attenuationColor={PALETTE.violet.dark}
          attenuationDistance={2}
        />
      </RoundedBox>
      {/* the plasma "brain" inside */}
      <mesh ref={plasma} scale={0.42}>
        <icosahedronGeometry args={[1, 24]} />
        <MeshDistortMaterial
          color={PALETTE.violet.base}
          emissive={PALETTE.mint.emissive}
          emissiveIntensity={1.6}
          roughness={0.1}
          metalness={0.8}
          distort={0.5}
          speed={3}
        />
      </mesh>
      {/* inner core glow */}
      <mesh scale={0.22}>
        <sphereGeometry args={[1, 48, 48]} />
        <meshBasicMaterial
          color={PALETTE.mint.light}
          transparent
          opacity={0.9}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}

/* ------------------------------------------------------------------ *
 * Layer 3 — CIRCUIT SHELL (three PCB layers on X / Y / Z)
 * ------------------------------------------------------------------ */

/** A closed polygon path turned into a tube — reads as a PCB trace. */
function pcbCurve(sides: number, radius: number, wobble = 0) {
  const pts: Vector3[] = [];
  for (let i = 0; i <= sides; i++) {
    const a = (i / sides) * Math.PI * 2;
    const r = radius + Math.sin(a * 3) * wobble;
    pts.push(new Vector3(Math.cos(a) * r, Math.sin(a) * r, 0));
  }
  return new CatmullRomCurve3(pts, true);
}

function CircuitRing({
  sides,
  radius,
  thickness,
  rotation,
  speed,
  color,
  delay,
  reveal,
}: {
  sides: number;
  radius: number;
  thickness: number;
  rotation: [number, number, number];
  speed: number;
  color: string;
  delay: number;
  reveal: (d: number) => number;
}) {
  const ref = useRef<Mesh>(null);
  const curve = useMemo(
    () => pcbCurve(sides, radius, radius * 0.06),
    [sides, radius],
  );
  useFrame((_, delta) => {
    if (!ref.current) return;
    ref.current.rotation.z += delta * speed;
    const s = reveal(delay);
    ref.current.scale.setScalar(0.6 + s * 0.4);
    const m = ref.current.material as unknown as { emissiveIntensity: number };
    m.emissiveIntensity = 0.2 + s * 0.6;
  });
  return (
    <mesh ref={ref} rotation={rotation} scale={0.6}>
      <tubeGeometry args={[curve, 128, thickness, 8, true]} />
      <meshStandardMaterial
        color={PALETTE.violet.dark}
        metalness={0.95}
        roughness={0.15}
        emissive={color}
        emissiveIntensity={0.2}
        toneMapped={false}
      />
    </mesh>
  );
}

/* ------------------------------------------------------------------ *
 * Layer 4 — DATA NODES (24 compute units on the rings)
 * ------------------------------------------------------------------ */

function DataNodes({ reveal }: { reveal: Reveal }) {
  const nodes = useMemo(() => {
    const out: {
      pos: [number, number, number];
      axis: "x" | "y" | "z";
      color: string;
      delay: number;
    }[] = [];
    const colors = [PALETTE.violet.light, PALETTE.mint.base, PALETTE.rose.base];
    const ringR = [1.9, 2.35, 2.8];
    const axes: ("x" | "y" | "z")[] = ["z", "y", "x"];
    let idx = 0;
    ringR.forEach((r, ri) => {
      const count = 8;
      for (let i = 0; i < count; i++) {
        const a = (i / count) * Math.PI * 2 + ri;
        const axis = axes[ri];
        /* place on the ring plane, then the group rotation orients it */
        const pos: [number, number, number] =
          axis === "z"
            ? [Math.cos(a) * r, Math.sin(a) * r, 0]
            : axis === "y"
              ? [Math.cos(a) * r, 0, Math.sin(a) * r]
              : [0, Math.cos(a) * r, Math.sin(a) * r];
        out.push({
          pos,
          axis,
          color: colors[idx % colors.length],
          delay: 0.6 + idx * 0.03,
        });
        idx++;
      }
    });
    return out;
  }, []);

  return (
    <>
      {nodes.map((n, i) => (
        <DataNode key={i} {...n} reveal={reveal} />
      ))}
    </>
  );
}

function DataNode({
  pos,
  axis,
  color,
  delay,
  reveal,
}: {
  pos: [number, number, number];
  axis: "x" | "y" | "z";
  color: string;
  delay: number;
  reveal: Reveal;
}) {
  const ref = useRef<Group>(null);
  const box = useRef<Mesh>(null);
  const rotation: [number, number, number] =
    axis === "x"
      ? [Math.PI / 2, 0, 0]
      : axis === "y"
        ? [0, 0, Math.PI / 2]
        : [0, 0, 0];
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const s = reveal(delay);
    if (ref.current) ref.current.scale.setScalar(s);
    if (box.current) {
      const m = box.current.material as unknown as {
        emissiveIntensity: number;
      };
      /* staggered processing pulse */
      m.emissiveIntensity = 0.4 + (Math.sin(t * 3 + delay * 6) + 1) * 1.3;
    }
  });
  return (
    <group rotation={rotation}>
      <group ref={ref} position={pos} scale={0.001}>
        <RoundedBox
          args={[0.14, 0.14, 0.14]}
          radius={0.03}
          smoothness={4}
          ref={box}
        >
          <meshStandardMaterial
            color={PALETTE.violet.dark}
            emissive={color}
            emissiveIntensity={1}
            metalness={0.9}
            roughness={0.2}
            toneMapped={false}
          />
        </RoundedBox>
      </group>
    </group>
  );
}

/* ------------------------------------------------------------------ *
 * Layer 5 — CONNECTION LINES (dashed data buses between nodes)
 * ------------------------------------------------------------------ */

function ConnectionLines({ reveal }: { reveal: Reveal }) {
  const lines = useMemo(() => {
    const out: { pts: [number, number, number][]; delay: number }[] = [];
    const nodes: Vector3[] = [];
    const ringR = [1.9, 2.35, 2.8];
    const axes: ("x" | "y" | "z")[] = ["z", "y", "x"];
    ringR.forEach((r, ri) => {
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2 + ri;
        const axis = axes[ri];
        nodes.push(
          axis === "z"
            ? new Vector3(Math.cos(a) * r, Math.sin(a) * r, 0)
            : axis === "y"
              ? new Vector3(Math.cos(a) * r, 0, Math.sin(a) * r)
              : new Vector3(0, Math.cos(a) * r, Math.sin(a) * r),
        );
      }
    });
    /* connect a subset (not all pairs — that would be a hairball) */
    for (let i = 0; i < nodes.length; i++) {
      const a = nodes[i];
      const b = nodes[(i + 7) % nodes.length];
      const mid = a.clone().add(b).multiplyScalar(0.5).multiplyScalar(0.75);
      out.push({
        pts: [
          [a.x, a.y, a.z],
          [mid.x, mid.y, mid.z],
          [b.x, b.y, b.z],
        ],
        delay: 0.9 + i * 0.02,
      });
    }
    return out;
  }, []);

  return (
    <>
      {lines.map((l, i) => (
        <ConnectionLine key={i} line={l} reveal={reveal} index={i} />
      ))}
    </>
  );
}

function ConnectionLine({
  line,
  reveal,
  index,
}: {
  line: { pts: [number, number, number][]; delay: number };
  reveal: (d: number) => number;
  index: number;
}) {
  const ref = useRef<{ material: { dashOffset: number } } | null>(null);
  useFrame((state) => {
    const s = reveal(line.delay);
    if (ref.current) {
      ref.current.material.dashOffset = -state.clock.elapsedTime * 0.5 - index;
      /* fade in as the reveal progresses */
      (ref.current.material as unknown as { opacity: number }).opacity =
        s * 0.4;
    }
  });
  return (
    <Line
      ref={ref as never}
      points={line.pts}
      color={PALETTE.mint.base}
      lineWidth={1}
      dashed
      dashScale={4}
      transparent
      opacity={0}
    />
  );
}

/* ------------------------------------------------------------------ *
 * Layer 6 — PACKETS (data flowing along the buses)
 * ------------------------------------------------------------------ */

function Packets({ count = 60, reveal }: { count?: number; reveal: Reveal }) {
  const refs = useRef<(Mesh | null)[]>([]);
  const routes = useMemo(() => {
    const out: {
      pts: [number, number, number][];
      speed: number;
      offset: number;
    }[] = [];
    const nodes: Vector3[] = [];
    const ringR = [1.9, 2.35, 2.8];
    const axes: ("x" | "y" | "z")[] = ["z", "y", "x"];
    ringR.forEach((r, ri) => {
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2 + ri;
        const axis = axes[ri];
        nodes.push(
          axis === "z"
            ? new Vector3(Math.cos(a) * r, Math.sin(a) * r, 0)
            : axis === "y"
              ? new Vector3(Math.cos(a) * r, 0, Math.sin(a) * r)
              : new Vector3(0, Math.cos(a) * r, Math.sin(a) * r),
        );
      }
    });
    for (let i = 0; i < count; i++) {
      const a = nodes[i % nodes.length];
      const b = nodes[(i + 7) % nodes.length];
      const mid = a.clone().add(b).multiplyScalar(0.5).multiplyScalar(0.75);
      out.push({
        pts: [
          [a.x, a.y, a.z],
          [mid.x, mid.y, mid.z],
          [b.x, b.y, b.z],
        ],
        speed: 0.25 + ((i * 0.137) % 1) * 0.5,
        offset: (i * 0.618) % 1,
      });
    }
    return out;
  }, [count]);

  const tmp = useMemo(() => new Vector3(), []);

  useFrame((state) => {
    const s = reveal(1.1);
    routes.forEach((r, i) => {
      const m = refs.current[i];
      if (!m) return;
      const t = (state.clock.elapsedTime * r.speed + r.offset) % 1;
      const idx = t * (r.pts.length - 1);
      const k = Math.floor(idx);
      const f = idx - k;
      const p0 = r.pts[Math.min(k, r.pts.length - 2)];
      const p1 = r.pts[Math.min(k + 1, r.pts.length - 1)];
      if (!p0 || !p1) return;
      tmp.set(
        p0[0] + (p1[0] - p0[0]) * f,
        p0[1] + (p1[1] - p0[1]) * f,
        p0[2] + (p1[2] - p0[2]) * f,
      );
      m.position.copy(tmp);
      const mat = m.material as unknown as { opacity: number };
      mat.opacity = s * Math.sin(t * Math.PI);
    });
  });

  return (
    <>
      {routes.map((_, i) => (
        <mesh
          key={i}
          ref={(m) => {
            refs.current[i] = m;
          }}
        >
          <boxGeometry args={[0.035, 0.035, 0.035]} />
          <meshBasicMaterial
            color={PALETTE.mint.light}
            transparent
            opacity={0}
            toneMapped={false}
          />
        </mesh>
      ))}
    </>
  );
}

/* ------------------------------------------------------------------ *
 * POST-PROCESSING (light — beauty lives in the materials)
 * ------------------------------------------------------------------ */

function Effects() {
  const caOffset = useMemo(() => new Vector2(0.0008, 0.0008), []);
  return (
    <EffectComposer multisampling={2}>
      <Bloom
        intensity={0.8}
        luminanceThreshold={0.25}
        luminanceSmoothing={0.5}
        mipmapBlur
      />
      <ChromaticAberration
        offset={caOffset}
        radialModulation
        modulationOffset={0.4}
      />
      <Vignette offset={0.3} darkness={0.6} />
    </EffectComposer>
  );
}

/* ------------------------------------------------------------------ *
 * ROOT
 * ------------------------------------------------------------------ */

function HeroScene() {
  /* R3F hooks must run inside the Canvas provider created by Scene3D. */
  const elapsed = useRef(0);
  useFrame((_, delta) => {
    elapsed.current += delta;
  });
  const reveal = (delay: number, duration = 1) =>
    EASINGS.outExpo(
      Math.min(1, Math.max(0, (elapsed.current - delay) / duration)),
    );

  return (
    <>

      {/* ── Cinematic light rig (key / fill / rim / back / top / accent) ── */}
      <ambientLight intensity={0.2} />
      <directionalLight position={[5, 8, 5]} intensity={3} color="#ffffff" />
      <directionalLight
        position={[-5, -3, 4]}
        intensity={1.5}
        color={PALETTE.violet.light}
      />
      <pointLight
        position={[0, 0, -8]}
        intensity={3}
        color={PALETTE.mint.base}
      />
      <pointLight
        position={[8, 3, -5]}
        intensity={2}
        color={PALETTE.rose.base}
      />
      <spotLight
        position={[0, 10, 0]}
        angle={0.5}
        penumbra={1}
        intensity={4}
        color="#ffffff"
      />
      <pointLight
        position={[-6, -4, -3]}
        intensity={1.5}
        color={PALETTE.violet.base}
      />

      {/* ── Four-lightformer internal HDRI ── */}
      <Environment resolution={256}>
        <Lightformer
          intensity={2}
          color="#ffffff"
          position={[0, 6, -9]}
          scale={[12, 12, 1]}
        />
        <Lightformer
          intensity={2}
          color={PALETTE.violet.base}
          position={[7, 0, -6]}
          scale={[10, 10, 1]}
        />
        <Lightformer
          intensity={2}
          color={PALETTE.mint.base}
          position={[-7, 0, -6]}
          scale={[10, 10, 1]}
        />
        <Lightformer
          intensity={1.5}
          color={PALETTE.rose.base}
          position={[0, -6, -6]}
          scale={[10, 10, 1]}
        />
      </Environment>

      <Backdrop />

      {/* Circuit shell — three PCB layers on three axes */}
      <CircuitRing
        sides={6}
        radius={1.9}
        thickness={0.02}
        rotation={[0, 0, 0]}
        speed={MOTION.slow}
        color={PALETTE.mint.base}
        delay={0.5}
        reveal={reveal}
      />
      <CircuitRing
        sides={8}
        radius={2.35}
        thickness={0.035}
        rotation={[Math.PI / 2, 0, 0]}
        speed={-MOTION.slow * 1.6}
        color={PALETTE.violet.light}
        delay={0.7}
        reveal={reveal}
      />
      <CircuitRing
        sides={10}
        radius={2.8}
        thickness={0.05}
        rotation={[0, Math.PI / 2, 0]}
        speed={MOTION.slow * 1.2}
        color={PALETTE.rose.base}
        delay={0.9}
        reveal={reveal}
      />

      {/* Core + nodes + buses + traffic */}
      <CoreCube reveal={reveal} />
      <DataNodes reveal={reveal} />
      <ConnectionLines reveal={reveal} />
      <Packets count={60} reveal={reveal} />
    </>
  );
}

export default function HeroCore({ className }: { className?: string }) {
  return (
    <Scene3D
      className={className}
      camera={{ position: [0, 0, 6], fov: 42 }}
      lights={false}
      tier="hero"
      composer={<Effects />}
      mouseParallax
    >
      <HeroScene />
    </Scene3D>
  );
}
