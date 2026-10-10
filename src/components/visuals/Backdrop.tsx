"use client";
import dynamic from "next/dynamic";
import type { PageKey } from "./PageScenes";

/**
 * Backdrop — the public entry for page backgrounds.
 *
 * Each page gets a *symbolic* WebGL scene that reflects its content
 * (services → service constellation, careers → orbital team, …).
 * three.js is fetched client-only so it never blocks first paint.
 */
const SceneBackdrop = dynamic(() => import("./backdrops/BackdropWrapper"), {
  ssr: false,
  loading: () => null,
});

const load = (name: string) =>
  dynamic(() => import("./backdrops/scenes").then((m) => ({ default: (m as never)[name] })), {
    ssr: false,
  });

const SCENES = {
  home: load("HomeScene"),
  services: load("ServicesScene"),
  industries: load("IndustriesScene"),
  about: load("AboutScene"),
  process: load("ProcessScene"),
  insights: load("InsightsScene"),
  contact: load("ContactScene"),
  "case-studies": load("CaseStudiesScene"),
  careers: load("CareersScene"),
  faq: load("FaqScene"),
  project: load("ProjectScene"),
  category: load("CategoryScene"),
} as Record<PageKey, ReturnType<typeof load>>;

export default function Backdrop({ name }: { name: PageKey }) {
  const Scene = SCENES[name] ?? SCENES.home;
  return (
    <SceneBackdrop>
      <Scene />
    </SceneBackdrop>
  );
}
