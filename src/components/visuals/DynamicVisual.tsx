"use client";

import dynamic from "next/dynamic";
import { Component, type ComponentType, type ReactNode } from "react";
import VisualPlaceholder, { type VisualPlaceholderKind } from "./VisualPlaceholder";

function SceneChunkFallback({ kind = "abstract" }: { kind?: VisualPlaceholderKind }) {
  return (
    <div className="scene-loading-fallback" aria-hidden="true">
      <VisualPlaceholder kind={kind} />
    </div>
  );
}

/**
 * Keep every scene in its own client chunk so Three.js does not block first paint.
 * Next.js statically analyzes each dynamic() call, so options must be object
 * literals at the call site instead of a shared options variable.
 */
const registry = {
  HeroCore: dynamic(() => import("./HeroCore"), {
    ssr: false,
    loading: () => <SceneChunkFallback kind="planet" />,
  }),
  ServiceConstellation: dynamic(() => import("./ServiceConstellation"), {
    ssr: false,
    loading: () => <SceneChunkFallback kind="constellation" />,
  }),
  IndustryRings: dynamic(() => import("./IndustryRings"), {
    ssr: false,
    loading: () => <SceneChunkFallback kind="rings" />,
  }),
  DNAHelix: dynamic(() => import("./DNAHelix"), {
    ssr: false,
    loading: () => <SceneChunkFallback kind="helix" />,
  }),
  WorkflowGraph: dynamic(() => import("./WorkflowGraph"), {
    ssr: false,
    loading: () => <SceneChunkFallback kind="workflow" />,
  }),
  KnowledgeFragments: dynamic(() => import("./KnowledgeFragments"), {
    ssr: false,
    loading: () => <SceneChunkFallback kind="knowledge" />,
  }),
  SignalBeacon: dynamic(() => import("./SignalBeacon"), {
    ssr: false,
    loading: () => <SceneChunkFallback kind="beacon" />,
  }),
  SuccessMetrics: dynamic(() => import("./SuccessMetrics"), {
    ssr: false,
    loading: () => <SceneChunkFallback kind="metrics" />,
  }),
  TeamOrbit: dynamic(() => import("./TeamOrbit"), {
    ssr: false,
    loading: () => <SceneChunkFallback kind="team" />,
  }),
  QABubbles: dynamic(() => import("./QABubbles"), {
    ssr: false,
    loading: () => <SceneChunkFallback kind="faq" />,
  }),
  ProjectOrbit: dynamic(() => import("./ProjectOrbit"), {
    ssr: false,
    loading: () => <SceneChunkFallback kind="project" />,
  }),
} satisfies Record<string, ComponentType<{ className?: string }>>;

export type VisualName = keyof typeof registry;

/** Contain a failing scene so one bad visual never takes down the page. */
class VisualBoundary extends Component<{ children: ReactNode; instanceId?: string; kind?: VisualPlaceholderKind }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: unknown) {
    console.warn("[DynamicVisual] visual failed to render:", error);
    if (typeof window !== "undefined") {
      // Keep route readiness accurate when a dynamic chunk fails before Scene3D mounts.
      // Otherwise the route curtain would wait for its global timeout despite showing fallback art.
      if (this.props.instanceId) {
        const instance = Array.from(document.querySelectorAll<HTMLElement>("[data-visual-instance]"))
          .find((element) => element.dataset.visualInstance === this.props.instanceId);
        if (instance) instance.dataset.visualReady = "error";
      }
      window.dispatchEvent(new CustomEvent("archai:visual-ready", {
        detail: {
          route: window.location.pathname,
          instanceId: this.props.instanceId,
          status: "error",
        },
      }));
    }
  }

  render() {
    return this.state.failed ? <SceneChunkFallback kind={this.props.kind} /> : this.props.children;
  }
}

export default function DynamicVisual({
  name,
  className,
  instanceId,
}: {
  name: VisualName;
  className?: string;
  instanceId?: string;
}) {
  const Comp = registry[name];
  const kind = ({
    HeroCore: "planet", ServiceConstellation: "constellation", IndustryRings: "rings",
    DNAHelix: "helix", WorkflowGraph: "workflow", KnowledgeFragments: "knowledge",
    SignalBeacon: "beacon", SuccessMetrics: "metrics", TeamOrbit: "team", QABubbles: "faq", ProjectOrbit: "project",
  } as const)[name];

  if (!Comp) return <SceneChunkFallback kind={kind} />;

  return (
    <div className={`dynamic-visual ${className ?? ""}`}>
      <VisualBoundary instanceId={instanceId} kind={kind}>
        <Comp className="absolute inset-0" />
      </VisualBoundary>
    </div>
  );
}
