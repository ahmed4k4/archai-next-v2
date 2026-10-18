# Archai — Critical-Path Performance Pass

**Date:** 19 October 2026  
**Route used for the supplied baseline:** `/en` (mobile Lighthouse / Moto G Power emulation)

## Baseline supplied by the project owner

| Metric | Reported baseline |
|---|---:|
| Performance score | 69 |
| First Contentful Paint | 1.5 s |
| Largest Contentful Paint | 2.6 s |
| Total Blocking Time | 1,280 ms |
| Cumulative Layout Shift | 0 |
| Speed Index | 4.4 s |

Reported opportunities included 450 ms of render-blocking CSS, about 110.9 KiB of unused JavaScript, 13.7 KiB of unused CSS, an approximately 2.38 s render delay for the LCP heading, and 11 long main-thread tasks. These are the values in the supplied PageSpeed report, not a fresh run performed against this source tree.

## Changes applied

### 1. Reduced JavaScript on the initial route

- Replaced Framer Motion wrappers in the homepage hero, header, footer, showcase marquee, and route curtain with server-rendered markup and/or native CSS transitions where animation did not justify shipping a motion runtime.
- Kept the hero heading in server-rendered HTML and removed its client-side motion entrance so the LCP text does not need a motion library to become visible.
- Kept the command palette code-split and loaded only when opened.
- Split the 3D scene registry itself into a dynamic import. `LazyVisual` now imports the registry only when a WebGL scene is actually mounted, instead of statically pulling the registry into its own first-load module graph.
- Kept the CSS placeholder mounted behind WebGL while a scene chunk loads, preventing the enhancement delay from becoming a blank visual.

### 2. Reduced speculative navigation work

- Disabled viewport prefetch for the main desktop navigation and the prominent homepage CTAs. A destination route should not compete with the first screen merely because its link is visible.
- Preserved click-driven App Router navigation. Existing desktop pointer/focus intent prefetch on primary navigation remains available; project-detail prefetch behavior is unchanged.

### 3. Reduced render-blocking and mobile rendering work

- Consolidated the two application-wide CSS files into `src/app/styles/globals.css` and removed the separate Lenis stylesheet import because the project already provides the needed Lenis rules. The root layout now has one global stylesheet import.
- Kept native scrolling as the default and Lenis/GSAP as deferred desktop enhancements.
- Kept phone/tablet scenes on the lightweight CSS visual path rather than downloading and compiling Three.js / React Three Fiber for every visit. Desktop WebGL enhancements wait until after the initial paint and idle opportunity.
- Reduced starfield density, meteor concurrency, hero particle count, and animation frame rates on supported devices.
- Continued to honor reduced-motion preferences.

### 4. Other quality fixes retained

- Kept the small 64 × 64 WebP header logo asset.
- Increased contrast for the decorative numbered capability markers identified by Lighthouse.
- Kept existing project-filter styling and responsive control improvements.

## Validation performed

- `scripts/verify-source.mjs`: **PASS** — 129 source files parsed; 293 local imports checked; source syntax, local imports, project JSON, 3D readiness, CMS safeguards, mobile preloading, and polling checks passed.
- `node --check next.config.js`: **PASS**.
- `node --check scripts/verify-source.mjs`: **PASS**.
- CSS parsing is included in the source verifier.

## Important limitation

A production build, full TypeScript check against installed project dependencies, browser run, and post-change PageSpeed/Lighthouse run **could not be completed in this environment**. The archive did not contain `node_modules`; the offline install stopped because the required `lenis@1.3.26` tarball was not cached, and the execution environment could not resolve external hosts. The source verifier transpiles/parses files and checks local imports, but it is not a substitute for `npm run build` or a browser performance measurement.

No new performance score or millisecond saving is claimed. The changes target the reported high-impact causes, especially the LCP render delay, heavy client motion code, unused scene code on mobile, and route-prefetch downloads. The actual score must be measured after installing dependencies, building, deploying, and rerunning PageSpeed on the deployed `/en` URL.

## Suggested verification after deployment

1. Run `npm ci` and `npm run build` in the project environment. Resolve any build/type errors before deploying.
2. Deploy this source to the same preview or production URL.
3. Run PageSpeed Insights for both `/en` and `/ar` in **mobile** mode, using the same conditions as the supplied baseline. Compare FCP, LCP, TBT and Speed Index; do not compare the score alone.
4. Check the browser console and verify the first hero heading is visible immediately, the mobile placeholder remains visible, desktop 3D loads after initial content, the search palette opens correctly, and navigation works with pointer, touch and keyboard.
