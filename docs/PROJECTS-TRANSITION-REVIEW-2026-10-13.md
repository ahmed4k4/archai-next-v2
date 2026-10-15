# Archai Showcase — Project Archive & Route Transition Review

Date: 2026-10-13

## Changes in this pass

### Project archive reliability
- Removed the `slug` dependency from the last-resort project listing select. The schema-minimal selection now requests only `id`, bilingual titles/summaries, and `live_url`.
- Project detail lookup now attempts a human-readable slug first and separately attempts an ID if the slug query returns no row **or throws**. Older schemas without a `slug` column therefore do not skip the ID lookup.
- Normalized category identifiers to strings when building category maps, matching projects to categories, and deciding if a project category exists. This protects the explorer from mixed UUID/string identifier types.
- Bumped the cached home-data key so a deployment does not accidentally reuse a prior result after the schema compatibility change.
- Kept the existing fallback catalogue, published database records, project archive error boundary and loading states. Database-backed admin editing still requires a properly configured Supabase schema and read permissions.

### Route transitions and 3D preparation
- While the transition curtain covers the incoming route, `LazyVisual` receives the preload context and mounts scenes that would normally wait for scrolling.
- The route controller observes the streamed route DOM and tracks the current responsive set of 3D scene instances. It adds newly mounted scenes and removes scenes no longer present, so a stale instance cannot hold the transition open.
- The reveal waits for the route-ready marker, DOM quiet period, available fonts, critical in-viewport/high-priority images, and the first rendered frame/error state from every participating scene.
- A bounded timeout remains as a failure-safe for WebGL/chunk errors; it intentionally avoids trapping the visitor behind the curtain forever.
- Off-screen scenes remain mounted but switch to demand rendering while outside the viewport, reducing continuous GPU work.

### Visual experience
- The prior visual refresh is preserved: a cleaner planetary hero with a restrained orbital system, a shared moving star/meteor Canvas background, reduced-motion handling, and less visually noisy linework.
- The catalogue stays separate from the homepage, with bilingual pages at `/ar/projects` and `/en/projects` and individual project detail URLs.

## Source verification performed

- 109 TypeScript/TSX/JS source files parsed through the installed global TypeScript transpiler: 0 syntax diagnostics.
- Local relative and `@/` imports audited: 0 missing paths found.
- Ten static localized sitemap page routes compared to their local route files: 0 missing page files.
- Confirmed project index, project detail, category route, project loading/error boundaries, 10 `next/dynamic` scene entries and Chrome DevTools well-known file exist.
- `package.json`, `package-lock.json` and `tsconfig.json` parse as JSON; root direct dependencies match between `package.json` and lockfile.

## Build verification limitation

A full `npm run typecheck` / `npm run build` could not be completed in this execution environment because `node_modules` is absent and package registry access is unavailable. `npm run typecheck` reports missing React/Next.js and type packages; `npm run build` stops with `next: not found`. Static source parsing is not a substitute for a successful Next.js build or an interactive browser pass.

## Reference sitemap limitation

The local sitemap implementation (`src/app/sitemap.ts`) was compared to the local route tree. The requested external XML sitemap at `https://archai-website-navy.vercel.app/sitemap.xml` could not be parsed by the available web fetcher because it responds as `application/xml`, and the referenced live page paths were not accessible to the fetch tool. Thus this pass does **not** claim to have crawled every live reference page. The local page content remains aligned to the routes implemented in this repository.

## Recommended local validation

```bash
npm ci
npm run typecheck
npm run build
npm run dev
```

Then check `/ar/projects`, `/en/projects`, a project detail opened by slug and ID, search/category/technology filters, mouse-wheel scrolling, browser back/forward navigation, first-load transition, and a route with several 3D scenes. Verify the Console and Lighthouse on desktop and mobile before deployment.
