# Archai project repair report — 2026-10-14

## Implemented

- Parallelized public projects page CMS copy and portfolio reads to reduce sequential server wait time.
- Increased public portfolio and page-copy cache revalidation to 300 seconds; dashboard edits still invalidate the shared `content` cache tag.
- Disabled speculative prefetch for each portfolio detail/category card, avoiding background navigation requests for every card.
- Fixed Framer Motion reduced-motion initial values which could animate opacity from an undefined state.
- Added mobile-aware 3D preloading: desktop continues to prepare visual scenes under the transition curtain; phones prepare only scenes near the viewport and defer off-screen WebGL contexts until near use. Reduced the animation curtain failsafe deadline for mobile and desktop.
- Reduced animated star counts and capped phone starfield redraws at 30 FPS (40 FPS for mid-sized screens; desktop up to 50 FPS).
- Improved the projects archive phone layout: smaller hero 3D, full-width filter controls, stronger touch targets, reduced glass blur cost and overflow safeguards.
- Reduced admin live-visitor polling from once per 15 seconds to once per 60 seconds, pause while hidden, skip overlapping calls, and preserve the last value on network errors.
- Added the `visitor_sessions(last_seen_at)` index to setup SQL to support the rolling five-minute count filter. Existing deployed databases must run the idempotent index statement once if absent.
- The projects error boundary shows the underlying error message only in development; production errors remain generic.

## Console messages supplied by the user

- `Fast Refresh had to perform a full reload` is a development hot-reload warning, not by itself a runtime failure.
- `cently:rd:site` and `redirectionChainSiteScript.js` come from a browser extension trying to patch `window.location`; they are not sourced from this app's files. Test with extensions disabled/incognito if navigation still fails.
- `ws://127.0.0.1:5500/ws` points to a Live Server/WebSocket reload service on port 5500, not the Next.js app. Run this Next project on its own development server (normally port 3000) and don't open the page using Live Server.
- The Framer Motion `opacity from undefined to 1` warning was addressed in the reduced-motion/scroll animation initial states.

## Supabase usage notes

- Fewer refreshes, 5-minute server cache, no speculative project-page prefetch and lower-frequency admin polling reduce avoidable app requests and some PostgREST/API log volume.
- The website cannot disable Supabase platform log types or change organization log quotas. Logs Ingest optimization requires inspecting the dominant source and optionally adjusting Custom Postgres Configuration (for example `log_statement=none` if raw SQL statements are not needed for auditing, and a higher `log_min_duration_statement` threshold if millisecond query logging is unnecessary). Keep useful error/security visibility enabled.
- Logs Query measures data scanned when querying Logs Explorer/Management API/CLI logs; it does not measure normal app SQL result volume. Reduce that metric by using a smaller time window and source/status filters, and avoid repeatedly polling logs.

## Test status

- `npm run verify:source`: PASS. The repository static verifier parsed 127 source files, checked 293 local imports and passed the project JSON, route, 3D readiness, CMS safety, mobile preloading, cache and polling guards.
- Direct TypeScript `transpileModule` parsing of all modified TypeScript/TSX files: PASS.
- Full `tsc --noEmit`, `next build`, and browser/device testing: NOT VERIFIED. Package installation (`npm ci`) stalled on registry access in this execution environment; the partial `node_modules` directory was removed from the delivery. These full checks must be run on a machine with dependency registry access.

## Retest locally

```bash
npm ci
npm run verify:source
npm run typecheck
npm run build
npm run dev
```

Check `/ar/projects` and `/en/projects`, a project detail route, browser back/forward, mobile widths 320/375/430 px, reduced-motion mode, and the browser console.


## 15 October 2026 follow-up

See `docs/3D-ROUTE-PRELOAD-FIX-2026-10-15.md` for the verified root cause and route-wide visual readiness correction. Static source verification passes; full Next.js build and browser/GPU tests still need to run with complete dependencies.
