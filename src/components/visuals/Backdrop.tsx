"use client";

import type { PageKey } from "./PageScenes";

/**
 * Page backgrounds are intentionally kept to the shared star-and-meteor layer.
 * Context-specific 3D objects belong in the page hero/content, not another full
 * viewport WebGL canvas underneath every route. This avoids competing scenes
 * and leaves the GPU available for the meaningful hero visual.
 */
export default function Backdrop(_props: { name: PageKey }) {
  return null;
}
