# Archai navigation first-click hotfix + starfield refinement

## Focused cause addressed

The public desktop navigation uses animated, absolutely positioned dropdowns adjacent to the Projects link. During `AnimatePresence` exit, an outgoing dropdown can remain mounted for its exit duration and continue to participate in hit-testing. This can intercept a rapid click on the neighboring Projects link. The dropdown exit targets now disable pointer events immediately.

The primary localized navigation links now handle an ordinary left click explicitly through `router.push`, while modified clicks (Ctrl/Cmd/Shift/Alt or non-primary buttons) retain native browser behavior. The shared navigation handler closes open menus before routing. Mobile navigation links use the same handler. The Projects route is also prefetched when the public header mounts, in addition to pointer/focus/touch intent prefetch.

This is a code-level fix aimed at the reported first-click symptom. An interactive browser pass is still required to verify the issue is resolved on the user's exact setup.

## Starfield changes

- Increased meteor cadence slightly: desktop 1.2–2.25 seconds, mobile 1.6–2.8 seconds, low-power devices 2.45–3.8 seconds.
- Increased the chance of a staggered meteor pair from 22% to 28%.
- Preserved the cap at three concurrent meteors (two on low-power devices), current reduced-motion support, tab-visibility pause, and 2D Canvas rendering to avoid extra WebGL/GPU contexts.
- The shared background still populates the full viewport; the CSS star texture and animated Canvas layer remain separate.

## Verification

- `node scripts/verify-source.mjs`: PASS — 127 source files parsed, 293 local imports checked, all source guardrails passed.
- Syntax transpilation of touched TSX source: PASS through the repository verification script.
- Full Next.js typecheck/build and browser click testing: NOT RUN here because this extracted source copy does not have project `node_modules` / `next` installed. Do not treat static source checks as a replacement for local build or browser confirmation.

## Recommended test

1. Start `npm run dev` and open `/ar`.
2. With the mouse over the Company dropdown, move to Projects and click immediately while it is closing; the Projects route should open on the first click.
3. Test Projects from the mobile drawer with one tap.
4. Confirm Ctrl/Cmd-click still opens links in a new tab.
5. Confirm the meteor cadence is visibly increased without continuous overcrowding, and test with reduced motion enabled.
