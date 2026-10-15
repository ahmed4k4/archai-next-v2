/**
 * Preload route-specific 3D chunks without exporting helper functions from the
 * React component registry. Keeping this in its own module also preserves Next.js
 * Fast Refresh boundaries during development.
 */
import type { VisualName } from "./DynamicVisual";

const visualChunkLoaders: Record<VisualName, () => Promise<unknown>> = {
  HeroCore: () => import("./HeroCore"),
  ServiceConstellation: () => import("./ServiceConstellation"),
  IndustryRings: () => import("./IndustryRings"),
  DNAHelix: () => import("./DNAHelix"),
  WorkflowGraph: () => import("./WorkflowGraph"),
  KnowledgeFragments: () => import("./KnowledgeFragments"),
  SignalBeacon: () => import("./SignalBeacon"),
  SuccessMetrics: () => import("./SuccessMetrics"),
  TeamOrbit: () => import("./TeamOrbit"),
  QABubbles: () => import("./QABubbles"),
  ProjectOrbit: () => import("./ProjectOrbit"),
};

export async function preloadVisualChunks(names: readonly string[]): Promise<void> {
  const unique = Array.from(new Set(names)).filter(
    (name): name is VisualName => Object.prototype.hasOwnProperty.call(visualChunkLoaders, name),
  );
  await Promise.allSettled(unique.map((name) => visualChunkLoaders[name]()));
}
