# Route Transition: Wait Until the Destination Is Ready

**Date:** 2026-10-19  
**Scope:** Next.js App Router transitions, lazy 3D visuals, page entrance animations, critical images, and fonts.

## What changed

- Extended the pre-navigation failsafe to 12 seconds and the post-navigation failsafe to 45 seconds. The curtain normally exits as soon as the readiness checks pass; the long timeout is only a recovery path for failed or stuck requests/scenes.
- Raised the minimum cover duration to 320 ms so very fast client navigation does not flash the destination before the transition can complete.
- Added a transition-scoped visual-preparation mode. Once the destination path changes, laid-out `LazyVisual` scenes on capable desktop devices are queued even when below the fold; the shared queue continues to serialize expensive WebGL bootstraps.
- Wait for each prepared scene to report its first rendered frame (`ready`) or a handled rendering failure (`error`). CSS-based lightweight scene art counts as ready on touch-first/low-resource devices.
- Wait for critical in-viewport/high-priority images, `document.fonts.ready`, active finite Web Animations, and route content without the existing loading/busy markers.
- Updated the transition label to “Preparing page & 3D visuals” (Arabic: “جاري تجهيز الصفحة والمجسمات”).
- Infinite background/orbit/marquee animations are deliberately excluded from completion checks because they do not have a natural end. The curtain waits for initialization and finite entrance animation completion, not for ambient loops to stop.
- Preserved `prefers-reduced-motion`: users who request reduced motion do not get the full-screen transition.

## Device behavior

On capable fine-pointer desktop devices, the destination's laid-out WebGL scenes are prepared under the curtain before reveal. On touch-first and constrained devices, the current project intentionally uses the scene-specific CSS visuals rather than loading React Three Fiber/Three.js. This maintains the existing mobile performance strategy.

## Verification

- `scripts/verify-source.mjs`: PASS (129 parsed source files, 293 local imports checked).
- `node --check scripts/verify-source.mjs`: PASS.
- `node --check next.config.js`: PASS.
- A production build and browser/Lighthouse run were not performed in this environment because the archive does not contain `node_modules`. Re-run `npm ci`, `npm run build`, and test real route transitions before deploying.

## Known boundary

This waits for all *laid-out* scene components and critical images; off-screen lazy content that is not currently in the DOM, images intentionally deferred until scroll, and infinite ambience are not treated as unfinished page navigation. The 45-second failsafe prevents a broken chunk or scene from permanently trapping the visitor.
