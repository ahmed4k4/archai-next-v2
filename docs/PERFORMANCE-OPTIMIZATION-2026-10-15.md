# Archai — Performance & Mobile Optimization

**Date:** 15 October 2026  
**Scope:** public site first paint, mobile rendering cost, 3D scene loading, route transitions, and marketing-page responsiveness.

## Baseline supplied by the project owner

| Metric | Mobile | Desktop |
|---|---:|---:|
| Lighthouse Performance | 48/100 | 72/100 |
| First Contentful Paint | 3.0 s | Not supplied |
| Largest Contentful Paint | 5.8 s | Not supplied |
| Total Blocking Time | 1,090 ms | Not supplied |
| Speed Index | 4.3 s | Not supplied |
| Cumulative Layout Shift | 0 | Not supplied |
| Accessibility / Best Practices / SEO | 96 / 96–100 / 100 | 96 / 96–100 / 100 |

These are the **before** results supplied by the owner. No new Lighthouse run was completed in this environment, so this document intentionally does not invent an after score or claim a 100/100 result.

## Changes applied

### Initial rendering and network requests

- Removed the root-document dependency on Google Fonts CSS so text can render immediately using local/system font fallbacks rather than waiting on a third-party font stylesheet.
- Made the homepage H1, description, and main CTA visible on initial render instead of hiding key content until entrance animations hydrate.
- Kept the marketing-page H1 and description visible on initial render as well. This prioritizes text and useful content over decorative motion.
- Code-split the command palette and only load it when it is opened.
- Deferred Lenis until browser idle on desktop/fine pointers. GSAP and ScrollTrigger are imported only on desktop/fine pointers, after idle, and only when a page actually contains `[data-gsap-parallax]` elements.

### Three.js and background work

- Mobile, touch-first, and low-resource profiles keep the scene-specific CSS visuals instead of downloading/mounting the WebGL scene components. More capable desktop users retain the 3D enhancement, loaded when a scene is near the viewport and the browser is idle.
- Removed unused React Three Fiber preloading/adaptive canvas helpers from the shared scene renderer and reduced non-hero scene animation while on mobile.
- Reduced canvas star counts to 260/520/900 for narrow/tablet/desktop widths, with lower caps on low-resource hardware.
- The canvas starfield is drawn but no longer continuously animated on touch/narrow/low-power or reduced-motion profiles. The full-screen CSS star texture remains visible; its infinite background-position animation is disabled on these profiles. Desktop continues to get the animated starfield/meteor enhancement.
- Disables glass/backdrop blur compositing on mobile/touch screens for cards, badges, and utility classes, replacing it with tinted backgrounds while keeping borders and the visual hierarchy. Hover transforms on these surfaces remain disabled on touch.

### Mobile layout

- Marketing pages now put the title, description, and main action before the decorative visual on mobile. The previous order could place a large square scene ahead of the content and push the H1 down the page.
- The mobile hero visual is compact (170px high / capped width), scaling up to square imagery on larger screens and desktop.
- Added fluid title sizing for narrow screens, `min-w-0` to avoid grid overflow, and hid the tiny section index that could overlap content on mobile.
- Preserved the full-width page background, RTL/LTR layout, and touch target safeguards.

### Navigation and transition behavior retained from the previous pass

- Internal localized links use App Router navigation/prefetch rather than full document reloads where applicable.
- The route-transition curtain starts on click; on mobile it does not wait for WebGL readiness. Critical visible content/images are checked, but watchdog timers ensure one slow visual cannot leave a curtain stuck.

## Source validation

- `node scripts/verify-source.mjs`: **PASS**.
- Parsed source files: **128**.
- Local imports checked: **294**.
- Project JSON/dependency-lock consistency and the source-level route, CMS, mobile-scene, transition, and SEO safeguards are checked by the script.

### Not verified in this environment

- `npm run typecheck`: could not provide a valid check because `node_modules` is absent. TypeScript reports missing `next/*`, `react`, `framer-motion`, and type packages; inferred follow-on errors are not a trustworthy measure of the edited code until dependencies are installed.
- A production `next build`, browser screenshots, real-device checks, and post-change Lighthouse runs were not completed.
- The current results therefore establish source-level validation, **not** proof of a particular Lighthouse score.

## Final validation required after extraction/deployment

Run in a normal Node/npm environment from the project root:

```bash
npm ci
npm run verify:source
npm run typecheck
npm run build
npm run start
```

Then run Lighthouse against the deployed production build—not the development server—on the homepage and `/ar/projects` plus `/en/projects`, for Mobile and Desktop. Repeat each test at least three times and compare the median FCP/LCP/TBT/Speed Index/CLS. Re-test the site at 320, 360, 390, 430, 768, and 1440 px widths, including reduced-motion mode, both languages, and light/dark themes.

## Expected visual/performance trade-off

To prioritize fast mobile browsing, mobile/touch users get CSS-built scene artwork and a static star texture instead of continuous WebGL and meteor animation. The website remains themed and visually layered, while the continuously animated 3D experience is reserved for more capable desktop environments. Re-enabling all 3D effects on phones would trade away some of the performance gains.
