import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Archai Solutions",
    short_name: "Archai",
    description: "Software, AI, digital product and embedded systems engineering.",
    start_url: "/en",
    display: "standalone",
    background_color: "#050812",
    theme_color: "#7c5cff",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" }],
  };
}
