# Archai — Typecheck, dashboard data compatibility, and 3D loading fix

Date: 2026-10-16

## Fixed TypeScript errors from the reported build

Files:
- `src/app/admin/seo/page.tsx`
- `src/app/admin/tools/page.tsx`

Both screens first query the newer `project_images` schema, which includes `role`. If the schema is older and that query fails, the fallback query does not select `role`. TypeScript correctly rejected assigning that legacy result to the newer inferred row type. The fallback now normalizes legacy records by adding `role: null` before assigning them, preserving compatibility with old schemas without changing the database.

The `npm run start` error was downstream of `next build` failing type validation. `next start` requires a successful production build; it is not an independent runtime error. Run `npm run build` successfully before `npm run start`.

## 3D scene startup

File: `src/components/visuals/LazyVisual.tsx`

Previously, desktop WebGL scenes did not become eligible to load until the visitor clicked, scrolled, or pressed a key. After that, another 1.2–1.6 second delay was added. That explains why the page and its fallback art appeared first while the real scene arrived much later.

The scene now starts preparing when its placeholder intersects the viewport, with a short delay (140 ms normally, immediately during a route-preload transition), using `requestIdleCallback` with a bounded timeout where available. The existing serial preparation queue remains so multiple WebGL canvases do not initialize simultaneously. The lightweight CSS visual still renders immediately. Touch/coarse-pointer and low-resource devices intentionally keep the CSS visual rather than downloading/booting full Three.js scenes, to protect mobile responsiveness, battery and main-thread performance.

## Validation

- `node scripts/verify-source.mjs`: PASS (129 source files parsed; 294 local imports checked).
- `next.config.js` parses, and the Supabase public-storage URL pattern matches the supplied image URL.
- Full `tsc --noEmit` / `next build` could not be confirmed in this environment because dependency installation did not complete and required type packages (React, Node and d3 types) are absent. Re-run `npm ci`, `npm run typecheck`, and `npm run build` on the development machine. Do not run `npm start` until the build passes.
- No new PageSpeed/Lighthouse measurement or physical-device visual test was performed in this pass. The loading behavior is improved in source, but the actual performance score must be measured after a successful build/deployment.

## Dependency audit note

The 9 reported `npm audit` vulnerabilities and the deprecation warnings for `three-mesh-bvh@0.7.8` and `recharts@2.15.4` are separate from these two TypeScript errors. Do not use `npm audit fix --force` blindly on this app; it can introduce breaking upgrades. Inspect `npm audit` output and plan major upgrades separately with regression tests.
