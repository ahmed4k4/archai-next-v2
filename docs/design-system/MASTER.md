# Archai Visual System — Master Brief

## Direction
**Cinematic engineering studio**: a deep navy canvas, deliberate violet and mint light, high-contrast typography, crisp borders, and dimensional objects that communicate the page topic. It should feel authored, not like a generic template. Motion supports hierarchy and comprehension; it is not decoration for every pixel.

## Design principles
- **Distinctive first viewport**: a concise value proposition, one clear primary action, one secondary action, and a hero scene with a clear focal point.
- **Layered depth**: background field, one thematic 3D silhouette/scene, readable foreground content, and subtle parallax only on opted-in elements.
- **Rhythm**: vary dense information sections with open space; reuse consistent containers, cards, dividers, radii, and heading scale.
- **Interaction**: hover/focus affordances should be quick, restrained, and understandable; pointer-following lighting is desktop-only.
- **Bilingual by design**: every user-facing label has Arabic and English copy; verify RTL, punctuation, icon direction, and translated metadata separately.
- **Trust**: no unsourced client counts, satisfaction percentages, years of operation, or project delivery totals.

## Motion budget
- Initial load: one hero narrative, no competing entrance sequences.
- Scroll: Lenis + GSAP ScrollTrigger on supported desktop only; shared ticker, opt-in `[data-gsap-parallax]` targets.
- 3D: dynamically loaded, intersection-observer mounted, capped DPR, low-power preferences for supporting scenes, CSS fallback, local error boundary.
- Micro-interactions: existing Framer Motion and the local `SpotlightPanel`; avoid adding a second animation framework for a simple hover.
- Reduced motion: no smooth-scroll override, no rotating placeholder, and minimal/no continuous camera animation.
- Mobile: native scroll, no cursor-follow glow, fewer particles, lower DPR; never rely on 3D to communicate required information.

## Quality gates
- Lighthouse / Core Web Vitals: prioritize LCP, CLS, INP; monitor JavaScript and WebGL contexts.
- Accessibility: reduced-motion, keyboard focus, accessible names, semantic landmarks, contrast, and zoom.
- SEO: unique localized titles and descriptions, canonical/hreflang, meaningful headings, valid JSON-LD, crawlable links, Open Graph previews, and truthful content.
- Engineering: small abstractions, TypeScript types, no duplicated RAF/ticker loops, no unverified claims about test/build/deployment.
