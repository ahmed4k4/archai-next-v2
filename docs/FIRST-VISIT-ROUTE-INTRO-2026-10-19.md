# First-visit route transition intro — 2026-10-19

## What changed

- The transition curtain now renders in the initial server-produced HTML, so the Archai intro is visible on a cold/direct page load rather than only after clicking an internal link.
- The first-load intro keeps the same theme-aware cosmic curtain, Archai orbital mark, label, status, and animated progress line used by route transitions.
- The initial route uses the existing readiness gate: critical viewport/high-priority images, document fonts, finite entrance animations, and mounted desktop WebGL scenes must be ready before the exit animation begins. Lightweight/mobile scenes remain CSS-based.
- A 45-second failsafe remains to avoid leaving a broken scene underneath the curtain forever.
- React Strict Mode effect replay is handled so development mode does not leave the initial curtain stuck.
- Visitors who request reduced motion do not get a blocking intro; the overlay is hidden by CSS before hydration and transition state is also disabled in the client.

## Validation

Run from the project root:

```powershell
npm run verify:source
npm run typecheck
npm run build
```

A visual browser run is still recommended after build, including a direct hard refresh on `/en` and `/ar`, navigation between pages, and a mobile viewport (360–390 CSS pixels). This patch does not claim a measured PageSpeed score.
