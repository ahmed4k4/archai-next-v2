"use client";
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Float, RoundedBox, Line } from "@react-three/drei";
import { CatmullRomCurve3, Vector3 } from "three";
import type { Group, Mesh } from "three";
import { PALETTE, mulberry32 } from "./utils";

/* ==================================================================== *
 * Every scene below is *symbolic* — the shape means something:
 *   data streams · service nodes · industry towers · team helix ·
 *   assembly line · knowledge shelf · signal beacon · growth bars ·
 *   orbital team · question bubbles · project screens · collection grid
 * ==================================================================== */

/* ---------- helpers ---------- */

/** Deterministic scatter of positions inside a box. */
function scatter(count: number, x: number, y: number, z: number, seed: number) {
  const rng = mulberry32(seed);
  return Array.from({ length: count }).map(
    () =>
      [(rng() - 0.5) * x, (rng() - 0.5) * y, -1 - rng() * z] as [
        number,
        number,
        number,
      ],
  );
}

/* ==================================================================== *
 * 1. HOME — PRODUCT ECOSYSTEM
 * Quiet floating interface tiles and dimensional objects; deliberately no
 * animated strands, grid lines, or high-frequency visual noise.
 * ==================================================================== */
export function HomeScene() {
  const root = useRef<Group>(null);
  const objects = useMemo(() => [
    { p: [-5.8, 2.6, -4] as [number, number, number], s: [1.25, 0.82, 0.12] as [number, number, number], c: PALETTE.violet.base, r: [0.1, 0.2, -0.12] as [number, number, number] },
    { p: [5.6, 1.4, -5] as [number, number, number], s: [1.05, 1.05, 0.16] as [number, number, number], c: PALETTE.mint.base, r: [0.2, -0.3, 0.12] as [number, number, number] },
    { p: [-4.9, -2.8, -4.5] as [number, number, number], s: [0.72, 0.72, 0.72] as [number, number, number], c: PALETTE.mint.base, r: [0.2, 0.15, 0.1] as [number, number, number] },
    { p: [4.4, -2.9, -5.5] as [number, number, number], s: [0.88, 0.88, 0.88] as [number, number, number], c: PALETTE.violet.base, r: [-0.15, 0.3, -0.1] as [number, number, number] },
  ], []);
  useFrame((state) => {
    if (root.current) {
      root.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.12) * 0.025;
      root.current.position.y = Math.sin(state.clock.elapsedTime * 0.22) * 0.08;
    }
  });
  return <group ref={root}>
    {objects.map((o, i) => <Float key={i} speed={0.28 + i * 0.05} floatIntensity={0.16} rotationIntensity={0.035}>
      <group position={o.p} rotation={o.r}>
        <RoundedBox args={o.s} radius={0.12} smoothness={4}>
          <meshPhysicalMaterial color={o.c} metalness={0.42} roughness={0.32} clearcoat={0.7} transparent opacity={0.28} />
        </RoundedBox>
        {i < 2 && <group position={[-o.s[0] * 0.28, o.s[1] * 0.12, o.s[2] * 0.56]}>
          {[0, 1, 2].map((j) => <mesh key={j} position={[j * 0.22, -j * 0.12, 0]}>
            <boxGeometry args={[0.12, 0.045, 0.018]} />
            <meshBasicMaterial color={i ? PALETTE.mint.light : PALETTE.violet.light} transparent opacity={0.32} />
          </mesh>)}
        </group>}
      </group>
    </Float>)}
  </group>;
}

/* ==================================================================== *
 * 2. SERVICES — SERVICE CONSTELLATION
 * Six service modules wired into a web; packets travel the links.
 * ==================================================================== */

export function ServicesScene() {
  const nodes = useMemo(() => {
    const colors = [
      PALETTE.violet.base,
      PALETTE.mint.base,
      PALETTE.violet.light,
      PALETTE.mint.light,
      PALETTE.violet.dark,
      PALETTE.mint.base,
    ];
    return Array.from({ length: 6 }).map((_, i) => {
      const a = (i / 6) * Math.PI * 2;
      const r = 4;
      return {
        pos: [Math.cos(a) * r, Math.sin(a) * r * 0.6, -2 + (i % 2)] as [
          number,
          number,
          number,
        ],
        color: colors[i],
        delay: i * 0.6,
      };
    });
  }, []);

  const links = useMemo(() => {
    const out: [number, number, number][][] = [];
    for (let i = 0; i < nodes.length; i++) {
      for (let k = i + 1; k < nodes.length; k++) {
        if ((i + k) % 3 === 0) out.push([nodes[i].pos, nodes[k].pos]);
      }
    }
    return out;
  }, [nodes]);

  const packets = useRef<(Mesh | null)[]>([]);
  useFrame((state) => {
    packets.current.forEach((m, i) => {
      if (!m) return;
      const link = links[i % links.length];
      const t = (state.clock.elapsedTime * 0.3 + i * 0.17) % 1;
      m.position.set(
        link[0][0] + (link[1][0] - link[0][0]) * t,
        link[0][1] + (link[1][1] - link[0][1]) * t,
        link[0][2] + (link[1][2] - link[0][2]) * t,
      );
    });
  });

  return (
    <group rotation={[0.2, 0, 0]}>
      {nodes.map((n, i) => (
        <ServiceNode key={i} {...n} />
      ))}
      {links.map((l, i) => (
        <Line
          key={i}
          points={l}
          color={PALETTE.violet.light}
          lineWidth={1}
          transparent
          opacity={0.2}
        />
      ))}
      {links.map((_, i) => (
        <mesh
          key={`p${i}`}
          ref={(m) => {
            packets.current[i] = m;
          }}
        >
          <boxGeometry args={[0.05, 0.05, 0.05]} />
          <meshBasicMaterial color={PALETTE.mint.light} toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
}

function ServiceNode({
  pos,
  color,
  delay,
}: {
  pos: [number, number, number];
  color: string;
  delay: number;
}) {
  const ref = useRef<Mesh>(null);
  useFrame((state) => {
    if (!ref.current) return;
    const pulse = (Math.sin(state.clock.elapsedTime * 1.4 - delay) + 1) / 2;
    const m = ref.current.material as unknown as { emissiveIntensity: number };
    m.emissiveIntensity = 0.3 + pulse * 1.4;
    ref.current.rotation.y += 0.004;
  });
  return (
    <Float speed={0.7} floatIntensity={0.6} rotationIntensity={0.15}>
      <RoundedBox
        ref={ref}
        args={[0.8, 0.8, 0.8]}
        radius={0.12}
        smoothness={4}
        position={pos}
      >
        <meshStandardMaterial
          color={PALETTE.violet.dark}
          emissive={color}
          emissiveIntensity={0.6}
          metalness={0.9}
          roughness={0.18}
          toneMapped={false}
        />
      </RoundedBox>
    </Float>
  );
}

/* ==================================================================== *
 * 3. INDUSTRIES — INDUSTRY TOWERS
 * A skyline of beveled towers; window lights flicker.
 * ==================================================================== */

export function IndustriesScene() {
  const towers = useMemo(() => {
    const rng = mulberry32(7);
    const colors = [
      PALETTE.violet.base,
      PALETTE.mint.base,
      PALETTE.violet.light,
      PALETTE.mint.light,
    ];
    return Array.from({ length: 9 }).map((_, i) => ({
      x: (i - 4) * 1.6,
      h: 1.2 + rng() * 3.4,
      w: 0.9 + rng() * 0.5,
      color: colors[i % colors.length],
      delay: i * 0.4,
    }));
  }, []);
  return (
    <group position={[0, -3, -2]} rotation={[0.1, 0, 0]}>
      <RoundedBox args={[18, 0.08, 7]} radius={0.12} smoothness={5} position={[0, -0.08, -0.2]} rotation={[0.05, 0, 0]}>
        <meshPhysicalMaterial color={PALETTE.violet.dark} metalness={0.65} roughness={0.32} transparent opacity={0.22} />
      </RoundedBox>
      {towers.map((t, i) => (
        <Tower key={i} {...t} />
      ))}
    </group>
  );
}

function Tower({
  x,
  h,
  w,
  color,
  delay,
}: {
  x: number;
  h: number;
  w: number;
  color: string;
  delay: number;
}) {
  const ref = useRef<Group>(null);
  const windows = useMemo(() => {
    const rng = mulberry32(Math.floor(x * 100) + 3);
    const rows = Math.floor(h / 0.5);
    const out: { pos: [number, number, number]; on: number }[] = [];
    for (let r = 1; r < rows; r++) {
      for (let c = -1; c <= 1; c += 2) {
        out.push({ pos: [c * (w / 3), r * 0.5, w / 2 + 0.01], on: rng() });
      }
    }
    return out;
  }, [h, w, x]);
  useFrame((state) => {
    if (!ref.current) return;
    const s = 0.6 + (Math.sin(state.clock.elapsedTime * 0.5 - delay) + 1) * 0.2;
    const m = ref.current.children[0] as Mesh;
    const mat = m?.material as unknown as { emissiveIntensity: number };
    if (mat) mat.emissiveIntensity = s;
  });
  return (
    <group position={[x, h / 2, 0]}>
      <RoundedBox args={[w, h, w]} radius={0.05} smoothness={4}>
        <meshStandardMaterial
          color={PALETTE.violet.dark}
          emissive={color}
          emissiveIntensity={0.6}
          metalness={0.92}
          roughness={0.2}
        />
      </RoundedBox>
      {windows.map((win, i) => (
        <mesh key={i} position={win.pos}>
          <planeGeometry args={[0.12, 0.16]} />
          <meshBasicMaterial
            color={win.on > 0.5 ? PALETTE.mint.light : PALETTE.violet.light}
            transparent
            opacity={0.5}
            toneMapped={false}
          />
        </mesh>
      ))}
    </group>
  );
}

/* ==================================================================== *
 * 4. ABOUT — TEAM HELIX
 * A double helix of teammates, rungs are shared values.
 * ==================================================================== */

export function AboutScene() {
  const ref = useRef<Group>(null);
  const [leftCurve, rightCurve] = useMemo(() => {
    const mk = (phase: number) => {
      const pts: Vector3[] = [];
      for (let i = 0; i < 40; i++) {
        const t = (i / 39) * Math.PI * 3;
        pts.push(
          new Vector3(
            Math.cos(t + phase) * 2.4,
            (i / 39) * 11 - 5.5,
            Math.sin(t + phase) * 2.4,
          ),
        );
      }
      return new CatmullRomCurve3(pts);
    };
    return [mk(0), mk(Math.PI)];
  }, []);
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.12;
  });
  return (
    <group ref={ref}>
      <mesh>
        <tubeGeometry args={[leftCurve, 120, 0.06, 8, false]} />
        <meshStandardMaterial
          color={PALETTE.violet.base}
          emissive={PALETTE.violet.base}
          emissiveIntensity={0.8}
          metalness={0.6}
          roughness={0.3}
          toneMapped={false}
        />
      </mesh>
      <mesh>
        <tubeGeometry args={[rightCurve, 120, 0.06, 8, false]} />
        <meshStandardMaterial
          color={PALETTE.mint.base}
          emissive={PALETTE.mint.base}
          emissiveIntensity={0.8}
          metalness={0.6}
          roughness={0.3}
          toneMapped={false}
        />
      </mesh>
      {/* teammates along the strands */}
      {useMemo(() => {
        const out: [number, number, number][] = [];
        for (let i = 0; i < 26; i++) {
          const t = (i / 26) * Math.PI * 3;
          const y = (i / 26) * 11 - 5.5;
          out.push([Math.cos(t) * 2.4, y, Math.sin(t) * 2.4]);
          out.push([
            Math.cos(t + Math.PI) * 2.4,
            y,
            Math.sin(t + Math.PI) * 2.4,
          ]);
        }
        return out;
      }, []).map((p, i) => (
        <Float
          key={i}
          speed={0.8 + (i % 3) * 0.2}
          floatIntensity={0.4}
          rotationIntensity={0.2}
        >
          <mesh position={p}>
            <sphereGeometry args={[0.13, 16, 16]} />
            <meshStandardMaterial
              color={i % 2 ? PALETTE.mint.light : PALETTE.violet.light}
              emissive={i % 2 ? PALETTE.mint.base : PALETTE.violet.base}
              emissiveIntensity={1.4}
              toneMapped={false}
            />
          </mesh>
        </Float>
      ))}
    </group>
  );
}

/* ==================================================================== *
 * 5. PROCESS — ASSEMBLY LINE
 * Six workstations; a product moves through them and each lights up.
 * ==================================================================== */

export function ProcessScene() {
  const STATIONS = 6;
  const stationX = (i: number) => (i - (STATIONS - 1) / 2) * 2.6;
  const refs = useRef<(Mesh | null)[]>([]);
  const product = useRef<Mesh>(null);
  useFrame((state) => {
    const t = state.clock.elapsedTime * 0.4;
    const cycle = t % STATIONS;
    refs.current.forEach((m, i) => {
      if (!m) return;
      const d = Math.min(Math.abs(cycle - i), STATIONS - Math.abs(cycle - i));
      const lit = Math.max(0, 1 - d * 1.5);
      const mat = m.material as unknown as { emissiveIntensity: number };
      mat.emissiveIntensity = 0.3 + lit * 1.6;
    });
    if (product.current) {
      const i = Math.floor(cycle);
      const f = cycle - i;
      const ease = f < 0.5 ? 2 * f * f : 1 - Math.pow(-2 * f + 2, 2) / 2;
      const x0 = stationX(i % STATIONS);
      const x1 = stationX((i + 1) % STATIONS);
      product.current.position.set(x0 + (x1 - x0) * ease, 0.2, 0);
    }
  });
  return (
    <group position={[0, -1, -3]}>
      {/* conveyor */}
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.08, 0.08, 17, 12]} />
        <meshStandardMaterial
          color={PALETTE.violet.dark}
          metalness={0.9}
          roughness={0.3}
        />
      </mesh>
      {Array.from({ length: STATIONS }).map((_, i) => (
        <group key={i} position={[stationX(i), 0, 0]}>
          <mesh
            ref={(m) => {
              refs.current[i] = m;
            }}
          >
            <cylinderGeometry args={[0.4, 0.5, 1.2, 6]} />
            <meshStandardMaterial
              color={PALETTE.violet.dark}
              emissive={i % 2 ? PALETTE.mint.base : PALETTE.violet.base}
              emissiveIntensity={0.4}
              metalness={0.9}
              roughness={0.2}
            />
          </mesh>
          <mesh position={[0, 0.75, 0]}>
            <sphereGeometry args={[0.09, 12, 12]} />
            <meshBasicMaterial color={PALETTE.mint.light} toneMapped={false} />
          </mesh>
        </group>
      ))}
      <RoundedBox
        ref={product}
        args={[0.4, 0.4, 0.4]}
        radius={0.08}
        smoothness={4}
        position={[stationX(0), 0.2, 0]}
      >
        <meshStandardMaterial
          color={PALETTE.mint.light}
          emissive={PALETTE.mint.base}
          emissiveIntensity={1.6}
          metalness={0.5}
          roughness={0.3}
          toneMapped={false}
        />
      </RoundedBox>
    </group>
  );
}

/* ==================================================================== *
 * 6. INSIGHTS — KNOWLEDGE SHELF
 * Twelve books; one lifts open every few seconds.
 * ==================================================================== */

export function InsightsScene() {
  const books = useMemo(() => {
    const rng = mulberry32(13);
    const colors = [
      PALETTE.violet.light,
      PALETTE.violet.base,
      PALETTE.mint.base,
      PALETTE.mint.light,
    ];
    return Array.from({ length: 12 }).map((_, i) => ({
      row: Math.floor(i / 4),
      col: i % 4,
      color: colors[i % colors.length],
      h: 0.9 + rng() * 0.5,
      delay: i * 0.4,
    }));
  }, []);
  const refs = useRef<(Group | null)[]>([]);
  useFrame((state) => {
    refs.current.forEach((g, i) => {
      if (!g) return;
      const t = (state.clock.elapsedTime * 0.3 - books[i].delay) % 6;
      /* every 6s cycle each book lifts for ~1.5s */
      const lift = t > 0 && t < 1.5 ? Math.sin((t / 1.5) * Math.PI) : 0;
      g.position.z = lift * 1.2;
      g.rotation.z = lift * 0.35;
    });
  });
  return (
    <group position={[0, 0, -3]}>
      {books.map((b, i) => (
        <group
          key={i}
          ref={(g) => {
            refs.current[i] = g;
          }}
          position={[(b.col - 1.5) * 1.1, (1 - b.row) * 1.6, 0]}
        >
          <RoundedBox args={[0.3, b.h, 0.85]} radius={0.05} smoothness={4}>
            <meshStandardMaterial
              color={PALETTE.violet.dark}
              emissive={b.color}
              emissiveIntensity={0.5}
              metalness={0.7}
              roughness={0.3}
            />
          </RoundedBox>
        </group>
      ))}
    </group>
  );
}

/* ==================================================================== *
 * 7. CONTACT — SIGNAL BEACON
 * A pulse source; rings expand outward; signals converge inward.
 * ==================================================================== */

export function ContactScene() {
  const waves = useRef<(Mesh | null)[]>([]);
  const signals = useRef<(Mesh | null)[]>([]);
  const seeds = useMemo(() => {
    const rng = mulberry32(21);
    return Array.from({ length: 16 }).map(() => ({
      theta: rng() * Math.PI * 2,
      phi: Math.acos(2 * rng() - 1),
      speed: 0.25 + rng() * 0.3,
      offset: rng(),
    }));
  }, []);
  useFrame((state) => {
    waves.current.forEach((m, i) => {
      if (!m) return;
      const t = (state.clock.elapsedTime * 0.3 + i * 0.25) % 1;
      m.scale.setScalar(0.5 + t * 4);
      const mat = m.material as unknown as { opacity: number };
      mat.opacity = (1 - t) * 0.4;
    });
    signals.current.forEach((m, i) => {
      if (!m) return;
      const s = seeds[i];
      const t = (state.clock.elapsedTime * s.speed + s.offset) % 1;
      const r = 5 - t * 4.6;
      m.position.set(
        Math.sin(s.phi) * Math.cos(s.theta) * r,
        Math.cos(s.phi) * r,
        Math.sin(s.phi) * Math.sin(s.theta) * r,
      );
    });
  });
  return (
    <group position={[0, 0, -3]}>
      <mesh>
        <sphereGeometry args={[0.3, 32, 32]} />
        <meshStandardMaterial
          color={PALETTE.mint.base}
          emissive={PALETTE.mint.base}
          emissiveIntensity={3}
          toneMapped={false}
        />
      </mesh>
      {[0, 1, 2, 3].map((i) => (
        <mesh
          key={i}
          ref={(m) => {
            waves.current[i] = m;
          }}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <ringGeometry args={[0.85, 0.92, 64]} />
          <meshBasicMaterial
            color={PALETTE.mint.base}
            transparent
            opacity={0.35}
            side={2}
            toneMapped={false}
          />
        </mesh>
      ))}
      {seeds.map((_, i) => (
        <mesh
          key={`s${i}`}
          ref={(m) => {
            signals.current[i] = m;
          }}
        >
          <boxGeometry args={[0.06, 0.06, 0.06]} />
          <meshBasicMaterial color={PALETTE.violet.light} toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
}

/* ==================================================================== *
 * 8. CASE STUDIES — GROWTH BARS
 * Twelve meters growing and falling, gradient bottom→top.
 * ==================================================================== */

export function CaseStudiesScene() {
  const bars = useRef<(Mesh | null)[]>([]);
  const N = 12;
  useFrame((state) => {
    bars.current.forEach((m, i) => {
      if (!m) return;
      const h =
        0.7 +
        (Math.sin(state.clock.elapsedTime * 0.7 + i * 0.5) * 0.5 + 0.5) * 2.4;
      m.scale.y = h;
      m.position.y = h / 2 - 1.6;
    });
  });
  return (
    <group position={[0, 0, -3]}>
      {Array.from({ length: N }).map((_, i) => (
        <mesh
          key={i}
          ref={(m) => {
            bars.current[i] = m;
          }}
          position={[(i - (N - 1) / 2) * 1.0, 0, 0]}
        >
          <cylinderGeometry args={[0.32, 0.32, 1, 16]} />
          <meshStandardMaterial
            color={i % 2 ? PALETTE.mint.base : PALETTE.violet.base}
            emissive={i % 2 ? PALETTE.mint.base : PALETTE.violet.base}
            emissiveIntensity={0.5}
            metalness={0.6}
            roughness={0.3}
            toneMapped={false}
          />
        </mesh>
      ))}
      <RoundedBox args={[15, 0.08, 5.5]} radius={0.1} smoothness={5} position={[0, -1.72, 0]} rotation={[-Math.PI / 2.4, 0, 0]}>
        <meshPhysicalMaterial color={PALETTE.violet.dark} metalness={0.7} roughness={0.28} transparent opacity={0.2} />
      </RoundedBox>
    </group>
  );
}

/* ==================================================================== *
 * 9. CAREERS — ORBITAL TEAM
 * Elliptical orbits with people orbiting a central company sun.
 * ==================================================================== */

export function CareersScene() {
  const orbits = [3, 4.2, 5.4, 6.6];
  const people = useMemo(() => {
    const rng = mulberry32(31);
    return orbits.flatMap((r, ri) =>
      Array.from({ length: 4 }).map((_, k) => ({
        r,
        tilt: 0.7 + ri * 0.35,
        angle: (k / 4) * Math.PI * 2 + rng(),
        speed: 0.3 - ri * 0.04,
        color: ri % 2 ? PALETTE.mint.light : PALETTE.violet.light,
      })),
    );
  }, [orbits]);
  const refs = useRef<(Group | null)[]>([]);
  useFrame((state) => {
    refs.current.forEach((g, i) => {
      if (!g) return;
      const p = people[i];
      const t = state.clock.elapsedTime * p.speed + p.angle;
      g.position.set(Math.cos(t) * p.r, 0, Math.sin(t) * p.r);
      g.rotation.y = -t;
    });
  });
  return (
    <group position={[0, 0, -4]} rotation={[0.25, 0, 0]}>
      <mesh>
        <sphereGeometry args={[0.85, 32, 32]} />
        <meshStandardMaterial
          color={PALETTE.violet.base}
          emissive={PALETTE.violet.base}
          emissiveIntensity={1.6}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>
      {orbits.map((r, i) => (
        <mesh key={i} rotation={[1 + i * 0.3, 0.2, 0]}>
          <torusGeometry args={[r, 0.012, 8, 140]} />
          <meshBasicMaterial
            color={PALETTE.violet.light}
            transparent
            opacity={0.15}
            toneMapped={false}
          />
        </mesh>
      ))}
      {people.map((p, i) => (
        <group key={i} rotation={[p.tilt, 0, 0]}>
          <group
            ref={(g) => {
              refs.current[i] = g;
            }}
          >
            <mesh>
              <sphereGeometry args={[0.1, 16, 16]} />
              <meshStandardMaterial
                color={p.color}
                emissive={p.color}
                emissiveIntensity={1.6}
                toneMapped={false}
              />
            </mesh>
            <mesh position={[0, -0.22, 0]}>
              <boxGeometry args={[0.12, 0.24, 0.1]} />
              <meshStandardMaterial
                color={PALETTE.violet.dark}
                metalness={0.8}
                roughness={0.3}
              />
            </mesh>
          </group>
        </group>
      ))}
    </group>
  );
}

/* ==================================================================== *
 * 10. FAQ — QUESTION BUBBLES
 * Fifteen glass bubbles drifting, each holding a question mark.
 * ==================================================================== */

export function FaqScene() {
  const bubbles = useMemo(() => {
    const rng = mulberry32(43);
    return Array.from({ length: 15 }).map(() => ({
      pos: [(rng() - 0.5) * 15, (rng() - 0.5) * 10, -2 - rng() * 4] as [
        number,
        number,
        number,
      ],
      size: 0.22 + rng() * 0.45,
      speed: 0.7 + rng() * 0.6,
    }));
  }, []);
  return (
    <>
      {bubbles.map((b, i) => (
        <Float
          key={i}
          speed={b.speed}
          floatIntensity={1.4}
          rotationIntensity={0.2}
        >
          <mesh position={b.pos}>
            <sphereGeometry args={[b.size, 20, 20]} />
            <meshStandardMaterial
              color={PALETTE.violet.light}
              emissive={i % 2 ? PALETTE.mint.base : PALETTE.violet.base}
              emissiveIntensity={0.3}
              transparent
              opacity={0.12}
              metalness={0.2}
              roughness={0.05}
            />
          </mesh>
        </Float>
      ))}
    </>
  );
}

/* ==================================================================== *
 * 11. PROJECT — PROJECT SCREENS
 * Five floating monitor panels drifting in depth.
 * ==================================================================== */

export function ProjectScene() {
  const screens = useMemo(
    () =>
      [
        { pos: [-4, 1, -2], rot: 0.3, color: PALETTE.violet.base },
        { pos: [3.5, 1.2, -3], rot: -0.3, color: PALETTE.mint.base },
        { pos: [-2.5, -1.5, -1.5], rot: 0.2, color: PALETTE.violet.light },
        { pos: [4, -1.4, -4], rot: -0.2, color: PALETTE.violet.light },
        { pos: [0.5, 2, -5], rot: 0, color: PALETTE.mint.light },
      ] as { pos: [number, number, number]; rot: number; color: string }[],
    [],
  );
  const refs = useRef<(Group | null)[]>([]);
  useFrame((state) => {
    refs.current.forEach((g, i) => {
      if (!g) return;
      g.position.z =
        screens[i].pos[2] + Math.sin(state.clock.elapsedTime * 0.5 + i) * 0.4;
      g.rotation.y =
        screens[i].rot + Math.sin(state.clock.elapsedTime * 0.3 + i) * 0.1;
    });
  });
  return (
    <group>
      {screens.map((s, i) => (
        <group
          key={i}
          ref={(g) => {
            refs.current[i] = g;
          }}
          position={s.pos}
          rotation={[0, s.rot, 0]}
        >
          <RoundedBox args={[2.2, 1.4, 0.08]} radius={0.06} smoothness={4}>
            <meshStandardMaterial
              color={PALETTE.violet.dark}
              metalness={0.9}
              roughness={0.2}
            />
          </RoundedBox>
          <mesh position={[0, 0, 0.05]}>
            <planeGeometry args={[2, 1.2]} />
            <meshBasicMaterial
              color={s.color}
              transparent
              opacity={0.28}
              toneMapped={false}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/* ==================================================================== *
 * 12. CATEGORY — COLLECTION GRID
 * A 3×4 wave of tiles.
 * ==================================================================== */

export function CategoryScene() {
  const refs = useRef<(Mesh | null)[]>([]);
  useFrame((state) => {
    refs.current.forEach((m, i) => {
      if (!m) return;
      const col = i % 4;
      const row = Math.floor(i / 4);
      const wave =
        Math.sin(state.clock.elapsedTime * 0.8 - (col + row) * 0.5) * 0.28;
      m.position.z = -3 + wave;
    });
  });
  return (
    <group position={[0, 0, -3]}>
      {Array.from({ length: 12 }).map((_, i) => {
        const col = i % 4;
        const row = Math.floor(i / 4);
        return (
          <mesh
            key={i}
            ref={(m) => {
              refs.current[i] = m;
            }}
            position={[(col - 1.5) * 1.7, (1 - row) * 1.7, -3]}
          >
            <boxGeometry args={[1.2, 1.2, 0.12]} />
            <meshStandardMaterial
              color={PALETTE.violet.dark}
              emissive={
                i % 3 === 0
                  ? PALETTE.mint.base
                  : i % 3 === 1
                    ? PALETTE.violet.base
                    : PALETTE.violet.light
              }
              emissiveIntensity={0.35}
              metalness={0.8}
              roughness={0.25}
            />
          </mesh>
        );
      })}
    </group>
  );
}
