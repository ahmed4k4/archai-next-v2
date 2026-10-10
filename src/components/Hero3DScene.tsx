"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Float, MeshDistortMaterial, OrbitControls, Sparkles } from "@react-three/drei";
import { Suspense, useRef } from "react";
import { useReducedMotion } from "framer-motion";
import type { Mesh } from "three";

function Core({ reduceMotion }: { reduceMotion: boolean | null }) {
  const core = useRef<Mesh>(null);
  const ringA = useRef<Mesh>(null);
  const ringB = useRef<Mesh>(null);
  useFrame((state, delta) => {
    if (reduceMotion) return;
    if (core.current) {
      core.current.rotation.x += delta * 0.12;
      core.current.rotation.y += delta * 0.2;
    }
    if (ringA.current) {
      ringA.current.rotation.x += delta * 0.18;
      ringA.current.rotation.y -= delta * 0.12;
    }
    if (ringB.current) {
      ringB.current.rotation.x -= delta * 0.1;
      ringB.current.rotation.z += delta * 0.16;
    }
  });
  return (
    <group>
      <Float speed={reduceMotion ? 0 : 1.25} rotationIntensity={reduceMotion ? 0 : 0.22} floatIntensity={reduceMotion ? 0 : 0.6}>
        <mesh ref={core}>
          <icosahedronGeometry args={[1.05, 5]} />
          <MeshDistortMaterial color="#8b72ff" emissive="#34206f" emissiveIntensity={0.38} roughness={0.18} metalness={0.72} distort={0.22} speed={1.8} transparent opacity={0.94} />
        </mesh>
        <mesh scale={0.73}>
          <icosahedronGeometry args={[1.05, 3]} />
          <meshPhysicalMaterial color="#c5fff8" emissive="#3acdbf" emissiveIntensity={0.42} roughness={0.16} metalness={0.5} wireframe transparent opacity={0.72} />
        </mesh>
      </Float>
      <mesh ref={ringA} rotation={[1.1, 0.3, 0.2]}>
        <torusGeometry args={[1.55, 0.018, 12, 180]} />
        <meshStandardMaterial color="#44dfd0" emissive="#1b8f89" emissiveIntensity={1.1} metalness={0.8} roughness={0.24} />
      </mesh>
      <mesh ref={ringB} rotation={[0.35, 1.05, 0.6]}>
        <torusGeometry args={[1.78, 0.012, 10, 180]} />
        <meshStandardMaterial color="#a795ff" emissive="#7054ff" emissiveIntensity={1.2} metalness={0.8} roughness={0.2} />
      </mesh>
      <Float speed={reduceMotion ? 0 : 1.8} rotationIntensity={reduceMotion ? 0 : 0.5} floatIntensity={reduceMotion ? 0 : 1.3}>
        <mesh position={[1.75, 0.65, 0.15]} scale={0.16}>
          <octahedronGeometry args={[1, 1]} />
          <meshStandardMaterial color="#b8fff4" emissive="#48d7c9" emissiveIntensity={1.2} metalness={0.8} roughness={0.2} />
        </mesh>
      </Float>
      <Float speed={reduceMotion ? 0 : 1.35} rotationIntensity={reduceMotion ? 0 : 0.65} floatIntensity={reduceMotion ? 0 : 1.1}>
        <mesh position={[-1.65, -0.55, 0.2]} scale={0.12}>
          <dodecahedronGeometry args={[1, 0]} />
          <meshStandardMaterial color="#a58dff" emissive="#7558ff" emissiveIntensity={1} metalness={0.7} roughness={0.2} />
        </mesh>
      </Float>
      <mesh position={[0.1, 1.85, -0.2]}>
        <torusKnotGeometry args={[0.23, 0.055, 90, 12, 2, 5]} />
        <meshStandardMaterial color="#6ff7e7" emissive="#23a89b" emissiveIntensity={0.85} metalness={0.75} roughness={0.2} />
      </mesh>
      <Sparkles count={85} scale={5.4} size={2.2} speed={reduceMotion ? 0 : 0.22} color="#b5fff5" opacity={0.65} />
    </group>
  );
}

export default function Hero3DScene() {
  const reduceMotion = useReducedMotion();
  return (
    <Canvas camera={{ position: [0, 0, 5.8], fov: 36 }} dpr={[1, 1.5]} gl={{ alpha: true, antialias: true, powerPreference: "low-power" }}>
      <ambientLight intensity={1.2} />
      <pointLight position={[3, 3, 4]} intensity={35} color="#8f7aff" />
      <pointLight position={[-3, -2, 2]} intensity={22} color="#36d7c7" />
      <Suspense fallback={null}><Core reduceMotion={reduceMotion} /></Suspense>
      <OrbitControls enablePan={false} enableZoom={false} enableRotate={false} />
    </Canvas>
  );
}
