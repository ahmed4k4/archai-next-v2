# Visual redesign — 2026-10-10

## Direction
- Simplified the home hero into a single product-engineering sculpture with a faceted core, two slow orbital paths, four small nodes, and a restrained violet/mint palette.
- Removed the old hero particle field, decorative circuit SVG, and the over-sized rotating statistics ring. Replaced the ring with a compact engineering signature card.
- Reduced competing gradients, bloom and background opacity to improve hierarchy and make the headline and calls to action easier to read.
- Added page-specific, animated 3D backdrops to the home, marketing, search, project, category, and not-found routes. The scene mapping follows the page topic (services, industries, team, workflow, knowledge, contact, project metrics, FAQ, etc.).
- Unified backdrop colors around Archai's violet/mint system and reduced the homepage backdrop density.
- Updated fallback homepage copy and footer copy to describe Archai Solutions' actual service areas: web platforms, digital products, AI integration, embedded systems, IoT, and business systems.
- Kept the existing bilingual routing, project data from Supabase, admin-configurable homepage fields, reduced-motion support, and mobile low-power rendering.

## Validation
- TypeScript/TSX syntax transpilation: passed (101 files, zero syntax diagnostics).
- Relative import scan: passed (zero missing relative imports).
- `package.json`: valid JSON.
- Full Next.js build/typecheck was not run in this environment because dependencies are not installed and network access is unavailable.
- The deployed reference site's sitemap could not be independently fetched in this environment; this pass updates the local project and its known route-to-scene mapping rather than claiming a fresh exhaustive crawl of the live site.
