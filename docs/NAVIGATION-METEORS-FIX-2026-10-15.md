# Navigation first-click + starfield/meteor polish — 15 October 2026

## Navigation fix

- Moved the primary desktop navigation link from a component declared inside `Header` to a module-level `StableNavLink` component. The old component identity changed whenever `Header` re-rendered (including menu/scroll state updates), so React could replace the anchor underneath the pointer during a click.
- Corrected the active-link matcher to compare a full localized href (`/ar/projects`) against the current pathname and nested routes.
- Added route prefetch on pointer hover and keyboard focus for primary navigation, desktop company links, and mobile links.
- On touch devices, mobile navigation prefetches the route on `touchstart` and closes the drawer immediately on selection.

## Background polish

- Increased meteor cadence in a controlled way. Desktop interval is randomized between 1.4 and 2.75 seconds; mobile between 1.85 and 3.25 seconds; low-power devices use 2.7–4.3 seconds.
- Added rare, staggered meteor pairs and capped simultaneous meteors to 3 (2 on low-power devices).
- Slightly lengthened the tails/lifetime and raised head/ion-trail glow without adding WebGL or another animation loop.
- Added a subtle edge vignette in both dark and light themes to improve depth while keeping the full viewport starfield visible.

## Verification

- `npm run verify:source`: PASS — 127 source files parsed and 293 local imports checked; all current source guardrails pass.
- TypeScript syntax transpilation of `Header.tsx` and `GalaxyBackground.tsx`: PASS.
- Full TypeScript check / production build: NOT RUN successfully in this environment. `npm run build` reports `sh: 1: next: not found`; its `node_modules` snapshot is incomplete. The user's local install should be tested after applying the files.
- Browser interaction / visual motion test: NOT RUN in this environment, so the first-click fix is reasoned from the component remount hazard but still needs local runtime confirmation.

## Files changed

- `src/components/Header.tsx`
- `src/components/visuals/GalaxyBackground.tsx`
- `src/app/styles/globals.css`
- `scripts/verify-source.mjs`
