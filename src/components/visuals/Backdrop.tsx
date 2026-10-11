"use client";
import dynamic from "next/dynamic";
import type { PageKey } from "./PageScenes";

const SceneBackdrop = dynamic(() => import("./backdrops/BackdropWrapper"), { ssr: false, loading: () => null });
const KineticPageBackdrop = dynamic(() => import("./KineticPageBackdrop"), { ssr: false, loading: () => null });

/** One coherent, content-aware kinetic 3D language is used across every page. */
export default function Backdrop({ name }: { name: PageKey }) {
  return (
    <SceneBackdrop>
      <KineticPageBackdrop page={name} />
    </SceneBackdrop>
  );
}
