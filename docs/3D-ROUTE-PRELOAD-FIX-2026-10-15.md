# Archai 3D transition readiness fix — 15 October 2026

## Root cause

`src/components/motion/RouteTransition.tsx` permanently rendered `VisualPreloadContext.Provider value={false}`. That made the route-preload branch in `LazyVisual.tsx` unreachable. The transition only imported one or two near-viewport 3D chunks, while other scene instances waited for `IntersectionObserver` to report a scroll-near event. The curtain readiness check also only inspected the nearest scene, not the full set of in-layout visuals.

## Changes made

- Added a transition-scoped `preloadVisuals` state and wired it into `VisualPreloadContext`.
- During a route transition, import all unique 3D scene chunks used by elements with layout in the incoming route and prepare those `LazyVisual` instances before the reveal.
- The readiness check now waits for every in-layout 3D instance to report `ready` or `error`, plus critical images, instead of using the hero-only readiness gate.
- Preserved a hard deadline of 1.65 seconds and an approximately 0.28-second curtain exit, for a total upper bound of roughly 1.93 seconds from transition start.
- Keep responsive 3D elements with no active layout (for example, desktop-only strips hidden on phones) from creating unnecessary WebGL contexts.
- Keep off-screen `Scene3D` instances in demand-rendering mode after the first frame. Their animation loop resumes as they approach the viewport, reducing ongoing GPU usage.
- Mark dynamic visual failures as resolved on their instance wrapper so a failed chunk does not make the curtain wait until its hard deadline.
- Update `verify-source.mjs` so it fails if the visual preload provider is made permanently false or if the all-scene readiness gate is removed.

## Visual/content relationship review

Checked `src/components/visuals/PageScenes.ts`: hero/strip mappings use scene metaphors aligned with each route (planetary core for home, constellation for services, rings for industries, team orbit for about/careers, workflow for process, knowledge fragments for insights, signal beacon for contact, Q&A bubbles for FAQ and project orbit for project/case-study pages). Project/category pages also choose scenes using backend-supplied project/category names, slug, technology and industry metadata. These semantic mappings remain intact.

## Verification

- `node scripts/verify-source.mjs`: PASS (127 source files parsed, 293 local imports checked).
- Full TypeScript typecheck / Next.js production build: NOT VERIFIED in this environment. An offline dependency install could not complete because `lenis@1.3.26` is not available in the npm cache; the interrupted install left incomplete type packages, and `tsc --noEmit` therefore reported missing type definition packages (including `react`, `node`, and `three`). This is an environment/dependency-install limitation, not proof of a source typecheck pass.
- Browser-level navigation and GPU profiling: NOT RUN; this environment does not have the project's dependencies and a running browser build. Please run `npm ci`, `npm run typecheck`, `npm run build`, then test `/ar` → `/ar/projects` and a long marketing page on both mobile and desktop.

## Expected runtime behavior

On route change, below-the-fold 3D scenes that are part of the active responsive layout are mounted and prepared under the transition curtain. The curtain waits for their first-frame status, but never longer than its global deadline. If WebGL or a scene chunk fails, the scene-specific animated CSS fallback remains visible. Framer Motion's editorial reveal effects are still viewport-triggered by design; the heavy 3D scene itself should no longer wait until scrolling to initialize.
