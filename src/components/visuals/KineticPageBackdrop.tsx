"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import type { Group, Mesh } from "three";
import type { PageKey } from "./PageScenes";
import { PALETTE, useScrollProgressRef } from "./scene-system";

const ACCENTS = [PALETTE.violet.base, PALETTE.mint.base, PALETTE.violet.light, PALETTE.mint.light];

type Kind = PageKey;

function KineticRoot({ page, children }: { page: Kind; children: React.ReactNode }) {
  const ref = useRef<Group>(null);
  const { progress, target } = useScrollProgressRef();
  useFrame((state, delta) => {
    if (!ref.current) return;
    progress.current += (target.current - progress.current) * (1 - Math.pow(0.002, delta));
    const p = progress.current;
    const t = state.clock.elapsedTime;
    const pagePhase = page.length * 0.13;
    // One restrained rig for the entire backdrop. Scroll changes perspective;
    // time provides only a barely perceptible breathing motion.
    ref.current.rotation.y = Math.sin(t * 0.08 + pagePhase) * 0.045 + (p - 0.5) * 0.16;
    ref.current.rotation.x = Math.cos(t * 0.06 + pagePhase) * 0.018 + Math.sin(p * Math.PI) * 0.035;
    ref.current.rotation.z = Math.sin(t * 0.05) * 0.012;
    ref.current.position.x = Math.sin(p * Math.PI * 2) * 0.08;
    ref.current.position.y = Math.cos(t * 0.12 + pagePhase) * 0.035 + (p - 0.5) * 0.12;
    ref.current.position.z = 0;
    ref.current.scale.setScalar(1 + Math.sin(t * 0.16 + pagePhase) * 0.012);
  });
  return <group ref={ref}>{children}</group>;
}

function OrbitRing({ radius, color, tilt = 0, speed = 0.2 }: { radius: number; color: string; tilt?: number; speed?: number }) {
  const ref = useRef<Mesh>(null);
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.z += delta * speed;
  });
  return <mesh ref={ref} rotation={[tilt, 0, 0]}>
    <torusGeometry args={[radius, 0.012, 8, 160]} />
    <meshBasicMaterial color={color} transparent opacity={0.2} toneMapped={false} />
  </mesh>;
}

function HomeGlyph() {
  const core = useRef<Mesh>(null);
  useFrame((state, delta) => {
    if (!core.current) return;
    const t = state.clock.elapsedTime;
    core.current.rotation.x += delta * 0.18;
    core.current.rotation.y += delta * 0.32;
    const s = 1 + Math.sin(t * 1.2) * 0.035;
    core.current.scale.setScalar(s);
  });
  return <>
    <mesh ref={core} position={[0, 0, -3]}>
      <icosahedronGeometry args={[1.15, 2]} />
      <meshPhysicalMaterial color={PALETTE.violet.base} metalness={0.8} roughness={0.2} clearcoat={1} emissive={PALETTE.violet.dark} emissiveIntensity={0.28} />
    </mesh>
    <mesh position={[0, 0, -3]} scale={1.28}>
      <icosahedronGeometry args={[1.15, 1]} />
      <meshBasicMaterial color={PALETTE.mint.light} wireframe transparent opacity={0.16} />
    </mesh>
    <OrbitRing radius={1.7} color={PALETTE.mint.light} tilt={0.7} speed={0.25} />
    <OrbitRing radius={2.15} color={PALETTE.violet.light} tilt={-0.45} speed={-0.18} />
  </>;
}

function ServiceGlyph() {
  const refs = useRef<(Group | null)[]>([]);
  useFrame((state) => refs.current.forEach((g, i) => {
    if (!g) return;
    const t = state.clock.elapsedTime;
    const a = t * 0.25 + (i / 6) * Math.PI * 2;
    g.position.set(Math.cos(a) * 2.2, Math.sin(a * 1.15) * 0.75, Math.sin(a) * 2.2 - 3);
    g.rotation.x = t * 0.3 + i;
    g.rotation.y = -t * 0.24;
  }));
  return <>
    <OrbitRing radius={2.2} color={PALETTE.violet.light} tilt={0.55} speed={0.16} />
    {Array.from({ length: 6 }).map((_, i) => <group key={i} ref={g => { refs.current[i] = g; }}>
      <RoundedBox args={[0.55, 0.55, 0.55]} radius={0.09} smoothness={4}>
        <meshPhysicalMaterial color={PALETTE.violet.dark} emissive={ACCENTS[i % 4]} emissiveIntensity={0.65} metalness={0.88} roughness={0.18} />
      </RoundedBox>
    </group>)}
  </>;
}

function IndustryGlyph() {
  const refs = useRef<(Mesh | null)[]>([]);
  useFrame((state) => refs.current.forEach((m, i) => {
    if (!m) return;
    const t = state.clock.elapsedTime;
    const h = 0.8 + (Math.sin(t * 0.65 + i * 0.6) * 0.5 + 0.5) * (1.4 + (i % 3) * 0.45);
    m.scale.y += (h - m.scale.y) * 0.08;
    m.rotation.y += 0.002 + i * 0.0003;
  }));
  return <group position={[0, -1.2, -3]}>
    {Array.from({ length: 8 }).map((_, i) => <mesh key={i} ref={m => { refs.current[i] = m; }} position={[(i - 3.5) * 0.8, 0.5, (i % 2) * 0.25]} scale={[1, 1, 1]}>
      <boxGeometry args={[0.5, 1.5, 0.5]} />
      <meshPhysicalMaterial color={PALETTE.violet.dark} emissive={ACCENTS[i % 4]} emissiveIntensity={0.4} metalness={0.82} roughness={0.22} />
    </mesh>)}
  </group>;
}

function AboutGlyph() {
  const ref = useRef<Group>(null);
  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime;
    ref.current.rotation.y = t * 0.18;
    ref.current.rotation.x = Math.sin(t * 0.2) * 0.12;
  });
  return <group ref={ref} position={[0, 0, -3]}>
    {Array.from({ length: 22 }).map((_, i) => {
      const t = i / 21 * Math.PI * 3.4;
      const y = i / 21 * 5.2 - 2.6;
      return <mesh key={i} position={[Math.cos(t) * 1.35, y, Math.sin(t) * 1.35]}>
        <sphereGeometry args={[0.11, 16, 16]} />
        <meshStandardMaterial color={i % 2 ? PALETTE.mint.base : PALETTE.violet.base} emissive={i % 2 ? PALETTE.mint.base : PALETTE.violet.base} emissiveIntensity={1.3} />
      </mesh>;
    })}
    <OrbitRing radius={1.65} color={PALETTE.mint.light} tilt={0.9} speed={0.12} />
  </group>;
}

function ProcessGlyph() {
  const refs = useRef<(Group | null)[]>([]);
  const mover = useRef<Mesh>(null);
  useFrame((state) => {
    const t = state.clock.elapsedTime * 0.55;
    const phase = t % 5;
    refs.current.forEach((g, i) => { if (g) g.position.y = Math.sin(state.clock.elapsedTime * 0.7 + i) * 0.12; });
    if (mover.current) {
      const x = -3.6 + (phase / 5) * 7.2;
      mover.current.position.set(x, 0.35 + Math.sin(state.clock.elapsedTime * 2) * 0.08, -3);
      mover.current.rotation.x += 0.04;
      mover.current.rotation.y += 0.06;
    }
  });
  return <group>
    {Array.from({ length: 6 }).map((_, i) => <group key={i} ref={g => { refs.current[i] = g; }} position={[-3.6 + i * 1.44, 0, -3]}>
      <RoundedBox args={[0.7, 0.7, 0.7]} radius={0.12} smoothness={4}>
        <meshPhysicalMaterial color={PALETTE.violet.dark} emissive={ACCENTS[i % 4]} emissiveIntensity={0.55} metalness={0.9} roughness={0.18} />
      </RoundedBox>
    </group>)}
    <mesh ref={mover} position={[-3.6, 0.35, -3]}>
      <icosahedronGeometry args={[0.22, 1]} />
      <meshBasicMaterial color={PALETTE.mint.light} toneMapped={false} />
    </mesh>
  </group>;
}

function InsightsGlyph() {
  const refs = useRef<(Group | null)[]>([]);
  useFrame((state) => refs.current.forEach((g, i) => {
    if (!g) return;
    const t = state.clock.elapsedTime;
    g.rotation.y = Math.sin(t * 0.35 + i) * 0.35;
    g.position.y = (i - 2.5) * 0.65 + Math.sin(t * 0.5 + i) * 0.16;
  }));
  return <group position={[0, 0, -3]}>
    {Array.from({ length: 6 }).map((_, i) => <group key={i} ref={g => { refs.current[i] = g; }} position={[(i - 2.5) * 0.62, (i - 2.5) * 0.65, 0]}>
      <RoundedBox args={[0.34, 1.05, 0.62]} radius={0.045} smoothness={4}>
        <meshPhysicalMaterial color={PALETTE.violet.dark} emissive={ACCENTS[i % 4]} emissiveIntensity={0.55} metalness={0.75} roughness={0.22} />
      </RoundedBox>
    </group>)}
  </group>;
}

function ContactGlyph() {
  const core = useRef<Mesh>(null);
  const rings = useRef<(Mesh | null)[]>([]);
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (core.current) core.current.scale.setScalar(1 + Math.sin(t * 2.2) * 0.09);
    rings.current.forEach((r, i) => { if (r) { const p = (t * 0.22 + i * 0.33) % 1; r.scale.setScalar(0.55 + p * 2.4); (r.material as THREE.MeshBasicMaterial).opacity = (1 - p) * 0.28; } });
  });
  return <group position={[0, 0, -3]}>
    <mesh ref={core}><sphereGeometry args={[0.34, 32, 32]} /><meshStandardMaterial color={PALETTE.mint.base} emissive={PALETTE.mint.base} emissiveIntensity={3} toneMapped={false} /></mesh>
    {[0,1,2].map(i => <mesh key={i} ref={m => { rings.current[i] = m; }} rotation={[-Math.PI/2,0,0]}><ringGeometry args={[0.85,0.89,64]} /><meshBasicMaterial color={PALETTE.mint.light} transparent opacity={0.25} side={THREE.DoubleSide} toneMapped={false} /></mesh>)}
    <OrbitRing radius={1.55} color={PALETTE.violet.light} tilt={0.6} speed={0.35} />
  </group>;
}

function MetricsGlyph() {
  const refs = useRef<(Mesh | null)[]>([]);
  useFrame((state) => refs.current.forEach((m, i) => { if (m) { const h = 0.7 + (Math.sin(state.clock.elapsedTime * 0.8 + i * 0.45) * 0.5 + 0.5) * 2.5; m.scale.y += (h - m.scale.y) * 0.09; m.position.y = -1 + h / 2; m.rotation.y += 0.008; } }));
  return <group position={[0, 0, -3]}>
    {Array.from({ length: 9 }).map((_, i) => <mesh key={i} ref={m => { refs.current[i] = m; }} position={[(i - 4) * 0.7, 0, 0]}>
      <cylinderGeometry args={[0.22,0.3,1,16]} />
      <meshPhysicalMaterial color={i % 2 ? PALETTE.mint.base : PALETTE.violet.base} emissive={i % 2 ? PALETTE.mint.base : PALETTE.violet.base} emissiveIntensity={0.55} metalness={0.72} roughness={0.22} />
    </mesh>)}
  </group>;
}

function CareersGlyph() {
  const ref = useRef<Group>(null);
  useFrame((state) => { if (ref.current) ref.current.rotation.y = state.clock.elapsedTime * 0.16; });
  return <group ref={ref} position={[0,0,-3]}>
    <mesh><sphereGeometry args={[0.6,32,32]} /><meshStandardMaterial color={PALETTE.violet.base} emissive={PALETTE.violet.base} emissiveIntensity={1.4} metalness={0.8} /></mesh>
    {[2,3,4].map((r,i) => <OrbitRing key={r} radius={r} color={i % 2 ? PALETTE.mint.light : PALETTE.violet.light} tilt={0.55 + i * 0.25} speed={0.15 + i * 0.05} />)}
  </group>;
}

function FaqGlyph() {
  const refs = useRef<(Mesh | null)[]>([]);
  useFrame((state) => refs.current.forEach((m,i) => { if (m) { const t=state.clock.elapsedTime; m.position.y += Math.sin(t*0.5+i)*0.0008; m.rotation.y += 0.003 + i*0.0002; } }));
  return <group position={[0,0,-3]}>
    {Array.from({length:9}).map((_,i)=><mesh key={i} ref={m=>{refs.current[i]=m}} position={[(i%3-1)*1.3,(Math.floor(i/3)-1)*1.05,0]}>
      <sphereGeometry args={[0.42 + (i%2)*0.08,24,24]}/><meshPhysicalMaterial color={PALETTE.violet.light} emissive={i%2?PALETTE.mint.base:PALETTE.violet.base} emissiveIntensity={0.4} transparent opacity={0.35} metalness={0.3} roughness={0.08}/>
    </mesh>)}
  </group>;
}

function ProjectGlyph() {
  const refs = useRef<(Group | null)[]>([]);
  useFrame((state)=>refs.current.forEach((g,i)=>{if(g){const t=state.clock.elapsedTime;g.position.z=-3+Math.sin(t*0.45+i)*0.5;g.rotation.y=Math.sin(t*0.3+i)*0.18;g.rotation.x=Math.cos(t*0.25+i)*0.08;}}));
  return <group>
    {Array.from({length:4}).map((_,i)=><group key={i} ref={g=>{refs.current[i]=g}} position={[(i-1.5)*1.9,(i%2?0.8:-0.7),-3]}>
      <RoundedBox args={[1.5,0.95,0.08]} radius={0.06} smoothness={4}><meshPhysicalMaterial color={PALETTE.violet.dark} emissive={i%2?PALETTE.mint.base:PALETTE.violet.base} emissiveIntensity={0.4} metalness={0.9} roughness={0.18}/></RoundedBox>
      <mesh position={[0,0,0.05]}><planeGeometry args={[1.3,0.72]}/><meshBasicMaterial color={i%2?PALETTE.mint.light:PALETTE.violet.light} transparent opacity={0.24}/></mesh>
    </group>)}
  </group>;
}

function CategoryGlyph() {
  const refs = useRef<(Mesh | null)[]>([]);
  useFrame((state)=>refs.current.forEach((m,i)=>{if(m){const col=i%4,row=Math.floor(i/4);m.position.z=-3+Math.sin(state.clock.elapsedTime*0.65-(col+row)*0.5)*0.45;m.rotation.z+=0.002;}}));
  return <group position={[0,0,-3]}>
    {Array.from({length:12}).map((_,i)=><mesh key={i} ref={m=>{refs.current[i]=m}} position={[(i%4-1.5)*1.35,(1-Math.floor(i/4))*1.15,-3]} rotation={[0.1,0,0.12]}>
      <boxGeometry args={[0.92,0.92,0.12]}/><meshPhysicalMaterial color={PALETTE.violet.dark} emissive={ACCENTS[i%4]} emissiveIntensity={0.4} metalness={0.8} roughness={0.22}/>
    </mesh>)}
  </group>;
}

export default function KineticPageBackdrop({ page }: { page: PageKey }) {
  const glyph = page === "home" ? <HomeGlyph />
    : page === "services" ? <ServiceGlyph />
    : page === "industries" ? <IndustryGlyph />
    : page === "about" ? <AboutGlyph />
    : page === "process" ? <ProcessGlyph />
    : page === "insights" ? <InsightsGlyph />
    : page === "contact" ? <ContactGlyph />
    : page === "case-studies" ? <MetricsGlyph />
    : page === "careers" ? <CareersGlyph />
    : page === "faq" ? <FaqGlyph />
    : page === "project" ? <ProjectGlyph />
    : <CategoryGlyph />;
  return <KineticRoot page={page}>
    {glyph}
  </KineticRoot>;
}
