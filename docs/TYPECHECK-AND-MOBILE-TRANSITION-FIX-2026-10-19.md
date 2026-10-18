# Archai — TypeScript build blocker and mobile transition pass

Date: 2026-10-19

## Fixed source errors

`src/components/motion/RouteTransition.tsx`

- Replaced the invalid `animation.playState !== "pending"` comparison. The Web Animations API exposes `Animation.pending` as a boolean; `playState` is the union `idle | running | paused | finished` in the project's DOM typings.
- Converted computed `endTime` to a numeric millisecond value before comparing it with `currentTime`. Non-finite values are treated as settled rather than leaving the curtain waiting on an un-comparable timing value.
- Preserved the existing transition design: page fonts, critical images, finite entrance animations, and WebGL readiness remain gated, with a 45-second safety watchdog.

The `npm run start` message in the supplied log is a consequence of `npm run build` failing before `.next` was produced. It is not an independent runtime-server configuration error.

## Mobile polish

`src/app/styles/globals.css`

- Made the transition screen respect device safe-area insets.
- Kept the central mark and status label within the viewport on very narrow phones.
- Added a compact treatment for short, landscape touch screens.
- On small touch screens, removed the full-screen moving star-texture animation and heavy mark filter while retaining the central orbital animation. This limits needless full-screen compositing work without removing the branded transition.
- The existing app mobile guards remain intact: smaller hero typography, stacked CTA buttons, compact project filters, reduced glass/backdrop effects, and CSS scene fallbacks in place of forced mobile WebGL.

## Verification actually run

- `scripts/verify-source.mjs`: **PASS** — 129 source files parsed; 293 local imports checked; existing architecture contracts and new mobile transition checks passed.
- `node --check next.config.js`: **PASS**.
- `node --check scripts/verify-source.mjs`: **PASS**.
- A standalone strict TypeScript check of the specific Web Animations API expression that produced TS2367/TS2365: **PASS** using the global TypeScript compiler.

A full `npm run typecheck` and `npm run build` were **not completed** in this environment: `npm ci` could not reach `registry.npmjs.org` (DNS `EAI_AGAIN`). Thus, these source changes fix the two reported expressions, but a complete app build must still be confirmed in the user's Windows project. The failed `npm run start` should only be retried after `npm run build` succeeds.

## Dependency security remains a separate, high-priority task

The supplied install output says 9 vulnerabilities but does not include the package-by-package `npm audit` details, so it is not possible to claim that those findings have been remediated here. Do not use `npm audit fix --force` blindly.

The lockfile currently pins Next.js 14.2.35 and configures the image optimizer for AVIF/WebP. Official Next.js advisories published in 2026 identify critical image-optimization issues affecting versions in this range. The SVG optimizer advisory is patched in Next 15.5.28 / 16.4.1; the AVIF optimizer advisory is patched in Next 15.5.24 / 16.3.3. A coordinated framework/React upgrade and regression build is required; it was not silently applied here because it is a major-version migration and could change App Router APIs or chart behavior.

References:
- https://github.com/vercel/next.js/security/advisories/GHSA-2464-fhr4-w9xw
- https://github.com/advisories/GHSA-2xp9-vwfh-vxw4
- https://nextjs.org/docs/app/guides/upgrading/version-15

## Commands to run on the Windows project

```powershell
npm ci
npm run verify:source
npm run typecheck
npm run build
npm run start
```

If `npm run typecheck` / `npm run build` now reports different errors, resolve those before starting the production server. Then re-run Lighthouse on `/en` and `/ar` in mobile mode and inspect visual layout at 320px, 375px, 390px and a short landscape viewport. No new PageSpeed score or visual-browser pass is claimed by this patch.
