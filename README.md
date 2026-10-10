# Archai Showcase

A bilingual (Arabic RTL / English LTR) portfolio for Archai Integrated Systems, built with Next.js App Router, TypeScript, Tailwind CSS, and Supabase.

## Features
- Server-rendered home, category, and project-detail routes.
- Arabic/English locale routing with RTL-aware layout.
- Supabase-backed projects, categories, technologies, industries, and site settings.
- ISR caching with authenticated cache invalidation after admin edits.
- Search, category/technology filters, featured project slider, gallery, SEO metadata, sitemap, and robots rules.
- Responsive dark-first design system with animated constellation particles, ambient motion, and reduced-motion support.
- Admin is implemented natively with the Next.js App Router under `src/app/admin`.

## Project layout
```text
src/
  app/                 Next.js routes and global styles
  components/          Shared React UI components (TSX)
  lib/                 Supabase access, i18n, domain types
  middleware.ts        Locale routing
public/
  admin/               Next.js admin routes and components
  assets/              Public assets and logo
supabase/
  01_setup.sql         Creates/updates schema, RLS policies, functions and Storage bucket settings
  02_make_admin.sql    Promotes an existing Auth user to admin
docs/
  ARCHITECTURE.md      Architecture and conventions
  DESIGN-SKILLS.md     Design references and agent-skill setup
```

## Local setup
1. Install Node.js 20 or newer.
2. Create a Supabase project.
3. Copy `.env.local.example` to `.env.local` and set:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` (publishable/anon key only; never use `service_role`)
   - `NEXT_PUBLIC_SITE_URL`
5. In Supabase Dashboard, open **Authentication → Users → Add user** and create `admin@gmail.com` with a strong password; enable email confirmation/confirm the user.
6. Run `supabase/01_setup.sql` in the SQL Editor.
7. Run `supabase/02_make_admin.sql` to grant the existing user the admin role.
8. Open `/admin/login` and sign in.
9. Install and run:
   ```bash
   npm install
   npm run dev
   ```
8. Validate before deployment:
   ```bash
   npm run typecheck
   npm run build
   ```

The site is available at `http://localhost:3000`; locale middleware routes to `/ar` by default or `/en` when selected.

## Deployment
Deploy to Vercel or another compatible Next.js host. Configure the same environment variables in the hosting provider. Do not add secret service-role keys to `NEXT_PUBLIC_*` variables.

## Analytics opt-out
To opt out of anonymous page-view tracking in the current browser:
```js
localStorage.setItem("archai:notrack", "1");
```

## Supabase SQL install order

Only two SQL files are included:

1. **`supabase/01_setup.sql` — install/repair schema:** run this first on a new project or when updating the database structure. It is designed to be rerun and does not delete your project data or Storage files.
2. **Create the Auth user in the Dashboard:** go to **Authentication → Users → Add user**, use `admin@gmail.com` (or change the email in `02_make_admin.sql`), set a strong password, and confirm the email.
3. **`supabase/02_make_admin.sql` — assign admin role:** run this after the Auth user exists. It only inserts/updates `public.profiles`; it does not write to Supabase-managed `auth.users` or `auth.identities`.

There is intentionally no SQL cleanup script. Supabase Storage files must be removed through Storage UI/API, not with `DELETE FROM storage.objects`; direct SQL deletion can orphan the underlying files. For a clean reset, back up first and delete app data/objects using the appropriate dashboard/API workflows.

The scripts have been statically reviewed, but not executed against your hosted Supabase project from this environment. Never expose a `service_role` key in browser code.


## Company website expansion (2026)

The public website now includes bilingual, responsive company pages in both `/ar` and `/en`:

- `/[lang]/services` — software, business systems, AI, embedded/IoT, mobile and ongoing support.
- `/[lang]/industries` — industry-oriented solution examples.
- `/[lang]/about` — engineering principles and company positioning.
- `/[lang]/process` — discovery through launch and improvement.
- `/[lang]/insights` — a starter knowledge hub (static editorial cards, not a CMS-backed blog yet).
- `/[lang]/contact` — project inquiry entry points linked to the existing project brief flow.

The new marketing pages use CSS 3D transforms, orbital geometry, layered glass cards and motion effects without adding a heavy 3D runtime dependency. Motion is reduced when the visitor enables `prefers-reduced-motion`. The light theme was retuned for a neutral canvas, readable ink, white surfaces and a restrained violet/teal accent palette.

### Admin workspace improvements

- Arabic/English toggle inside the admin workspace, persisted independently from the public-site language.
- Light/dark theme toggle persisted through `localStorage.theme` and shared with the public site.
- Project search across bilingual titles, summaries, slug and URL; status and featured filters; CSV export; duplicate-as-draft action; publish/unpublish controls.
- Analytics presentation improvements and a content-health/tools page that reports missing bilingual summaries and missing cover images based on actual database records.
- Public marketing pages are included in the generated sitemap.

The content-health page is intentionally a data-quality check, not a claim of a security or performance audit. The Insights page currently contains static starter cards and needs a database-backed CMS if the team wants to publish and edit articles from the dashboard. The contact CTA currently uses the existing project brief flow; no new message-storage backend was added.

### Verification note

Static checks confirmed the JSON files are valid and the Next configuration parses. A full `npm run build` / dependency-backed typecheck could not be completed in this environment because `npm install` timed out, so run `npm install`, `npm run typecheck`, and `npm run build` locally before deploying.

## Premium experience upgrade (October 2026)

This revision adds a shared motion layer and stronger light-theme overrides, extra ambient 3D CSS geometry (rotating prisms and orbital rings), more deliberate hover/reveal animation, and reduced-motion support. The company navigation now includes three additional bilingual pages: Case Studies, Careers, and FAQ.

The admin workspace includes a keyboard command palette (`Ctrl+K` / `Cmd+K`) for quick navigation and a new **Content & SEO Audit** page at `/admin/seo`. The audit reads existing project records, flags missing Arabic/English title/summary and cover-image fields, calculates a simple completeness indicator, and exports the report to CSV. It is read-only and does not claim to measure Google rankings, Core Web Vitals, or indexing.

Validation note: source-level JSON/CSS brace checks and ZIP integrity checks were performed. A full TypeScript/Next.js production build was not run because this working environment has no installed `node_modules` and package downloads were unavailable; run `npm install`, `npm run typecheck`, and `npm run build` locally before deployment.

## Premium motion, 3D and SEO updates

- The homepage hero now mounts a real WebGL scene powered by Three.js + React Three Fiber + Drei. It is dynamically imported client-side so the server render does not depend on WebGL.
- Framer Motion powers the in-view accent animation; GSAP coordinates the hero entrance and card reveals. Motion is reduced when `prefers-reduced-motion` is enabled.
- A unified final design-token layer keeps the violet + mint identity consistent across dark/light themes and the marketing/dashboard surfaces.
- `src/lib/seo.ts` provides canonical URLs, Arabic/English alternate URLs, Open Graph, Twitter metadata, and index/follow directives for static marketing pages.
- `/sitemap.xml` includes localized marketing pages, active categories, and published projects. `/robots.txt` points crawlers to the sitemap and blocks admin/API paths.
- `src/app/opengraph-image.tsx` generates a branded social preview image. Organization, WebSite, CreativeWork, and BreadcrumbList JSON-LD are emitted where relevant.
- Set `NEXT_PUBLIC_SITE_URL` to the actual production origin in Vercel and `.env.local`. Do not leave the example domain in production if deploying to a different domain.

Install the added animation packages after extracting the project:

```bash
npm install
npm run typecheck
npm run build
```

SEO improvements establish technical foundations but cannot guarantee first-page rankings. Submit the deployed sitemap in Google Search Console and Bing Webmaster Tools, ensure real project content is complete, and monitor crawl/indexing reports after deployment.
