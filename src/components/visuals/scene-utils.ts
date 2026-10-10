import * as THREE from "three";

/** Brand palette shared by every scene. */
export const PALETTE = {
  violet: "#7c5cff",
  violetDeep: "#6742f0",
  violetSoft: "#ad97ff",
  mint: "#4ce2d0",
  mintSoft: "#5ff5e0",
  rose: "#ff6b9d",
  gold: "#ffb829",
  ink: "#0a0e1f",
};

/** Deterministic PRNG so scenes look identical on every render/hydration. */
export function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Evenly distributed points on a sphere (fibonacci lattice). */
export function spherePoints(
  count: number,
  radius: number,
): [number, number, number][] {
  const pts: [number, number, number][] = [];
  const golden = Math.PI * (1 + Math.sqrt(5));
  for (let i = 0; i < count; i++) {
    const y = 1 - (i / (count - 1 || 1)) * 2;
    const r = Math.sqrt(Math.max(0, 1 - y * y));
    const theta = golden * i;
    pts.push([
      Math.cos(theta) * r * radius,
      y * radius,
      Math.sin(theta) * r * radius,
    ]);
  }
  return pts;
}

/** A smooth curve through points — used for connecting lines between nodes. */
export function curveBetween(a: THREE.Vector3, b: THREE.Vector3, bow = 0.35) {
  const mid = a.clone().add(b).multiplyScalar(0.5);
  mid.normalize().multiplyScalar(mid.length() * (1 + bow));
  const curve = new THREE.QuadraticBezierCurve3(a, mid, b);
  return curve.getPoints(40);
}

/** Sample a point along a parabola/bezier at t in [0,1]. */
export function pointOnCurve(points: THREE.Vector3[], t: number) {
  const clamped = Math.min(Math.max(t, 0), 1);
  const idx = clamped * (points.length - 1);
  const i = Math.floor(idx);
  const f = idx - i;
  const a = points[i];
  const b = points[Math.min(i + 1, points.length - 1)];
  if (!a || !b) return new THREE.Vector3();
  return a.clone().lerp(b, f);
}
