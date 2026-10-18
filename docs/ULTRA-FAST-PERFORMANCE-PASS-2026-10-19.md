# Archai Ultra-Fast Performance Pass — 2026-10-19

## Baseline supplied by PageSpeed Insights

The mobile report for `/en` reported Performance 69, FCP 1.5 s, LCP 2.6 s, TBT 1,280 ms, CLS 0, and Speed Index 4.4 s. The report called out approximately 450 ms of render-blocking CSS, about 111 KiB of unused JavaScript, and long JavaScript main-thread tasks. These are the supplied baseline values; this pass does not claim a new PSI score without a new measurement.

## Changes in this pass

- **Public marketing routes:** converted `MarketingPage` to server-rendered markup and removed its Framer Motion dependency, motion wrappers, and per-card spotlight client wrapper. Added restrained CSS-only entrance and hover states instead. This keeps public copy available in HTML and avoids shipping a motion runtime for simple effects on these routes.
- **Featured category slider:** replaced the Framer Motion carousel wrappers with semantic HTML and CSS transitions, while retaining user controls, snap scrolling, and lazy-loading for non-first slide images.
- **Home metrics:** kept `AnimatedNumber` as static server-rendered text so visible values do not depend on hydration or counter animation.
- **3D critical path:** the 3D scene registry remains split from the main bundle. First visit renders a topic-specific CSS illustration, and desktop WebGL enhancements are scheduled after explicit user intent or a 10-second near-viewport safety delay. Phone/tablet and lower-capability devices keep the CSS artwork and do not load Three.js/R3F during ordinary browsing. The explicit route-transition preload path is retained, so navigations can still prepare destination visuals under the transition curtain as requested.
- **Below-the-fold work:** content visibility keeps expensive layout/paint for long homepage sections out of the initial viewport work until needed.
- **Mobile presentation:** CSS-native card animations have short durations on narrow screens; hover-only effects are minimized; the existing mobile no-blur policy stays in place; reduced-motion preferences disable new entrance and hover animations.
- **Small brand asset:** the header and footer use the 64-pixel WebP mark for the small logo use case, including the legacy dashboard logo paths.

## Validation actually performed

- `NODE_PATH=/opt/nvm/versions/node/v22.16.0/lib/node_modules node scripts/verify-source.mjs` — PASS (130 source files parsed, 292 local imports checked; project-specific source, import, CSS parser, and readiness checks pass).
- `node --check next.config.js` — PASS.
- `node --check scripts/verify-source.mjs` — PASS.
- ZIP integrity checked with `unzip -t` before delivery.

## Validation not completed

- `npm run typecheck`, `npm run build`, browser/device visual checks, and a new PageSpeed run were **not completed** in the packaging environment. Dependency installation did not finish because npm registry access timed out; the incomplete `node_modules` directory was removed. Therefore the code-level source checks above are not a substitute for a full production build.
- The existing lockfile and reported `npm audit` vulnerabilities were not altered in this performance-only pass. Do not use `npm audit fix --force` as a performance fix; review security upgrades separately and retest them.

## Verify on the Windows project

After extracting this archive to a separate folder or merging it into the working copy while retaining `.env.local`, run:

```powershell
npm ci
npm run verify:source
npm run typecheck
npm run build
npm run start
```

Test `/en` and `/ar` at 360 px, 390 px, tablet width, and desktop; verify internal navigation, reduced-motion behavior, keyboard access, and that no console or network errors occur. Then rerun PageSpeed Insights on the deployed URL. Compare FCP, LCP, TBT, and Speed Index with the supplied baseline rather than inferring a score from source changes.
