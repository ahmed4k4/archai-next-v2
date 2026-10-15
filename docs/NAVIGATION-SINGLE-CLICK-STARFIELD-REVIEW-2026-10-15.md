# Single-click Projects Navigation + Galaxy Background Review (2026-10-15)

## What changed

- Primary localized links in `Header.tsx` now delegate navigation exclusively to Next.js `<Link>`. The previous custom path called `preventDefault()` and then `router.push()` for a regular click. This has been removed from the primary links, so Next Link has exactly one navigation owner.
- Removed eager project-route prefetch at header mount. Primary links now use `prefetch={false}` and prefetch only on hover, focus, or touch intent. This avoids doing catalogue work for every visitor before they intend to open it.
- Dropdown and mobile menu link handlers only close the relevant menu; they do not cancel native Next Link navigation. Modifier-click / open-in-new-tab behavior remains browser-native.
- Increased star density slightly (380/760/1320 to 430/820/1420 before low-power reduction), and increased meteor frequency while keeping simultaneous meteors capped at 2 on low-power/small phones and 3 on larger screens. Paired meteors remain occasional.
- Updated `scripts/verify-source.mjs` so regression checks match the new native-link/prefetch-on-intent implementation and the adjusted galaxy density/cadence.

## Validation performed

- `node scripts/verify-source.mjs`: PASS — 127 source files parsed and 293 local imports checked.
- Focused static regression checks: PASS for native Link ownership, no `preventDefault()` in the primary nav link, no eager route prefetch at header mount, mobile menu closure without canceling navigation, increased star density, and bounded meteor cadence.
- Full `tsc --noEmit` / `next build`: NOT VERIFIED in this environment. The package install stalled due registry/network availability and left incomplete type declarations/binaries; the resulting TypeScript diagnostics were missing installed type packages, not actionable application type errors.
- Browser interaction test: NOT RUN. The project source can be inspected and statically validated here, but an actual browser session with the installed Next.js runtime was unavailable.

## Why this is the focused fix

The public `/[lang]/projects` route exists, its loading skeleton and route error boundary exist, and the project route data path has timeout/fallback protection. In the shared header, however, navigation was intercepted manually by calling `preventDefault()` and then pushing with the router. Moving the primary link back to the framework's built-in navigation removes this unnecessary interception path. The source check passes, but the first-click behavior still requires a real browser test to confirm against the user's runtime and browser extensions.
