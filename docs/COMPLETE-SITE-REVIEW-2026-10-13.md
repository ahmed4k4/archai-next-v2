# Archai Showcase — Complete Site Review

**Review date:** 2026-10-13  
**Scope:** Public bilingual site, project archive route, motion/3D loading, navigation references, SEO metadata and static source integrity.

## Main changes in this pass

- Moved the full project explorer off the homepage into the dedicated localized routes `/ar/projects` and `/en/projects`.
- The project archive has a localized hero, workflow scene, project search/category/technology filters, appropriate no-data/configuration states, localized metadata, CollectionPage + BreadcrumbList JSON-LD, and a route loading skeleton.
- Expanded the homepage with company capabilities, audience fit, engineering principles, delivery approach, three FAQs, and explicit calls to service, contact and the project archive.
- Replaced a “Trusted By Teams” marquee containing unverified brand names with a motion-led engineering capability ribbon; it no longer implies fabricated client endorsements.
- Refined the shared galaxy background with varying depth and tint, twinkle, subtle drift, a soft diagonal density band, and short meteor streaks with gradient tails and glowing heads. Motion pauses when the tab is hidden and respects reduced-motion preferences.
- The homepage hero is a restrained procedural planet with texture, cloud layer, Fresnel atmosphere, orbital paths, moon and limited accents; it avoids the old vertical data-stream motif and heavy hero-only post-processing.
- Page transitions use a full-screen branded curtain and a short page-content entrance. The curtain responds to the first visible 3D Canvas frame or a bounded timeout so the user does not wait for every lower-page WebGL scene.
- Added a loading skeleton for the project catalogue and connected the project route to the header and sitemap.
- Repointed links that previously targeted the removed homepage project section; the static audit found no stale `#list` / `#sl` anchors or literal hash-only links.
- Updated technical docs and `README.md` to reflect the current project archive and motion behavior.

## Static checks completed

- TypeScript parser: **107** project source files parsed; **0** parser diagnostics.
- Local import scan: **106** source files under `src`; **0** missing relative or `@/` local module paths.
- Localized page metadata scan: **13** localized `page.tsx` files; **0** missing `generateMetadata`/metadata exports.
- Next.js dynamic visual imports: **10** calls; all use inline object-literal options for `next/dynamic`.
- CSS parser: **2** CSS files; **0** parse errors.
- `package.json`, `package-lock.json`, and `tsconfig.json`: valid JSON; direct dependencies match the lockfile root.
- Link scan: **0** stale home project-section anchors, **0** literal `href="#"` references, **0** `_blank` anchor tags without `rel`.
- Project archive route, loading fallback, homepage CTA, and sitemap entry are present.

## Not claimed as verified

The package registry was inaccessible during this work session (`EAI_AGAIN` from `registry.npmjs.org`), so a complete dependency installation, `npm run typecheck`, and `npm run build` could not be completed. No browser-based regression session or Lighthouse run was possible here. Static parsing and path audits are useful guardrails but do not replace those tests.

## Recommended release validation

On a connected machine in the project root:

```bash
npm ci
npm run typecheck
npm run build
npm run dev
```

Then test wheel and trackpad scrolling, browser back/forward, `/ar/projects` and `/en/projects`, individual project details, all page-specific visuals, light/dark mode, reduced motion, mobile viewport behavior, Supabase configured/unconfigured states, and run Lighthouse on mobile and desktop.
