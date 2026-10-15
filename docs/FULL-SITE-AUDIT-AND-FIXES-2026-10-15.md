# Archai Website — Full Source Review and Fixes

**Review date:** 15 October 2026  
**Scope:** Next.js App Router website, Arabic/English pages, CMS/dashboard integration, project navigation, SEO, mobile layout/performance, 3D readiness and loading behavior.

## Changes made in this pass

### Navigation and first-click behavior

- Replaced the remaining internal project archive/card CTA paths that used full-document navigation with Next.js `Link` navigation.
- Main navigation and the home project CTA prefetch the projects route so its first open is less likely to be a cold request.
- Project cards prefetch the first row automatically and trigger prefetch on pointer/touch intent for the remaining cards, avoiding the bandwidth cost of prefetching every detail route on a long mobile archive.
- Route transition starts in the capture phase on the user's click; Next.js still owns the actual navigation, so the animation does not cancel or duplicate link behavior.
- The transition has a short fail-safe if a click does not change routes, then a fresh content-readiness window after the destination pathname is active. This gives the destination content, above-the-fold images and visible 3D scenes a chance to load behind the curtain.
- Removed the hidden initial state from the route wrapper. Direct page visits now render visible route content immediately instead of depending on hydration to reveal the whole page.
- The transition still has a watchdog so a failed request or stalled WebGL scene cannot leave a full-screen overlay stuck indefinitely.

### Loading and 3D performance

- Added a lightweight localized loading skeleton for route-segment fallback; the projects index and project details keep their more specific skeletons.
- Route-change preloading limits 3D preparation to visible or near-viewport visuals instead of mounting all below-the-fold canvases at once.
- Existing mobile safeguards remain in place: reduced hover transforms on touch, lower mobile canvas pixel ratios, reduced-motion handling, responsive spacing/type, and bounded star/meteor rendering.
- Missing favicon/apple-touch icon references were removed from localized metadata; the existing `/icon.svg` is the declared icon.

## Dashboard / CMS coverage verified in source

The source has working edit paths for these core company data groups:

- **Website settings:** company/brand name and taglines, logo URL, site title, Arabic/English home title/description, default SEO image, contact information, social profiles, footer copy, experience count and navigation links (labels, order and visibility).
- **Homepage:** section visibility, hero copy/CTA, key lists and overview groups, homepage project CTA, technology stack and focus section overrides.
- **Page copy by locale:** eyebrow/title/accent/description, CTA labels and destinations, outro copy, card sets, structured section fields and SEO title/description for the supported page keys. The About page’s capability highlights now have a normal visual editor (add/edit/remove, up to eight cards) and persist independently for Arabic and English; database rows without overrides are initialized from the localized on-screen defaults in the editor.
- **Projects:** published/draft state, slug, Arabic/English title and summary, category, sorting/featured order, technologies, industries, live URL and media roles/gallery.
- **Categories:** localized names/descriptions, slug, active state and order.
- **SEO audit:** missing project/page title, description, image, publication and metadata checks; score/filter/export tooling.

After settings, page-content, project, category or media changes, dashboard code calls `/api/revalidate`. The endpoint validates the Supabase user and admin role before invalidating the `content` cache tag and root layout cache. This preserves public-page caching without relying only on the 5-minute cache expiry.

**Important scope note:** the CMS controls the core company copy and records, but it does not convert every implementation detail into database data. Structural page layouts, CSS, localization fallback strings, the actual 3D models/animation code, reusable UI labels and route definitions remain source-controlled. Visual choice can be overridden for supported 3D sections, but arbitrary new layouts still require code changes.

## SEO source review

- Localized metadata exists for the homepage, core marketing pages, project archive, project detail, categories and case studies.
- `pageSeo` / localized layout metadata cover canonical URLs, Arabic/English language alternates, Open Graph, Twitter cards, metadata image fallback and robots directives.
- `sitemap.ts` includes Arabic and English core pages plus published database projects and active categories; project sitemap entries use lightweight cover/hero images rather than full gallery payloads.
- `robots.ts` references the sitemap and blocks admin/API surfaces and query-parameter variants from crawling.
- Organization/Website and page-specific structured-data helpers are present across relevant routes.
- Legacy aliases are redirect routes and are intentionally not emitted as canonical sitemap entries.

## Source checks

- `npm run verify:source` — **PASS** after the changes: 128 source files parsed, 293 local imports checked, and the source-level route/CMS/mobile/3D safeguards passed, including a new guard for dashboard-managed About highlights.
- `npm run typecheck` — **BLOCKED by the extracted environment**, not reported as a code pass. The mounted `node_modules` tree contains empty/missing type-definition directories (including React, Node and several D3/Three dependencies); TypeScript returns TS2688 for those definitions.
- `npm run build` — **not verified** for the same dependency-installation limitation.
- Browser-based functional testing, mobile device screenshots, Lighthouse/Core Web Vitals and a live Supabase-authenticated edit/publish test were **not run in this environment**. Do not interpret the source verifier as a substitute for those tests.

## Final production checks recommended

On a machine with the project dependencies installed and valid environment variables:

```bash
npm ci
npm run verify:source
npm run typecheck
npm run build
npm run start
```

Then test first-click navigation from desktop header, mobile drawer, hero CTA, home projects CTA, case-studies CTA, project cards and the command palette. Test direct URL loads as well as client navigation in Arabic and English. Check at 320, 360, 390, 430, 768 and desktop widths; inspect no horizontal overflow, open dropdown/drawer behavior, keyboard focus, reduced motion, image loading and 3D fallback. Re-run Lighthouse on representative Arabic/English home and project routes and validate the live sitemap/robots plus metadata with Search Console or an SEO crawler.
