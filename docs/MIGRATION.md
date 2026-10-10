# Migration Guide — v2 → v3

## What changed

### Removed
- `src/app/styles/variables.css` (moved to minimal globals.css)
- `src/app/styles/motion-system.css`
- `src/app/styles/3d-system.css`
- `src/app/styles/motion-fx.css`
- `src/app/styles/brand.css`
- `src/app/styles/ambient.css`
- `src/app/styles/hero.css`
- `src/app/styles/light.css`
- `src/app/styles/next.css`
- `src/app/styles/premium-overrides.css`
- `src/app/styles/public-polish.css`
- `src/app/styles/admin.css`
- `src/app/styles/admin-enhancements.css`

### Added
- `src/app/styles/globals.css` (minimal — theme tokens only)
- `src/app/globals.css` (Tailwind component layer)
- `src/components/motion/*` (14 components)
- `src/components/visuals/*` (13 components)
- `src/components/marketing/*`
- `src/lib/motion.ts`
- `src/lib/structured-data.ts`
- `src/lib/storage.ts`
- `src/lib/theme-tokens.ts`
- `supabase/03_media_system.sql`

### Updated
- `tailwind.config.ts` (brand palette + animations)
- All `page.tsx` files (MarketingPage + 3D scenes)
- `Hero.tsx` (multi-layer parallax)
- `Header.tsx` (mega menu + command palette)
- `Footer.tsx` (3D hover + marquee)
- Admin pages (charts + Lucide icons)
- `package.json` (new dependencies)

## Migration steps

1. **Install new dependencies:**
   ```bash
   npm install
   ```

2. **Run the new SQL migration:**
   ```
   supabase/03_media_system.sql
   ```

3. **Update `tailwind.config.ts`:**
   Copy the new config from the repository.

4. **Delete old CSS files:**
   ```bash
   rm src/app/styles/{variables,motion-system,3d-system,motion-fx,brand,ambient,hero,light,next,premium-overrides,public-polish,admin,admin-enhancements}.css
   ```

5. **Replace `src/app/globals.css` and add `src/app/styles/globals.css`.**

6. **Update components:**
   - Replace `Hero.tsx`, `Header.tsx`, `Footer.tsx`
   - Replace `ProjectCard.tsx`, `Slider.tsx`, `Explorer.tsx`, `Gallery.tsx`
   - Replace all marketing pages
   - Replace admin shell + all admin pages

7. **Verify:**
   ```bash
   npm run typecheck
   npm run build
   ```

8. **Deploy:**
   - Push to Vercel
   - Resubmit sitemap
   - Test OG images on social media
   - Test admin login + media manager