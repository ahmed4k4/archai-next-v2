# Supabase SQL install guide

The SQL setup has been reduced to two files:

1. `supabase/01_setup.sql` — creates/updates Archai tables, indexes, triggers, RLS policies, functions, initial settings/categories, and the `project-media` bucket configuration. Safe to rerun; it does not reset project data.
2. `supabase/02_make_admin.sql` — promotes an already-created Supabase Auth user to `admin` in `public.profiles`. Run only after creating and confirming the user through Supabase Dashboard → Authentication → Users.

## Why the previous errors are fixed

- `storage.protect_delete()` / orphaned objects: removed the destructive SQL cleanup script. Do not delete rows directly from `storage.objects` or `storage.buckets`; use Supabase Storage UI/API so underlying files are removed correctly. The setup script only upserts bucket configuration.
- `confirmed_at` generated column: the admin script no longer writes to `auth.users` or `auth.identities`. Supabase Auth user creation/password management must go through the Dashboard or Auth Admin API. The SQL script only changes the app-owned `public.profiles` role.

## Run order

1. Create/select your Supabase project.
2. Run `01_setup.sql` in SQL Editor.
3. In Authentication → Users → Add user, create `admin@gmail.com`, set a strong password, and confirm the email. If that user already exists, do not create a duplicate.
4. Run `02_make_admin.sql`. Its final query should return `role = admin` and `email_confirmed = true`.
5. Sign in at `/admin/login`.

The SQL has not been run against the user's live Supabase instance in this environment, so confirm both scripts succeed in the actual SQL Editor.
