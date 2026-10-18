# Archai — dashboard, TypeScript, 3D loading, and responsive review

Date: 2026-10-16

## Fixed the two reported TypeScript errors

Files:
- `src/app/admin/seo/page.tsx`
- `src/app/admin/tools/page.tsx`

The modern `project_images` query selects `role`, but the compatibility fallback for older schemas does not. The inferred modern result type therefore rejected the fallback. The code now uses an explicit flexible row type and normalizes fallback rows with `role: null`. The tools page now declares the same row type, so the fix does not introduce an undefined `Row` type.

The `npm run start` error is downstream: Next.js only creates `.next` production output after `next build` completes. A successful `typecheck` and `build` must happen before `start`.

## 3D visual loading

File: `src/components/visuals/LazyVisual.tsx`

- The lightweight scene-specific CSS artwork still renders immediately as a fallback.
- Desktop scenes are eligible for automatic enhancement when near the viewport and the browser is idle; they no longer require a click, wheel, or keyboard action to begin loading.
- The existing preparation queue still serializes expensive WebGL scene initialization to avoid mounting several canvases at once.
- Capable touch devices can progressively load near-viewport 3D scenes after a short quiet window. Low-memory / low-CPU devices continue to use the fast CSS scene rather than paying the full Three.js startup cost. The queue still starts one scene at a time.
- The `data-visual-mode` attribute now correctly reports `webgl` after a scene is mounted.
- Route transitions still use the CSS placeholder and are not held hostage by WebGL readiness.

This approach follows Next.js dynamic-import guidance for deferring large client-side libraries and React Three Fiber's performance guidance about limiting rendering work on weaker devices. It is not a claim that a live Lighthouse score has already improved; that must be measured after deployment.

## Dashboard / responsive quality pass

File: `src/app/globals.css`

- Standardized helper text to theme-aware ink colors for dark and light themes.
- Improved focus visibility for dashboard filters, search fields, forms, command palette items, and actions.
- Kept inputs and dashboard panels within available width.
- Made dashboard header actions and summary cards more resilient on narrow phones.
- Reduced visual motion for users requesting reduced motion.

The earlier source review also includes explicit loading/error feedback for dashboard data requests and the project-image compatibility checks in the SEO/content audit tools.

## Checks

- `npm run verify:source`: PASS — 129 source files parsed and 294 local imports checked.
- `node --check next.config.js`: expected to pass for the current CommonJS config; rerun locally as part of validation.
- The environment's `npm ci` did not finish within the available execution window; `node_modules/next` and `node_modules/.bin/tsc` were not present after the interrupted install. Therefore `npm run typecheck`, `npm run build`, browser/device testing, and fresh Lighthouse scores were not confirmed here.

## Run on the development machine

```powershell
npm ci
npm run verify:source
npm run typecheck
npm run build
npm run start
```

Do not use `npm run start` until `npm run build` passes. Do not run `npm audit fix --force` without reviewing the dependency changes: the reported Recharts major-version deprecation and `three-mesh-bvh` warning are separate dependency-upgrade work that needs regression testing.

## Manual regression checklist

- Public pages: `/ar`, `/en`, `/ar/projects`, `/en/projects`, project detail pages, services, categories, case studies, FAQ, contact, and legal pages.
- Dashboard: login/logout, overview, projects, categories, media uploads, page content, site settings, SEO audit, tools, analytics, and theme/language switching.
- Test light and dark themes at 320, 375, 390, 430, 768, 1024, and desktop widths.
- Confirm a project cover using the Supabase public-storage URL loads and that a missing/broken image does not crash the page.
- Confirm the hero's CSS fallback appears immediately and the real 3D scene appears automatically on a capable desktop / phone without user input.
- Run PageSpeed on both mobile and desktop after deploying the successful production build.
