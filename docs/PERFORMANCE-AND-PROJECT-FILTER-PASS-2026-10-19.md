# Archai — Project filters and performance pass

**Date:** 19 October 2026

## Changes made

- Replaced the animated Framer Motion wrappers around the project archive filter bar and category headings with semantic HTML. This avoids pulling this animation behavior into the archive component just to animate a toolbar and headings.
- Restyled search, category, and technology controls with explicit surfaces, readable text, visible focus states, and native dropdown option colors for dark and light themes.
- Made the project filter bar use a solid theme-aware surface instead of a large sticky backdrop blur. On mobile it becomes a normal-flow filter block, so it does not consume a large sticky area or cover the project cards while scrolling.
- Added a polite live region for the filtered/total project count and ensured touch-sized controls remain at least 44–48px tall.
- Reduced the global starfield from 520 to 320 stars on wide displays and reduced its target drawing rate from up to 28 FPS to 22 FPS; lowered the maximum active meteors and reduced their frequency. The starfield still fills the viewport and continues to render the same visual concept.
- Reduced hero constellation particle counts and capped its target draw rate at 18 FPS to lower main-thread work.
- Delayed optional WebGL scene enhancement so the initial route paint and interactions get priority. CSS placeholders remain available immediately, while the 3D enhancement still loads automatically when eligible.
- Added a dedicated 64×64 WebP asset for the 40×40 header brand mark. The new asset is about 4 KB compared with the existing ~16 KB WebP source in this project snapshot.
- Expanded the static verification script to check the new filter styling and performance budgets.

## Source verification

Executed successfully:

```text
Source files parsed: 129
Local imports checked: 294
Syntax, local imports, project JSON, 3D readiness, CMS safety, mobile preloading, and polling checks: PASS
```

CSS parsing is included in `scripts/verify-source.mjs` and passed.

## Interpretation of the supplied PageSpeed report

The report shows FCP 0.3s and LCP 0.4s, but TBT 16,110ms and ~32.2 seconds of main-thread work. That pattern points to heavy post-paint JavaScript/graphics work rather than slow initial HTML or an oversized LCP image. The source pass above reduces some recurring canvas and animation work and postpones optional WebGL enhancement; it is not proof that the deployed score has improved.

## Not verified in this environment

- A production `next build` and full TypeScript check were not run successfully because this extracted project snapshot has no local `node_modules`. Running the global TypeScript compiler reports missing Next.js/React and other dependency type declarations, so those errors are environment/dependency errors and cannot be treated as a project typecheck result.
- No browser-based visual regression test or new Lighthouse/PageSpeed run was available after the edits.
- No live Supabase admin account or write operation was tested.

## Required validation after installing dependencies

From the project directory in PowerShell:

```powershell
npm ci
npm run verify:source
npm run typecheck
npm run build
npm run start
```

Only after a successful build, re-run PageSpeed for `/en`, `/ar`, and `/en/projects` on desktop and mobile. Compare TBT and long tasks as well as the score; if TBT remains unusually high, use Chrome Performance recording and a production bundle analysis to identify the exact task instead of assuming it is the CSS or image layer.
