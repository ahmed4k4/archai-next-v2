# Archai performance and projects route fixes — 2026-10-14

## Code changes

- Projects page starts independent CMS-copy and portfolio-data reads concurrently.
- Public home/project/page-copy caches use a five-minute revalidation interval. Dashboard edits still trigger `revalidateTag("content")`, so successful edits invalidate the shared content cache immediately.
- Project detail/category links in the archive do not speculative-prefetch every detail route. This avoids background requests when a large portfolio grid is rendered.
- The admin live visitor count polls every 60 seconds instead of every 15 seconds, skips hidden tabs and avoids overlapping requests.
- The setup SQL includes an index on `visitor_sessions(last_seen_at)` for the live-count time filter. Existing Supabase databases must run this idempotent statement once if the index is not already present:

  ```sql
  create index if not exists idx_visitor_sessions_last_seen_at
    on public.visitor_sessions(last_seen_at);
  ```

- Phone screens use a smaller projects-page hero scene, stacked/touch-friendly filter controls, lighter glass blur, fewer background stars, and a 30 FPS target for the animated star canvas.
- Route transitions use a hard 1.65-second curtain deadline with a 0.28-second exit. The first near-viewport scene is prepared first (one scene on mobile, up to two on desktop); below-fold scenes keep a matching CSS fallback and mount when approached to avoid allocating many WebGL contexts at once.
- Fixed Framer Motion reduced-motion states that could animate opacity from an undefined start value.
- Development-only project-route error UI now shows the error message; production keeps the user-facing message generic.

## Supabase logs: what application code can and cannot change

- Reuse of cached public reads and less background polling reduce unnecessary application requests and some request-log volume.
- **Logs Ingest** also contains Supabase-generated Postgres, API gateway, Auth, Storage, Realtime, and Edge Function logs. Application code cannot directly disable those platform logs. Diagnose which log source is dominant before changing project logging settings.
- **Logs Query** measures data scanned by Logs Explorer/API queries, not the amount of SQL data selected by the website. Reduce it by querying shorter periods, filtering the source/service/status at query time, and avoiding repeatedly polling the same log range.
- If full SQL statement text is not needed for audit/compliance, review the Supabase Custom Postgres Configuration setting `log_statement` and consider `none`; only raise `log_min_duration_statement` after checking which query durations are currently logged. Do not disable security/error visibility just to lower a counter.

## Verification status

- `npm run verify:source`: PASS after changes (127 source files parsed, 293 local imports checked).
- Full TypeScript typecheck/build and browser interaction testing: NOT VERIFIED. `npm ci` stalled while trying to fetch dependencies from the package registry, leaving incomplete `node_modules`; those partial files are excluded from delivery.


## Follow-up hardening — projects route + two-second transition

- Route-transition curtain is hard-limited to 1.65 seconds before its 0.28-second exit motion. It never waits for all page 3D scenes, every image, or web fonts; CSS scene fallbacks allow the page to be usable immediately.
- Only the nearest one (mobile) or two (desktop) visual chunks are warmed while the curtain is visible. `LazyVisual` remains intersection-driven for the rest of the page, preventing many simultaneous WebGL contexts from stalling route entry.
- The project route's optional CMS copy has a 1.1-second fallback deadline, so an unresponsive `site_page_content` query cannot hold metadata/page rendering indefinitely.
- Server-side Supabase requests now have an 1.8-second abort timeout; the shared project/catalogue read has a 2.5-second outer deadline. If backend connectivity or RLS/schema queries fail, the route can render its existing clear database error state instead of waiting indefinitely.
- Homepage hero text reveals faster (0.42-second item motion with stagger delay capped at 0.28 seconds). The background planet orbit is slightly more legible while sphere/ring tessellation is reduced for lower GPU cost.
- Mobile home hero uses a smaller, shorter backdrop visual region instead of a full-screen narrow canvas.

## Follow-up verification

- `NODE_PATH="$(npm root -g)" node scripts/verify-source.mjs`: PASS after this pass (127 source files parsed, 293 local imports checked).
- Full dependency-backed TypeScript/Next build and browser testing remain unverified here because project dependencies are not installed and registry downloads previously failed. Do not treat source verification as a substitute for the build/browser pass.


## Follow-up — prepare every in-layout 3D scene before transition reveal

- Fixed a concrete logic regression: `RouteTransition` had `VisualPreloadContext.Provider value={false}` permanently, making LazyVisual's route-preload path unreachable.
- While a route curtain is active, every `data-lazy-visual` currently present in the responsive layout is now imported and mounted, including below-the-fold scenes. The reveal condition checks that every in-layout visual instance reports `ready` or `error`, rather than checking only the nearest hero scene.
- The curtain remains bounded at 1.65s plus a 0.28s exit animation, so it cannot hold navigation indefinitely on a slow GPU or failed WebGL context. Scene-specific HTML/CSS placeholders remain visible until each canvas is genuinely ready.
- `LazyVisual` avoids pre-mounting variants with zero layout size (e.g. the 3D strip hidden on mobile), and `Scene3D` remains demand-rendered while off-screen after its first readiness frame. This allows 3D content to be ready before scrolling without keeping its animation loop active outside the viewport.
- Verification checks now reject a hard-coded false preload context or a regression to visible-only scene preparation.
