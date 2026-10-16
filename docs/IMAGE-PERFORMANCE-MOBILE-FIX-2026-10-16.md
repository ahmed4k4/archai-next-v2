# Archai — Project images, performance, and mobile pass

Date: 2026-10-16

## Scope

This pass targets the missing/static project-card cover, the supplied PageSpeed Insights findings, and mobile layout/performance. It changes source files only; it does not deploy the website or change live Supabase data.

## Project card cover images

- The public project archive no longer asks the projects query to join `project_images`; this keeps optional media-schema differences from breaking the primary project result.
- Cover media is fetched separately, preferring `cover`, `hero`, and `featured` roles. If the newer `role` column is unavailable, the archive tries the older cover/hero/featured boolean flags. Projects still lacking a related cover and a scalar cover field are checked for a single gallery image as a final fallback.
- Image URL normalization supports public Supabase storage URLs, root-relative paths, and legacy storage object paths.
- Project cards use responsive `next/image` for local/Supabase public URLs, meaningful `sizes`, async/lazy decoding for the archive, and retain the visual placeholder only when the project has no usable image or the image request fails.
- The media manager marks the first uploaded image as `cover` if the project has no cover role, even if gallery images already exist.
- Media changes use the existing admin-authorized `/api/revalidate` path to clear the `content` cache tag.

Important: the live `/en/projects` archive currently exposes a published test-like record titled `5555` with summary `555`, and its extracted page shows the `ARCHAI / WORK` fallback. If this is the same card, the live project record appears to have no usable cover image attached. Code can now select an available media row, but a real project image must exist in the dashboard/storage and be assigned as Cover (the first upload now defaults to Cover when none exists). This source ZIP does not write to production Supabase data.

## Performance work

- Replaced the shared 768x768 PNG logo in public-facing brand fallback paths with a 256x256 WebP. Asset size: 195,171 bytes PNG → 12,826 bytes WebP (about 93.4% smaller). Existing CMS values ending in `/assets/logo.png` resolve to the optimized WebP.
- Project cards no longer need Framer Motion wrappers for basic hover transforms; those effects are CSS-only and reduced on small screens.
- Scroll-progress and cursor-glow effects use a single `requestAnimationFrame` DOM transform write rather than a per-frame React/framer-motion update.
- Footer marquee uses CSS keyframes, with fewer repeated DOM nodes, and stops when reduced motion is requested.
- Lenis and GSAP are imported only as deferred desktop enhancements, rather than participating in the first paint. Cleanup cancels the scheduled GSAP import setup.
- WebGL scenes only become eligible after deliberate user input (pointer-down, wheel, or keyboard), not ordinary pointer movement. A shared queue serializes scene bootstraps so all canvases do not initialize together.
- Mobile/coarse-pointer/low-resource devices keep the CSS artwork rather than importing Three.js scenes. Mobile glass surfaces disable backdrop blur. Auxiliary text contrast was increased.

These changes specifically target the report's 19,150ms desktop TBT, many long tasks, unused JS, and oversized logo. They are intended to reduce the sources of work; no post-change Lighthouse score has been measured in this environment.

## Supplied PageSpeed baseline

- Desktop: Performance 67, Accessibility 96, Best Practices 100, SEO 100; FCP 0.3s, LCP 0.4s, TBT 19,150ms, CLS 0, Speed Index 1.9s.
- Mobile: Performance 93, Accessibility 96, Best Practices 100, SEO 100; FCP 1.4s, LCP 2.8s, TBT 0ms, CLS 0, Speed Index 4.3s.

The largest reported issue was desktop JavaScript/main-thread blocking rather than initial FCP/LCP. Mobile remains focused on keeping the first viewport stable and lightweight.

## Source checks

`NODE_PATH="$(npm root -g)" npm run verify:source`

Result: PASS — 129 source files parsed, 294 local imports checked, including syntax, local imports, project JSON, 3D readiness, CMS safety, navigation, responsive image loading, low-power visual fallbacks, and polling safeguards.

## Not verified here

- `npm run typecheck`, `npm run build`, production browser screenshots, actual image loading against Supabase, and a new PageSpeed Insights run were not completed. The supplied environment had a partial `node_modules`, and dependency installation timed out while resolving the package registry. Therefore do not read this report as a guarantee of a particular Lighthouse score.
- Before merging/deploying, run `npm ci`, `npm run verify:source`, `npm run typecheck`, `npm run build`, and a new PSI/Lighthouse mobile + desktop audit.
- Deploy the ZIP's source to the intended Vercel project; the deployed site does not change until a new deployment is published.
