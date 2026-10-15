# Animation & 3D System

## Shared tools
- **GSAP + ScrollTrigger** coordinate desktop scroll-linked parallax.
- **Lenis** smooths wheel scrolling on wide, non-touch layouts only; it uses its own RAF (`autoRaf: true`) and notifies ScrollTrigger on scroll. This keeps wheel input independent from GSAP ticker state.
- **Framer Motion** remains responsible for component entrance and hover interactions.
- **Three.js / React Three Fiber** scene bundles load client-side. `LazyVisual` waits until a scene is near the viewport. `Scene3D` pauses the render loop while the scene is outside a 140px viewport margin and resumes it on re-entry, keeping scene state without burning a continuous frame loop.
- **SpotlightPanel** adapts the lightweight pointer-following SpotlightCard interaction pattern from [React Bits](https://github.com/DavidHDev/react-bits/blob/main/src/content/Components/SpotlightCard/SpotlightCard.jsx), rewritten locally to use pointer events and CSS variables without an extra package or perpetual animation loop. The upstream project uses an MIT + Commons Clause license; review its current terms before copying/distributing upstream source directly.

## How to opt a section into scroll depth

```tsx
<section data-gsap-scene>
  <div data-gsap-parallax="24">...</div>
</section>
```

The value specifies approximate pixel travel. Do not put every decorative item into the parallax system; choose a few visual anchors per section.

## Rules
- Native scroll remains enabled on mobile/small screens and with `prefers-reduced-motion: reduce`. If Lenis setup fails, cleanup removes any stale Lenis lock classes so native wheel scrolling remains available.
- The global native `scroll-behavior` is overridden by Lenis’ recommended stylesheet whenever Lenis is active; if initialization fails, remove any stale `.lenis-stopped` state so the browser can scroll naturally.
- Put non-essential 3D behind a clear CSS fallback, lazy mount it with `LazyVisual`, and keep important text/links outside canvas content.
- Avoid adding more full-page WebGL contexts without profiling device memory and frame time.
- Keep the home hero object-led: no vertical data streams or long repeated strokes over the primary heading. The global galaxy uses a 2D canvas with a bounded meteor count rather than another WebGL context.
- Validate keyboard/reduced-motion behavior and at least one mobile-width device before production.

## October 2026 visual refresh

- The homepage `HeroCore` is now a compact planetary system: a softly lit sphere, restrained atmospheric rim, two thin orbital paths and one moon. It avoids the previous cube/circuit-node cluster and removes the hero-only postprocessing composer to reduce GPU work.
- `GalaxyBackground` remains the single shared background layer. Stars use varied size, tint, twinkle and subtle drift; a small number have faint diffraction glints. Meteors use varied angles, short lifetimes, a brighter head and tapered cool-white tails. The canvas pauses when the tab is hidden and remains static for `prefers-reduced-motion`.
- `RouteTransition` renders a full-screen, transform-only branded curtain keyed by `usePathname`, revealing the committed destination after the first visible R3F frame or a bounded timeout. Page content uses a short opacity/vertical entrance. The curtain is fixed and isolated from the route-content transform, and reduced-motion users receive a near-instant transition.
- Keep the starfield as the only global animated background. Page-specific 3D scenes remain selected by `src/components/visuals/PageScenes.tsx`; do not add another full-screen canvas per page.
