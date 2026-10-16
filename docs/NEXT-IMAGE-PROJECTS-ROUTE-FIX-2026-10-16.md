# Projects route crash — Next Image configuration fix

## Root cause

The repository had `next.config.cjs`. Next.js 14 does not support the `.cjs` extension for its project config, so Next could ignore the file entirely. That meant its `images.remotePatterns` allowlist was not active, and a Supabase project-cover URL passed to `next/image` could throw `Invalid src prop` while rendering the project archive, taking the page down.

## Changes

- Renamed `next.config.cjs` to the supported `next.config.js` filename.
- Added an explicit allowlist entry for `btseevpvtxpuvxlmvzkt.supabase.co` on HTTPS and `/storage/v1/object/public/**`.
- Kept the restricted `**.supabase.co` public-storage pattern for other Supabase projects, also limiting it to HTTPS and the public object path.
- Updated `scripts/verify-source.mjs` to require the supported config filename and to fail if the production Supabase image host allowance is removed.
- Kept the existing responsive project image sizing and lazy loading in `src/components/ProjectCard.tsx`.

## Deploy steps

Redeploy the project from this source so Vercel rebuilds Next.js using `next.config.js`. A previously deployed immutable build will not pick up local config edits until redeployed.

## Validation limits

The source/config assertions can be checked locally, but a fresh `npm ci`, `next build`, and live PageSpeed run must be completed with dependencies installed. Do not treat this fix as a newly measured Lighthouse score.
