# Archai Showcase — Architecture

## Runtime
- **Next.js 14 App Router** with route segments under `src/app`.
- **TypeScript** for application routes, React components, middleware, and data helpers.
- **Tailwind CSS 3** for utility styling; the brand layer remains in `src/app/styles/brand.css`.
- **Supabase** is accessed through the public anonymous key and Row Level Security. Never expose a service-role key in browser code.
- **ISR** caches project content for 60 seconds; the authenticated `/api/revalidate` endpoint invalidates the `content` tag after admin edits.

## Structure
```text
src/
  app/
    [lang]/                 Locale layout, home, category and project routes
    api/revalidate/         Authenticated content-cache invalidation
    admin/js/config.js/     Public runtime config consumed by the legacy admin UI
    styles/                 Global tokens, base styles, and brand layer
  components/               Shared presentation and interaction components
  lib/
    data.ts                 Supabase queries and caching
    i18n.ts                 Locale, translations and safe URL helpers
    supabase.ts             Shared environment/configuration
    types.ts                Shared domain types
  middleware.ts             Locale routing
public/
  admin/                    Existing admin dashboard assets
  assets/                   Public brand assets
supabase/
  01_setup.sql              Database schema and policies
  02_make_admin.sql         Promote an existing Auth user to admin
```

## Conventions
- Keep route-specific data loading in server components and reusable UI in `src/components`.
- Keep Supabase server queries in `src/lib/data.ts`; avoid duplicate query logic in pages.
- Add shared domain models to `src/lib/types.ts`.
- Keep language-aware text behind `pick()` and `tr()` and set both `lang` and `dir` at the root layout.
- Keep animation decorative and non-blocking; honor `prefers-reduced-motion`.
- Use CSS logical properties for RTL-compatible spacing and positioning.
- Run `npm install`, `npm run typecheck`, and `npm run build` before deployment.
