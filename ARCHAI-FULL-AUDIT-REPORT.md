# Archai Website — Full Content, Navigation, SEO & Performance Audit

## Summary

This revision consolidates the current source changes for the Archai corporate showcase. It focuses on the recurring first-click `/projects` issue, ensuring the dashboard is the practical editing surface for public page copy, and reducing avoidable Supabase payloads. This is a source-level review; it is **not** a claim that production Supabase or real-browser tests have passed.

## Changes included

### 1. Single-click navigation to Projects

- The canonical archive link in the desktop header uses a native anchor for `/{lang}/projects`. This intentionally uses a full document navigation for this one route as a deterministic fallback around the recurring App Router / transition interaction issue. Other site routes keep their existing Next.js Link transitions.
- The homepage projects CTA and project-related CTA links in marketing/case-study pages use the same native-anchor fallback when their destination is the projects archive.
- The route-transition curtain is visually non-interactive (`pointer-events: none`), so it cannot swallow the initial click.
- Header link identity is stable, navigation intent prefetch is limited to hover/pointer/focus rather than warming routes on every render, and menu behavior does not call `preventDefault` or `router.push` on normal `Link` links.
- The admin SEO audit project link now opens the project editor at `/admin/projects?edit=<id>`. The editor reads that query parameter, opens the matching record, and scrolls to the form, rather than sending content editors only to the media page.

**Trade-off:** the Projects archive click performs a normal browser navigation instead of a client-side SPA transition. This is deliberate while the underlying first-click issue is being isolated. Test this route in the deployed/runtime browser before removing that fallback.

### 2. Dashboard-managed content coverage

- `/admin/settings`: company name, logo, taglines, website/home metadata, footer content, contact channels, social links, navigation labels/order/visibility, section visibility and project display limits.
- `/admin/content`: Arabic and English CMS rows for homepage, services, industries, about, process, insights, contact, FAQ, careers, case studies and project archive. Includes hero/heading/description, CTAs, closing copy, page SEO title/description, publication flag, cards and supported section settings.
- Homepage lists (capabilities, audiences, principles, process and FAQ) are edited through regular fields with add/remove controls. Cards on marketing pages can be edited through regular fields. The advanced JSON editor is retained for developer-only visual/configuration keys.
- `/admin/projects` and `/admin/categories`: database-backed project/category records; project edit deep-links from SEO audit are now supported.
- `/admin/seo`: checks bilingual CMS page metadata and project titles/summaries/covers and exports audit results to CSV. Its project links now open the project editor.
- CMS `seo_title` and `seo_description` are forwarded to page metadata. The Supabase cache invalidation route is called after content/settings saves.

**Boundaries to know:** internal interface labels, page layout/structure, detailed animation timings and exact 3D behavior remain code-owned; some advanced section and 3D scene values still live in the developer JSON mode. The `insights` page is currently a CMS-managed card hub, not a full long-form article publishing system with individual article routes. The careers page does not currently include a job application inbox/form. A dedicated lead-capture form/inbox is also not part of this patch and should be treated as a separate feature before relying on the site for production lead intake.

### 3. Query payload and runtime performance

- The homepage now reads the lightweight published project archive and site settings in parallel. It no longer loads every project gallery image just to count projects/categories for the hero and summary sections.
- Project-detail data and the lightweight related-project archive are requested concurrently by the detail route.
- `getProject()` attempts the full project record first; it loads the lightweight archive only for compatibility/fallback paths. This also fixes a stale reference to the removed `home` variable introduced during earlier query optimization.
- Sitemap generation uses the lightweight archive and only emits cover/featured/hero images, not full galleries.
- Existing cache windows, request deadlines, off-screen 3D render pausing, bounded transition curtain, reduced-motion handling and lower mobile star/meteor budgets are preserved.

### 4. SEO review

- Canonical URLs, Arabic/English alternates and `x-default`, title/description, Open Graph, Twitter large-image cards and JSON-LD remain wired through the SEO helpers.
- `robots.ts` disallows administrative/API paths and query-string variants and points to the sitemap.
- `sitemap.ts` lists the canonical bilingual company pages plus published categories/projects. Legacy alias/redirect paths such as `/blog`, `/technologies` and `/testimonials` are intentionally excluded.
- The dashboard SEO audit checks CMS page title/description, separate SEO title/description, publication status, project bilingual title/summary and cover image, and can export CSV.

Production SEO still depends on setting `NEXT_PUBLIC_SITE_URL` to the actual canonical production domain and checking the live sitemap/canonicals after deployment. The in-app SEO audit checks stored content completeness; it does not measure Lighthouse/Core Web Vitals, validate every live link, or prove Google indexing.

## Verification results

- `node scripts/verify-source.mjs`: **PASS**.
- The verifier reports **127 source files parsed** and **293 local imports checked**, and checks local import existence, source syntax, package-lock dependency-spec consistency, CMS safety guards, 3D readiness, project route navigation fallback, sitemap route existence/legacy aliases, and CMS/SEO wiring.
- Direct dependency specifications in `package.json` and the root `package-lock.json` dependency maps match.
- `npm run typecheck -- --pretty false`: **BLOCKED by the audit environment**, not a clean pass. The available `node_modules` is incomplete; TypeScript reports missing type definitions including `react`, `node`, `three`, and several D3 packages.
- `npm run build` and browser/device testing were **not verified** because the available `node_modules/.bin/next` binary is absent in this environment and package installation/network access did not complete. Do not treat source-verifier success as equivalent to a successful Next.js build.
- No production Supabase connection, credentials, or live browser session was available for runtime/RLS/visual tests.

## Deployment / database checklist

1. Keep `.env.local` out of source archives; configure `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and set `NEXT_PUBLIC_SITE_URL` to the real production origin.
2. If not already applied, review and apply Supabase migrations in order: `supabase/01_setup.sql`, the admin setup in `supabase/02_make_admin.sql` as appropriate to the actual admin account, then `03_media_system.sql`, `04_editorial_cms.sql`, and `05_dashboard_global_content.sql`. Back up the database first. Editorial seed rows use `ON CONFLICT DO NOTHING`, so the migrations preserve existing copy rather than replacing it.
3. In the project directory, run `npm ci`, `npm run verify:source`, `npm run typecheck`, and `npm run build` in that order.
4. Test `/ar/projects` and `/en/projects` via the header and every CTA on desktop/mobile, verify project detail pages, and inspect the browser Network/Console for runtime Supabase/RLS errors.
5. In production, verify `/robots.txt`, `/sitemap.xml`, canonical/hreflang URLs, Open Graph previews, Google Search Console coverage, and Lighthouse/Core Web Vitals before claiming production SEO/performance scores.

## Known outstanding checks

- The original two-click issue has been addressed at the source by forcing a normal document navigation for project archive links. It remains unverified in a real browser/deployment, so it cannot honestly be marked confirmed fixed yet.
- Supabase RLS, migrations, content data quality, credentials, and production DNS/domain configuration need confirmation in the actual project.
- Full TypeScript/build validation and real mobile/desktop runtime performance measurements remain outstanding until the dependencies and runtime are available.
