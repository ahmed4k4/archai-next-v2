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

