"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import useReducedMotionPreference from "@/hooks/useReducedMotionPreference";
import {
  AdditiveBlending,
  BackSide,
  CanvasTexture,
  Color,
  SRGBColorSpace,
  type Group,
  ShaderMaterial,
} from "three";
import Scene3D from "./Scene3D";

/** A restrained procedural surface: broad, low-contrast bands rather than map-like continents. */
function createPlanetTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Unable to create planet surface texture");

  const base = ctx.createLinearGradient(0, 0, 0, canvas.height);
  base.addColorStop(0, "#091a38");
  base.addColorStop(0.34, "#183c6c");
  base.addColorStop(0.62, "#102b55");
  base.addColorStop(1, "#050d22");
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const oceanLight = ctx.createRadialGradient(150, 78, 4, 190, 110, 285);
  oceanLight.addColorStop(0, "rgba(71, 179, 222, .34)");
  oceanLight.addColorStop(0.42, "rgba(64, 113, 194, .13)");
  oceanLight.addColorStop(1, "rgba(4, 10, 28, 0)");
  ctx.fillStyle = oceanLight;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Fine atmospheric bands give the surface dimension without busy map graphics.
  for (let i = 0; i < 17; i++) {
    const y = 10 + i * 15;
    const wave = 5 + (i % 4) * 2;
    ctx.beginPath();
    ctx.moveTo(-10, y);
    ctx.bezierCurveTo(90, y - wave, 190, y + wave * 1.6, 270, y - wave * 0.35);
    ctx.bezierCurveTo(360, y - wave * 1.2, 425, y + wave, 522, y - 1);
    ctx.strokeStyle = i % 5 === 0 ? "rgba(132, 226, 241, .105)" : "rgba(153, 194, 255, .035)";
    ctx.lineWidth = i % 5 === 0 ? 1.3 : 0.8;
    ctx.stroke();
  }

  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

function createAtmosphereMaterial() {
  return new ShaderMaterial({
    uniforms: { glowColor: { value: new Color("#78caff") } },
    vertexShader: `
      varying vec3 vNormal;
      varying vec3 vViewPosition;
      void main() {
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        vNormal = normalize(normalMatrix * normal);
        vViewPosition = -mvPosition.xyz;
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: `
      uniform vec3 glowColor;
      varying vec3 vNormal;
      varying vec3 vViewPosition;
      void main() {
        float facing = max(dot(normalize(vNormal), normalize(vViewPosition)), 0.0);
        float fresnel = pow(1.0 - facing, 3.1);
        gl_FragColor = vec4(glowColor, fresnel * 0.42);
      }
    `,
    transparent: true,
    blending: AdditiveBlending,
    side: BackSide,
    depthWrite: false,
  });
}

function PlanetSystem({ reducedMotion }: { reducedMotion: boolean }) {
  const system = useRef<Group>(null);
  const planet = useRef<Group>(null);
  const orbit = useRef<Group>(null);
  const moonOrbit = useRef<Group>(null);
  const surfaceTexture = useMemo(createPlanetTexture, []);
  const atmosphereMaterial = useMemo(createAtmosphereMaterial, []);

  useEffect(() => {
    surfaceTexture.needsUpdate = true;
    atmosphereMaterial.needsUpdate = true;
    return () => {
      surfaceTexture.dispose();
      atmosphereMaterial.dispose();
    };
  }, [surfaceTexture, atmosphereMaterial]);

  useFrame((state, delta) => {
    if (reducedMotion) return;
    const step = Math.min(delta, 0.035);
    const time = state.clock.elapsedTime;
    if (system.current) {
      system.current.position.y = Math.sin(time * 0.42) * 0.045;
      system.current.rotation.y = -0.22 + Math.sin(time * 0.19) * 0.026;
    }
    if (planet.current) planet.current.rotation.y += step * 0.085;
    if (orbit.current) orbit.current.rotation.z = -0.34 + Math.sin(time * 0.2) * 0.022;
    if (moonOrbit.current) moonOrbit.current.rotation.y += step * 0.16;
  });

  return (
    <group ref={system} scale={0.68} rotation={[-0.08, -0.22, 0.04]}>
      <group ref={planet}>
        <mesh>
          <sphereGeometry args={[1.12, 48, 48]} />
          <meshPhysicalMaterial
            map={surfaceTexture}
            color="#dce9ff"
            roughness={0.44}
            metalness={0.12}
            clearcoat={0.34}
            clearcoatRoughness={0.52}
            emissive="#071b48"
            emissiveIntensity={0.32}
          />
        </mesh>
        <mesh scale={1.065}>
          <sphereGeometry args={[1.12, 40, 40]} />
          <primitive object={atmosphereMaterial} attach="material" />
        </mesh>
      </group>

      {/* One readable orbital ring plus a faint second line for depth—not a busy HUD. */}
      <group ref={orbit}>
        <mesh rotation={[1.13, 0.1, 0.1]}>
          <torusGeometry args={[1.52, 0.006, 6, 96]} />
          <meshPhysicalMaterial color="#b7b2ff" emissive="#716bdf" emissiveIntensity={0.18} roughness={0.52} metalness={0.54} />
        </mesh>
        <mesh rotation={[0.48, -0.34, -0.48]}>
          <torusGeometry args={[1.66, 0.003, 5, 96]} />
          <meshBasicMaterial color="#73dfd4" transparent opacity={0.23} />
        </mesh>
      </group>

      <group ref={moonOrbit} rotation={[0.72, 0.12, -0.24]}>
        <mesh position={[1.78, 0, 0]}>
          <sphereGeometry args={[0.073, 20, 20]} />
          <meshStandardMaterial color="#d1def5" roughness={0.7} metalness={0.1} emissive="#203a70" emissiveIntensity={0.1} />
        </mesh>
        <mesh position={[1.78, 0, 0]} scale={1.25}>
          <sphereGeometry args={[0.073, 16, 16]} />
          <meshBasicMaterial color="#93caff" transparent opacity={0.08} depthWrite={false} />
        </mesh>
      </group>

      {/* A single navigation point hints at connected systems without adding UI clutter. */}
      <mesh position={[-1.54, 0.66, 0.15]}>
        <sphereGeometry args={[0.025, 12, 12]} />
        <meshBasicMaterial color="#8fece2" transparent opacity={0.78} />
      </mesh>
    </group>
  );
}

export default function HeroCore({ className }: { className?: string }) {
  const reducedMotion = Boolean(useReducedMotionPreference());
  return (
    <Scene3D
      fallbackKind="planet"
      className={className}
      camera={{ position: [0, 0, 7.65], fov: 43 }}
      lights={false}
      tier="hero"
      mouseParallax
    >
      <ambientLight intensity={0.42} />
      <directionalLight position={[4.2, 4.8, 4.4]} intensity={2.1} color="#ffffff" />
      <pointLight position={[-3.2, -1.2, 2.6]} intensity={0.88} color="#5599ff" />
      <pointLight position={[1.5, 2.0, -3.2]} intensity={0.46} color="#40d9ca" />
      <PlanetSystem reducedMotion={reducedMotion} />
    </Scene3D>
  );
}
