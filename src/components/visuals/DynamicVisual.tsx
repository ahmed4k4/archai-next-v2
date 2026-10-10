"use client";
import dynamic from "next/dynamic";
import { Component, type ComponentType, type ReactNode } from "react";

/** Every scene is lazy-loaded (ssr:false) so three.js never blocks first paint. */
const registry: Record<string, ComponentType<{ className?: string }>> = {
  HeroCore: dynamic(() => import("./HeroCore"), { ssr: false, loading: () => null }),
  ServiceConstellation: dynamic(() => import("./ServiceConstellation"), { ssr: false, loading: () => null }),
  IndustryRings: dynamic(() => import("./IndustryRings"), { ssr: false, loading: () => null }),
  DNAHelix: dynamic(() => import("./DNAHelix"), { ssr: false, loading: () => null }),
  WorkflowGraph: dynamic(() => import("./WorkflowGraph"), { ssr: false, loading: () => null }),
  KnowledgeFragments: dynamic(() => import("./KnowledgeFragments"), { ssr: false, loading: () => null }),
  SignalBeacon: dynamic(() => import("./SignalBeacon"), { ssr: false, loading: () => null }),
  SuccessMetrics: dynamic(() => import("./SuccessMetrics"), { ssr: false, loading: () => null }),
  TeamOrbit: dynamic(() => import("./TeamOrbit"), { ssr: false, loading: () => null }),
  QABubbles: dynamic(() => import("./QABubbles"), { ssr: false, loading: () => null }),
};

export type VisualName = keyof typeof registry;

/** Contain a failing scene so one bad visual never takes down the page. */
class VisualBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(error: unknown) {
    console.warn("[DynamicVisual] visual failed:", error);
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

export default function DynamicVisual({ name, className }: { name: VisualName; className?: string }) {
  const Comp = registry[name];
  if (!Comp) return null;
  return (
    <VisualBoundary>
      <Comp className={className} />
    </VisualBoundary>
  );
}