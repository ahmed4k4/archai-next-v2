# Archai Showcase — v3.0

A bilingual (Arabic RTL / English LTR) portfolio and company website for **Archai Integrated Systems**, built with:

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS** (utility-first, minimal custom CSS)
- **Framer Motion** (all animations)
- **GSAP** (advanced scroll choreography)
- **React Three Fiber + Drei** (real WebGL 3D scenes)
- **Supabase** (database, auth, storage, analytics)
- **Recharts** (admin dashboard charts)

---

## ✨ Features

### Visual identity
- **Unified brand palette**: Violet `#7c5cff` + Mint `#4ce2d0` with Rose `#ff6b9d` as accent
- **Two themes** (dark / light) using the same palette
- **Aurora background** with animated radial blobs
- **Scroll progress bar** across every page
- **Grid floor + scanline + noise** overlays

### Animation library
- **14 motion components** (`Reveal`, `Stagger`, `MagneticButton`, `TiltCard`, `Marquee`, `ScrollProgress`, `AnimatedNumber`, `PageTransition`...)
- **Tailwind keyframes**: float, spin, pulse, orbit, tumble, shimmer, gradient-flow, morph-blob, bubble-rise, scan
- **Framer Motion variants**: fade, scale, blur, rotate, text-reveal, flip, 3D card
- **Reduced-motion support** everywhere

### 3D scenes (10 unique)
Each marketing page uses a **different WebGL scene**:

| Page | Scene |
|------|-------|
| Home Hero | Multi-layer core + rings + shards + sparkles + particles |
| `/services` | MetallicPolyhedron |
| `/industries` | OrbitSystem |
| `/about` | ParticleGlobe |
| `/process` | DataStreams |
| `/insights` | GlassBubbles |
| `/contact` | AICore |
| `/case-studies` | CrystalCluster |
| `/careers` | NeonRings |
| `/faq` | CircuitBoard |

Extra in-page scenes (`Hero3DDisplay`): FloatingCards, plus reuses of the above across sections.

### Public pages
- `/ar` and `/en` home
- `/services`, `/industries`, `/about`, `/process`, `/insights`
- `/case-studies`, `/careers`, `/faq`, `/contact`
- `/categories/[slug]`
- `/projects/[id]`

### Admin panel
- **Dashboard** with KPIs, traffic chart (14 days), recent projects, quick actions
- **Projects** with search, status filter, featured filter, CSV export, duplicate-as-draft, publish toggle, **Media manager**
- **Media manager**: drag & drop upload, WebP compression, multi-image, role assignment (cover / hero / featured / gallery), drag-to-reorder
- **Categories** CRUD
- **Analytics**: traffic area chart, devices pie, sources pie, top projects bar, ranking list
- **Settings**: brand, homepage, media limits
- **Tools**: content health checks, quick links
- **Content & SEO audit**: per-project score with issue list, CSV export
- **Command palette** (`Ctrl+K` / `⌘K`)
- **Arabic / English** toggle
- **Dark / light** theme toggle

### SEO
- Full **JSON-LD** structured data: Organization, WebSite + SearchAction, BreadcrumbList, CreativeWork, OfferCatalog, HowTo, FAQPage, AboutPage, ContactPage, CollectionPage
- **Dynamic OG images** per language and per project (via `next/og`)
- **Canonical URLs** + **hreflang** (ar / en / x-default)
- **Sitemap** with images and alternates
- **Robots** with crawler-specific rules
- **Rich keywords** generated from project technologies + industries
- **Verification** hook for Google Search Console

---

## 🚀 Installation

### 1. Prerequisites
- Node.js **20+**
- A Supabase project

### 2. Setup environment
```bash
cp .env.local.example .env.local
```

Edit `.env.local`:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_KEY
NEXT_PUBLIC_STORAGE_BUCKET=project-media
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

### 3. Install dependencies
```bash
npm install
```

### 4. Create the admin user in Supabase
1. Go to **Authentication → Users → Add user**
2. Email: `admin@gmail.com`
3. Set a strong password
4. Confirm the email

### 5. Run SQL migrations (in order)
Open **SQL Editor** in Supabase and run:

1. `supabase/01_setup.sql` — schema, RLS, functions, storage bucket
2. `supabase/02_make_admin.sql` — promote the auth user to admin
3. `supabase/03_media_system.sql` — media roles, reorder helpers

### 6. Run the dev server
```bash
npm run dev
```

- Public site → http://localhost:3000
- Admin → http://localhost:3000/admin/login

### 7. Verify
```bash
npm run typecheck
npm run build
```

---

## 📁 Project structure

```
src/
├── app/
│   ├── [lang]/
│   │   ├── layout.tsx                 # Site layout + JSON-LD
│   │   ├── opengraph-image.tsx        # OG per language
│   │   ├── page.tsx                   # Home
│   │   ├── services/page.tsx          # MetallicPolyhedron
│   │   ├── industries/page.tsx        # OrbitSystem
│   │   ├── about/page.tsx             # ParticleGlobe
│   │   ├── process/page.tsx           # DataStreams
│   │   ├── insights/page.tsx          # GlassBubbles
│   │   ├── case-studies/page.tsx      # CrystalCluster
│   │   ├── careers/page.tsx           # NeonRings
│   │   ├── faq/page.tsx               # CircuitBoard
│   │   ├── contact/page.tsx           # AICore
│   │   ├── categories/[slug]/page.tsx
│   │   └── projects/[id]/
│   │       ├── page.tsx
│   │       └── opengraph-image.tsx    # Dynamic per project
│   ├── admin/
│   │   ├── layout.tsx
│   │   ├── page.tsx                   # Dashboard
│   │   ├── login/page.tsx
│   │   ├── projects/
│   │   │   ├── page.tsx
│   │   │   └── [id]/media/page.tsx    # Media manager
│   │   ├── categories/page.tsx
│   │   ├── analytics/page.tsx
│   │   ├── settings/page.tsx
│   │   ├── seo/page.tsx
│   │   └── tools/page.tsx
│   ├── api/revalidate/route.ts
│   ├── layout.tsx                     # Root layout
│   ├── globals.css                    # Tailwind + components layer
│   ├── sitemap.ts
│   ├── robots.ts
│   └── opengraph-image.tsx
├── components/
│   ├── motion/                        # 14 components
│   ├── visuals/                       # 13 components (3D + aurora)
│   ├── marketing/                     # MarketingPage + Hero3DDisplay
│   ├── admin/                         # AdminShell, MediaManager, Charts
│   ├── Hero.tsx
│   ├── Hero3DScene.tsx
│   ├── HeroParticles.tsx
│   ├── Header.tsx
│   ├── Footer.tsx
│   ├── CommandPalette.tsx
│   ├── Slider.tsx
│   ├── ProjectCard.tsx
│   ├── Explorer.tsx
│   ├── Gallery.tsx
│   ├── CategoryCards.tsx
│   ├── Reveal.tsx
│   └── Tracker.tsx
├── lib/
│   ├── data.ts
│   ├── i18n.ts
│   ├── marketing-content.ts
│   ├── seo.ts
│   ├── structured-data.ts
│   ├── storage.ts
│   ├── motion.ts
│   ├── supabase.ts
│   ├── supabase-browser.ts
│   └── types.ts
├── app/styles/
│   └── globals.css                    # Minimal theme tokens
└── middleware.ts
```

---

## 🎨 Customization

### Change brand colors
Edit `tailwind.config.ts` → `theme.extend.colors.violet` and `.mint`.

### Change animations
Edit `tailwind.config.ts` → `theme.extend.animation` and `keyframes`.

### Change 3D scenes
Edit `src/components/visuals/*.tsx` — each scene is fully self-contained.

### Change page visuals
Edit `MarketingPage` invocation in each `page.tsx` — pass `visual="..."` with a different scene name.

---

## 🔒 Security

- **RLS** on every table
- **Admin check** via `public.is_admin()` security definer function
- **Anon key only** in browser (never service_role)
- **Storage policies** restricted to admin
- **No `auth.users` writes** from SQL (uses Dashboard / Auth API)
- **X-Robots-Tag** on admin routes

---

## 📊 Analytics

Anonymous tracking via `track_visit` RPC:
- One request per page view
- Session shared by tabs (30 min idle)
- Refresh / duplicate guards
- Bots skipped
- No personal data

Opt out in a browser:
```js
localStorage.setItem("archai:notrack", "1");
```

---

## 🧪 Scripts

```bash
npm run dev          # Development server
npm run build        # Production build
npm run start        # Start production server
npm run typecheck    # TypeScript check
```

---

## 🌍 Deployment

### Vercel
1. Connect your Git repo
2. Add environment variables
3. Deploy

### Environment variables required
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_STORAGE_BUCKET`
- `NEXT_PUBLIC_SITE_URL`

### Post-deploy
1. Submit `https://your-domain/sitemap.xml` in **Google Search Console**
2. Same for **Bing Webmaster Tools**
3. Verify OG images by sharing a project URL on Twitter / LinkedIn

---

## 📝 License

Proprietary — © Archai Integrated Systems

## Latest stability and homepage upgrade

- Fixed the React Three Fiber hook-context crash in `HeroCore` by moving `useFrame` into a child rendered inside `Scene3D`'s Canvas.
- Fixed the `/icon.svg` route conflict and refreshed the public SVG icon.
- Reduced WebGL work on mobile/low-power devices and unmount off-screen 3D panels.
- Expanded the bilingual home page with service capabilities, delivery process, engineering principles, sectors, FAQs, and project CTA sections.
- Added per-language homepage metadata and Organization/WebSite JSON-LD.
- Replaced unverified client-logo and company-metric claims with capability labels and descriptive counts.
- See `docs/CONSOLE-ERRORS.md` for console-log triage and validation limits.
