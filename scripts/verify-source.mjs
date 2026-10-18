import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const ts = require('typescript');
const postcss = require('postcss');
const root = process.cwd();
const sourceExtensions = new Set(['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs']);
const resolutionExtensions = ['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs', '.json', '.css', '.svg'];
const failures = [];
let parsedFiles = 0;
let localImportsChecked = 0;

function walk(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (['node_modules', '.next', '.git', 'out', 'dist'].includes(entry.name)) continue;
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      walk(absolute);
      continue;
    }
    if (entry.name.endsWith('.d.ts') || !sourceExtensions.has(path.extname(entry.name))) continue;

    parsedFiles += 1;
    const source = fs.readFileSync(absolute, 'utf8');
    const result = ts.transpileModule(source, {
      fileName: absolute,
      reportDiagnostics: true,
      compilerOptions: {
        target: ts.ScriptTarget.ES2020,
        module: ts.ModuleKind.ESNext,
        jsx: ts.JsxEmit.Preserve,
      },
    });
    for (const diagnostic of result.diagnostics ?? []) {
      if (diagnostic.category === ts.DiagnosticCategory.Error) {
        failures.push(`${path.relative(root, absolute)}: syntax error ${diagnostic.code}`);
      }
    }

    const importPattern = /(?:\bfrom\s*|\bimport\s*\()\s*["']([^"']+)["']/g;
    for (const match of source.matchAll(importPattern)) {
      const specifier = match[1];
      if (!specifier.startsWith('.') && !specifier.startsWith('@/')) continue;
      localImportsChecked += 1;
      const base = specifier.startsWith('@/')
        ? path.join(root, 'src', specifier.slice(2))
        : path.resolve(path.dirname(absolute), specifier);
      const candidates = [base, ...resolutionExtensions.map((extension) => `${base}${extension}`), ...resolutionExtensions.map((extension) => path.join(base, `index${extension}`))];
      if (!candidates.some((candidate) => fs.existsSync(candidate) && fs.statSync(candidate).isFile())) {
        failures.push(`${path.relative(root, absolute)}: unresolved local import ${specifier}`);
      }
    }
  }
}

for (const jsonFile of ['package.json', 'package-lock.json', 'tsconfig.json', 'next.config.js']) {
  if (!fs.existsSync(path.join(root, jsonFile))) failures.push(`missing required project file ${jsonFile}`);
  else if (jsonFile.endsWith('.json')) {
    try { JSON.parse(fs.readFileSync(path.join(root, jsonFile), 'utf8')); }
    catch { failures.push(`invalid JSON: ${jsonFile}`); }
  }
}

for (const cssFile of ['src/app/globals.css', 'src/app/styles/globals.css']) {
  const cssPath = path.join(root, cssFile);
  try { postcss.parse(fs.readFileSync(cssPath, 'utf8'), { from: cssPath }); }
  catch (error) { failures.push(`${cssFile}: CSS parse error ${error.reason || error.message}`); }
}

walk(path.join(root, 'src'));

const sceneFile = fs.readFileSync(path.join(root, 'src/components/visuals/Scene3D.tsx'), 'utf8');
const globalCss = fs.readFileSync(path.join(root, 'src/app/styles/globals.css'), 'utf8');
if (!sceneFile.includes('status === "ready" ? "true" : "error"') ||
    !globalCss.includes('.scene-canvas[data-scene-ready="true"] canvas { opacity: 1; }')) {
  failures.push('3D readiness state does not match the canvas visibility CSS contract');
}

const nextConfigSource = fs.readFileSync(path.join(root, 'next.config.js'), 'utf8');
if (!nextConfigSource.includes('hostname: "btseevpvtxpuvxlmvzkt.supabase.co"') ||
    !nextConfigSource.includes('pathname: "/storage/v1/object/public/**"') ||
    fs.existsSync(path.join(root, 'next.config.cjs'))) {
  failures.push('Next.js config must use the supported next.config.js filename and explicitly allow production Supabase project images');
}


const seoBase = fs.readFileSync(path.join(root, 'src/lib/supabase.ts'), 'utf8');
const rootLayout = fs.readFileSync(path.join(root, 'src/app/layout.tsx'), 'utf8');
if (seoBase.includes('archai-website-navy.vercel.app') || rootLayout.includes('archai-website-navy.vercel.app') ||
    !seoBase.includes('https://archai-next-v2.vercel.app')) {
  failures.push('SEO canonical fallback still points to an outdated deployment host');
}
if (!rootLayout.includes('Archai Integrated Systems designs and builds') ||
    !rootLayout.includes('https://archai-next-v2.vercel.app')) {
  failures.push('root SEO fallback brand or canonical production host is inconsistent');
}
const themeCss = fs.readFileSync(path.join(root, 'src/app/styles/globals.css'), 'utf8');
if (!themeCss.includes('--ink-4: #aab3d0;') || !themeCss.includes('--ink-4: #4a5170;')) {
  failures.push('theme-aware tertiary text colors should meet stronger contrast targets');
}
const animatedNumber = fs.readFileSync(path.join(root, 'src/components/motion/AnimatedNumber.tsx'), 'utf8');
if (!animatedNumber.includes('safeValue.toLocaleString()') || animatedNumber.includes('>0</span>')) {
  failures.push('Metrics must render their real value in the server HTML instead of a zero placeholder');
}
const adminStyles = fs.readFileSync(path.join(root, 'src/app/styles/globals.css'), 'utf8');
const baseThemeStyles = fs.readFileSync(path.join(root, 'src/app/styles/globals.css'), 'utf8');
if (!baseThemeStyles.includes('color-scheme: dark;') ||
    !adminStyles.includes('Admin system quality pass (2026-10-19)') ||
    !adminStyles.includes('.admin-content :is(') ||
    !adminStyles.includes(':root[data-theme="light"] .admin-sidebar nav a.active') ||
    !adminStyles.includes('background-color: var(--bg-1);') ||
    !adminStyles.includes('.admin-login-surface {') ||
    !adminStyles.includes('.admin-login-glow { filter: blur(88px); }')) {
  failures.push('admin field surfaces / native color scheme / light-theme sidebar contrast fixes are missing');
}
const adminShell = fs.readFileSync(path.join(root, 'src/components/admin/AdminShell.tsx'), 'utf8');
if (adminShell.includes('SYSTEM ONLINE') || adminShell.includes('Notifications</button>')) {
  failures.push('Admin shell must not claim unverified system health or display a nonfunctional notifications control');
}

const cmsFile = fs.readFileSync(path.join(root, 'src/lib/page-content.ts'), 'utf8');
if (!cmsFile.includes('const reserved = new Set') ||
    !cmsFile.includes('typeof expected === "string" && typeof value !== "string"')) {
  failures.push('CMS section type-safety regression guard is missing');
}

const overviewFile = fs.readFileSync(path.join(root, 'src/components/HomeOverview.tsx'), 'utf8');
if (!overviewFile.includes('type OverviewContent =') ||
    !overviewFile.includes('const content: Record<"ar" | "en", OverviewContent>') ||
    !overviewFile.includes('requiredKeys.every((key) => typeof record[key] === "string")')) {
  failures.push('HomeOverview locale-independent array typing / CMS item validation is missing');
}
const heroCore = fs.readFileSync(path.join(root, 'src/components/visuals/HeroCore.tsx'), 'utf8');
if (!heroCore.includes('system.current.position.y = Math.sin(time * 0.42) * 0.045') ||
    !heroCore.includes('planet.current.rotation.y += step * 0.085')) {
  failures.push('hero planet motion improvements are missing');
}

const siteMapSource = fs.readFileSync(path.join(root, 'src/app/sitemap.ts'), 'utf8');
if (!siteMapSource.includes('p.project_images?.find') || !siteMapSource.includes('image.public_url.trim()')) {
  failures.push('project sitemap images must include the CMS media-table cover when scalar cover fields are empty');
}
if (!adminStyles.includes(':root[data-theme="light"] .admin-top-title em { color: #5e45d2; }') ||
    adminStyles.includes(':root[data-theme="light"] .admin-top-title em { color: #c5b8ff; }') ||
    adminStyles.includes('background: linear-gradient(120deg, #6742f0, #4ce2d0);') ||
    !adminStyles.includes(':root[data-theme="light"] .admin-command-dialog footer span { color: #5e45d2; }') ||
    !adminStyles.includes(':root[data-theme="light"] .admin-content .text-rose-400 { color: #a8194d !important; }')) {
  failures.push('light admin top-title and avatar text contrast fixes are missing');
}

const projectsPage = fs.readFileSync(path.join(root, 'src/app/[lang]/projects/page.tsx'), 'utf8');
if (!projectsPage.includes('Promise.all([') || !projectsPage.includes('export const revalidate = 300;') || !projectsPage.includes('getProjectArchive')) {
  failures.push('projects route concurrency/cache optimizations are missing');
}
const transitionStyles = fs.readFileSync(path.join(root, 'src/app/styles/globals.css'), 'utf8');
if (!transitionStyles.includes('max(12px, env(safe-area-inset-top))') ||
    !transitionStyles.includes('@media (max-height: 520px) and (pointer: coarse)') ||
    !transitionStyles.includes('.route-transition-curtain::before { opacity: .25; animation: none; }') ||
    !transitionStyles.includes('text-wrap: balance;')) {
  failures.push('mobile route-transition layout must respect safe areas and low-height touch screens without full-screen texture animation');
}
const transitionFile = fs.readFileSync(path.join(root, 'src/components/motion/RouteTransition.tsx'), 'utf8');
if (!transitionFile.includes('const CLICK_WATCHDOG_MS = 12_000') ||
    !transitionFile.includes('const ROUTE_WATCHDOG_MS = 45_000') ||
    !transitionFile.includes('const MIN_REVEAL_MS = 320') ||
    transitionFile.includes('from "framer-motion"') ||
    !transitionFile.includes('className="route-content"') ||
    !transitionFile.includes('document.addEventListener("click", onDocumentClick, true)') ||
    !transitionFile.includes('ROUTE_VISUAL_SELECTOR') ||
    !transitionFile.includes('const finiteAnimationsReady =') ||
    !transitionFile.includes('const deviceVisualsReady = lightweightDevice || visualsReady()') ||
    transitionFile.includes('elapsed >= 700') ||
    !transitionFile.includes('attributeFilter: ["data-visual-ready", "data-visual-mode", "data-visual-capability", "aria-busy", "data-route-ready"]') ||
    !transitionFile.includes('value={preloadVisuals}') ||
    !transitionFile.includes('const [showCurtain, setShowCurtain] = useState(true)') ||
    !transitionFile.includes('const [preloadVisuals, setPreloadVisuals] = useState(true)') ||
    !transitionFile.includes('initialIntro ? "is-initial"') ||
    !transitionFile.includes('const isInitialLoad = previous === null')) {
  failures.push('route transitions must cover first paint, wait for page readiness, finite entrance animations, and all mounted visual scenes with a long safety watchdog');
}
if (!transitionStyles.includes('.route-transition-curtain.is-initial .route-transition-stage') ||
    !transitionStyles.includes('.route-transition-curtain.is-initial .route-transition-line') ||
    !transitionStyles.includes('Do not show a blocking first-visit intro when the visitor asked for reduced motion')) {
  failures.push('first-visit transition intro animations and reduced-motion fallback must be present');
}
if (transitionFile.includes('animation.playState !== "pending"') ||
    !transitionFile.includes('!animation.pending') ||
    !transitionFile.includes('const endTimeMs = Number(timing.endTime)')) {
  failures.push('route-transition animation timing must be compatible with current TypeScript DOM typings');
}
const lazyVisualFile = fs.readFileSync(path.join(root, 'src/components/visuals/LazyVisual.tsx'), 'utf8');
if (!lazyVisualFile.includes('const scheduleIfVisibleAndIdle =') ||
    lazyVisualFile.includes('window.addEventListener("pointerdown", grantEligibility') ||
    lazyVisualFile.includes('window.addEventListener("wheel", grantEligibility') ||
    !lazyVisualFile.includes('requestIdleCallback') ||
    !lazyVisualFile.includes('prefersLightweightScenes') ||
    !lazyVisualFile.includes('touchEnhancement') ||
    !lazyVisualFile.includes('if (preloadRouteVisuals)') ||
    !lazyVisualFile.includes('element.dataset.visualCapability = lightweight ? "css" : "webgl"') ||
    !lazyVisualFile.includes('prepare every') ||
    !lazyVisualFile.includes('<VisualPlaceholder kind={PLACEHOLDER_KIND[name]} />')) {
  failures.push('automatic idle WebGL enhancement / transition-scoped all-scene preparation / device-aware fallback is missing');
}
const headerSource = fs.readFileSync(path.join(root, 'src/components/Header.tsx'), 'utf8');
const stableLinkSource = headerSource.slice(headerSource.indexOf('function StableNavLink('), headerSource.indexOf('export default function Header('));
if (!stableLinkSource.includes('function StableNavLink(') ||
    !stableLinkSource.includes('<Link href={href} prefetch={false}') ||
    !stableLinkSource.includes('onMouseEnter={prefetchRoute}') ||
    !stableLinkSource.includes('onPointerDown={prefetchRoute}') ||
    stableLinkSource.includes('if (href.endsWith("/projects"))') ||
    !headerSource.includes('const closeNavigationMenus = useCallback') ||
    headerSource.includes('framer-motion') ||
    !headerSource.includes('className={`header-chevron ${catsOpen ? "is-open" : ""}`}') ||
    !headerSource.includes('const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`)')) {
  failures.push('single-click App Router navigation / route prefetch / pointer-inert dropdown exits are missing');
}

const lazyVisualLoadingSource = fs.readFileSync(path.join(root, 'src/components/visuals/LazyVisual.tsx'), 'utf8');
if (!lazyVisualLoadingSource.includes('import type { VisualName } from "./DynamicVisual"') ||
    !lazyVisualLoadingSource.includes('dynamic(() => import("./DynamicVisual"), { ssr: false, loading: () => null })') ||
    !lazyVisualLoadingSource.includes('<VisualPlaceholder kind={PLACEHOLDER_KIND[name]} />') ||
    !lazyVisualLoadingSource.includes('{shouldMount ? (') ||
    lazyVisualLoadingSource.indexOf('<VisualPlaceholder kind={PLACEHOLDER_KIND[name]} />') > lazyVisualLoadingSource.indexOf('{shouldMount ? (')) {
  failures.push('3D scene registry must be split from the initial bundle and preserve its CSS placeholder while loading');
}
const heroNavSource = fs.readFileSync(path.join(root, 'src/components/Hero.tsx'), 'utf8');
const magneticButtonSource = fs.readFileSync(path.join(root, 'src/components/motion/MagneticButton.tsx'), 'utf8');
if (!heroNavSource.includes('prefetch={false} className="btn-ghost"') ||
    !magneticButtonSource.includes('<Link href={href} prefetch={false}')) {
  failures.push('above-the-fold CTA links must not download destination route bundles before user intent');
}

const homeProjectsCta = fs.readFileSync(path.join(root, 'src/components/HomeProjectsCTA.tsx'), 'utf8');
if (!homeProjectsCta.includes('<Link href={`/${lang}/projects`} prefetch={false} className="btn-primary">')) {
  failures.push('homepage projects CTA must not prefetch heavy routes before the user intends to navigate');
}
const projectCardSource = fs.readFileSync(path.join(root, 'src/components/ProjectCard.tsx'), 'utf8');
if (!projectCardSource.includes('const prefetchDetails = index < 3') ||
    !projectCardSource.includes('onTouchStart={() => router.prefetch(href)}') ||
    !projectCardSource.includes('prefetch={prefetchDetails}')) {
  failures.push('project details must prefetch the first row and use-intent navigation without flooding mobile connections');
}
const dataLayerSource = fs.readFileSync(path.join(root, 'src/lib/data.ts'), 'utf8');
const i18nSource = fs.readFileSync(path.join(root, 'src/lib/i18n.ts'), 'utf8');
if (!dataLayerSource.includes('const modernCovers = await sb.from("project_images")') ||
    !dataLayerSource.includes('is_cover.eq.true,is_hero.eq.true,is_featured.eq.true') ||
    !dataLayerSource.includes('project.project_images = [images[0]]') ||
    !dataLayerSource.includes('project-archive-cover-v4-independent-media') ||
    !i18nSource.includes('export const projectCover = (p: any): string =>') ||
    !projectCardSource.includes('sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 33vw"') ||
    !fs.existsSync(path.join(root, 'public/assets/logo.webp'))) {
  failures.push('project media cover resolution / legacy schema compatibility / responsive image loading / optimized logo is missing');
}
const explorerSource = fs.readFileSync(path.join(root, 'src/components/Explorer.tsx'), 'utf8');
if (explorerSource.includes('from "framer-motion"') ||
    !explorerSource.includes('explorer-filterbar') ||
    !explorerSource.includes('explorer-search-input') ||
    !explorerSource.includes('explorer-select') ||
    !explorerSource.includes('aria-live="polite"')) {
  failures.push('project archive filters must use lightweight components and accessible live result counts');
}
const explorerStyles = fs.readFileSync(path.join(root, 'src/app/styles/globals.css'), 'utf8');
if (!explorerStyles.includes('.projects-index .explorer-select option') ||
    !explorerStyles.includes(':root[data-theme="light"] .projects-index .explorer-select option') ||
    !explorerStyles.includes('backdrop-filter: none;')) {
  failures.push('project archive filters need theme-aware option contrast and blur-free surfaces');
}
const footerForLogo = fs.readFileSync(path.join(root, 'src/components/Footer.tsx'), 'utf8');
if (!footerForLogo.includes('return "/assets/logo-64.webp"')) {
  failures.push('footer brand mark should reuse the optimized small WebP logo when a dashboard asset path is stored');
}
const headerForLogo = fs.readFileSync(path.join(root, 'src/components/Header.tsx'), 'utf8');
if (!headerForLogo.includes('/assets/logo-64.webp') || !fs.existsSync(path.join(root, 'public/assets/logo-64.webp'))) {
  failures.push('header must use the reduced 64px WebP logo asset for its small brand mark');
}
const heroParticles = fs.readFileSync(path.join(root, 'src/components/HeroParticles.tsx'), 'utf8');
if (!heroParticles.includes('window.innerWidth < 640 ? 32 : window.innerWidth < 1024 ? 52 : 72') ||
    !heroParticles.includes('1000 / 18')) {
  failures.push('hero particle animation must use a reduced particle budget and frame rate');
}
const lazyVisualSource = fs.readFileSync(path.join(root, 'src/components/visuals/LazyVisual.tsx'), 'utf8');
if (!lazyVisualSource.includes('}, 10_000)') || !lazyVisualSource.includes('queuePreparation("intent")') || !lazyVisualSource.includes('queuePreparation("route")') || !lazyVisualSource.includes('return false;')) {
  failures.push('WebGL must remain deferred during cold load, promote on real user intent, and prepare explicitly under route transitions');
}
const genericLoading = fs.readFileSync(path.join(root, 'src/app/[lang]/loading.tsx'), 'utf8');
if (!genericLoading.includes('aria-busy="true"') || !genericLoading.includes('data-route-loading="true"')) {
  failures.push('locale-level accessible loading skeleton is missing');
}
const galaxySource = fs.readFileSync(path.join(root, 'src/components/visuals/GalaxyBackground.tsx'), 'utf8');
if (!galaxySource.includes('followUpMeteorAt') ||
    !galaxySource.includes('const maxActiveMeteors = lowPower || width < 520 ? 1 : 2') ||
    !galaxySource.includes('random(1700, 2800)') ||
    !galaxySource.includes('const baseCount = width < 520 ? 100 : width < 1000 ? 180 : 320') ||
    !galaxySource.includes('1000 / 16') ||
    !galaxySource.includes('1000 / 22')) {
  failures.push('responsive low-cost star density / frame pacing / meteor safeguards are missing');
}
const dynamicVisualFile = fs.readFileSync(path.join(root, 'src/components/visuals/DynamicVisual.tsx'), 'utf8');
if (!dynamicVisualFile.includes('instance.dataset.visualReady = "error"')) {
  failures.push('dynamic visual failure does not resolve the route readiness gate');
}
const supabaseFile = fs.readFileSync(path.join(root, 'src/lib/supabase.ts'), 'utf8');
if (!supabaseFile.includes('supabaseFetchWithTimeout') ||
    !supabaseFile.includes('setTimeout(() => controller.abort(), 1_800)') ||
    !supabaseFile.includes('global: { fetch: supabaseFetchWithTimeout }')) {
  failures.push('Supabase request timeout protection is missing');
}
const pageContentFile = fs.readFileSync(path.join(root, 'src/lib/page-content.ts'), 'utf8');
if (!pageContentFile.includes('["seoTitle", "seo_title"]') || !pageContentFile.includes('["seoDescription", "seo_description"]')) {
  failures.push('CMS SEO title/description fields do not flow into page metadata');
}
if (!pageContentFile.includes('withContentDeadline(readPageContent(pageKey, locale))') ||
    !pageContentFile.includes('timeoutMs = 1_100')) {
  failures.push('CMS page content deadline / fallback protection is missing');
}
const motionFile = fs.readFileSync(path.join(root, 'src/components/marketing/AboutStats.tsx'), 'utf8');
if (motionFile.includes('framer-motion') || motionFile.includes('use client') || !motionFile.includes('about-highlight-card')) {
  failures.push('About capability highlights must use server-rendered markup with CSS-only entrance motion');
}
const aboutRoute = fs.readFileSync(path.join(root, 'src/app/[lang]/about/page.tsx'), 'utf8');
if (!aboutRoute.includes('<AboutStats lang={lang} items={c.aboutStats} />') ||
    !motionFile.includes('Array.isArray(items)') ||
    !motionFile.includes('if (supplied && supplied.length === 0) return null')) {
  failures.push('About highlight cards are not sourced from per-locale CMS content / empty-state behavior');
}
const contentEditorSource = fs.readFileSync(path.join(root, 'src/app/admin/content/page.tsx'), 'utf8');
const aboutEditorGuards = [
  'const ABOUT_STATS_DEFAULTS',
  'loadedSections.aboutStats = ABOUT_STATS_DEFAULTS[contentLocale]',
  'const updateAboutStat',
  'const addAboutStat',
  'const removeAboutStat',
  'pageKey === "about" ? (',
];
if (!aboutEditorGuards.every((guard) => contentEditorSource.includes(guard))) {
  failures.push('About highlights do not have a safe per-locale dashboard editor');
}
const visitorFile = fs.readFileSync(path.join(root, 'src/components/admin/LiveVisitors.tsx'), 'utf8');
const setupSql = fs.readFileSync(path.join(root, 'supabase/01_setup.sql'), 'utf8');
if (!visitorFile.includes('setInterval(() => void poll(), 60_000') ||
    !visitorFile.includes('document.hidden') ||
    !setupSql.includes('idx_visitor_sessions_last_seen_at')) {
  failures.push('low-frequency live visitor polling / index safeguards are missing');
}


const contentEditor = contentEditorSource;
if (!contentEditor.includes('const cardRows = useMemo') ||
    !contentEditor.includes('const updateCard = (index: number, key: string, value: unknown) =>') ||
    !contentEditor.includes('Developer mode — advanced JSON') ||
    !contentEditor.includes('pageKey === "home" ? true : form.is_published')) {
  failures.push('CMS visual card editor / safe homepage publication behavior is missing');
}
if (!projectsPage.includes('const primaryLabel = typeof c.primary === "string"') ||
    !projectsPage.includes('const primaryHref = typeof c.primaryHref === "string"') ||
    !fs.readFileSync(path.join(root, 'src/app/[lang]/case-studies/page.tsx'), 'utf8').includes('const primaryLabel = typeof c.primary === "string"')) {
  failures.push('projects archive / case studies CTA fields are not connected to CMS copy');
}



const navResolver = fs.readFileSync(path.join(root, 'src/lib/site-navigation.ts'), 'utf8');
if (!navResolver.includes('.replace(/^\\/(?:ar|en)(?=\\/)/i, "")') ||
    !navResolver.includes('.split(/[?#]/, 1)[0]')) {
  failures.push('dashboard/public navigation should normalize localized route values before whitelist validation');
}

const seoAuditFile = fs.readFileSync(path.join(root, 'src/app/admin/seo/page.tsx'), 'utf8');
if (!seoAuditFile.includes('select("id,slug,status,title_en,title_ar,summary_en,summary_ar,cover_image,featured_image,hero_image")')) {
  failures.push('SEO content audit should load only the project fields it audits');
}
if (!seoAuditFile.includes('/admin/projects?edit=') || !fs.readFileSync(path.join(root, 'src/app/admin/projects/page.tsx'), 'utf8').includes('const requestedId = qs.get("edit")')) {
  failures.push('SEO audit project links should open the relevant project record in the visual editor');
}
const marketingComponent = fs.readFileSync(path.join(root, 'src/components/marketing/MarketingPage.tsx'), 'utf8');
if (marketingComponent.includes('framer-motion') || marketingComponent.includes('<motion.') || marketingComponent.includes('<Reveal') || marketingComponent.includes('<Stagger') || marketingComponent.includes('SpotlightPanel') || marketingComponent.includes('spotlight-panel')) {
  failures.push('public marketing pages should avoid shipping Framer Motion for simple entrance/hover effects');
}
if (!globalCss.includes('.marketing-content-enter') && !globalCss.includes('@keyframes marketing-content-enter')) {
  failures.push('CSS-only marketing entrance effects are missing');
}
if (!marketingComponent.includes('order-1 min-w-0 lg:order-1') ||
    !marketingComponent.includes('h-[170px] w-full max-w-[340px]') ||
    !marketingComponent.includes('text-[clamp(2rem,9vw,3.25rem)]') ||
    !marketingComponent.includes('hidden justify-between text-[10px] font-mono')) {
  failures.push('marketing hero needs mobile-first heading order, compact visual, and responsive title sizing');
}
if (!galaxySource.includes('lightweightMotion.matches || lowPower') ||
    !galaxySource.includes('lightweightMotion.addEventListener?.("change", onMotionPreferenceChange)') ||
    !fs.readFileSync(path.join(root, 'src/app/styles/globals.css'), 'utf8').includes('.galaxy-background::before { animation: none !important; }') ||
    !fs.readFileSync(path.join(root, 'src/app/styles/globals.css'), 'utf8').includes('backdrop-filter: none !important;')) {
  failures.push('mobile / low-power background and card-rendering safeguards should avoid continuous compositing work');
}
if (!marketingComponent.includes('isProjectsArchiveHref') || !marketingComponent.includes('<Link href={secondaryHref} prefetch={isProjectsArchiveHref(secondaryHref) ? true : undefined} className="btn-ghost">')) {
  failures.push('CMS-managed marketing-page CTAs should use App Router links with archive prefetch');
}
const marketingRouteFiles = ['services', 'industries', 'about', 'process', 'insights', 'contact', 'faq', 'careers'];
for (const page of marketingRouteFiles) {
  const route = fs.readFileSync(path.join(root, `src/app/[lang]/${page}/page.tsx`), 'utf8');
  if (!route.includes('sections={c.sections as Record<string, unknown> | null}')) {
    failures.push(`${page} route does not forward CMS sections to MarketingPage`);
  }
}

const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
const lock = JSON.parse(fs.readFileSync(path.join(root, 'package-lock.json'), 'utf8'));
const rootPackage = lock.packages?.[''];
const sameDependencyMap = (left = {}, right = {}) => {
  const leftKeys = Object.keys(left).sort();
  const rightKeys = Object.keys(right).sort();
  return leftKeys.length === rightKeys.length &&
    leftKeys.every((key, index) => key === rightKeys[index] && left[key] === right[key]);
};
if (!rootPackage || !sameDependencyMap(pkg.dependencies, rootPackage.dependencies) ||
    !sameDependencyMap(pkg.devDependencies, rootPackage.devDependencies)) {
  failures.push('package.json direct dependency specs do not match package-lock.json');
}
if (!pkg.dependencies?.gsap || !pkg.dependencies?.lenis) {
  failures.push('GSAP or Lenis dependency is missing');
}

const editorialSql = fs.readFileSync(path.join(root, 'supabase/04_editorial_cms.sql'), 'utf8');
const expectedCmsPages = ['home', 'services', 'industries', 'about', 'process', 'insights', 'contact', 'faq', 'careers', 'case-studies', 'projects'];
for (const pageKey of expectedCmsPages) {
  for (const locale of ['ar', 'en']) {
    const seeded = new RegExp(`\\n\\s+'${pageKey}', '${locale}',`).test(editorialSql);
    if (!seeded) failures.push(`CMS seed missing ${pageKey}/${locale}`);
  }
}
if (!fs.readFileSync(path.join(root, 'src/lib/page-content.ts'), 'utf8').includes('["seoTitle", "seo_title"]')) {
  failures.push('SEO dashboard title field is not wired to page metadata');
}
const dataSource = fs.readFileSync(path.join(root, 'src/lib/data.ts'), 'utf8');
const getProjectBody = dataSource.slice(dataSource.indexOf('export async function getProject('));
if (!getProjectBody.includes('archiveFallback ??= await getProjectArchive()') || getProjectBody.includes('home.projects') || getProjectBody.includes('home.cats')) {
  failures.push('project detail lookup must use a lightweight archive only as a compatibility fallback');
}
const homeRoute = fs.readFileSync(path.join(root, 'src/app/[lang]/page.tsx'), 'utf8');
if (!homeRoute.includes('getProjectArchive()') || !homeRoute.includes('getSiteSettings()') || homeRoute.includes('getHome()')) {
  failures.push('homepage should read the lightweight project archive and site settings instead of full project galleries');
}
const sitemapSource = fs.readFileSync(path.join(root, 'src/app/sitemap.ts'), 'utf8');
if (!sitemapSource.includes('getProjectArchive') || sitemapSource.includes('getHome')) {
  failures.push('sitemap should use the lightweight project archive query instead of full homepage data');
}
const routePaths = [...sitemapSource.matchAll(/path:\s*["']([^"']+)["']/g)].map((match) => match[1]);
for (const routePath of routePaths) {
  if (!fs.existsSync(path.join(root, 'src/app/[lang]', routePath, 'page.tsx'))) {
    failures.push(`sitemap route has no local page file: ${routePath}`);
  }
}

if (routePaths.includes('technologies') || routePaths.includes('blog') || routePaths.includes('testimonials')) {
  failures.push('sitemap includes legacy routes that permanently redirect instead of canonical content URLs');
}
if (!cmsFile.includes('function safeContentHref') || !cmsFile.includes('clean.startsWith("#")')) {
  failures.push('CMS links do not safely support approved same-page anchors');
}

for (const requiredRoute of [
  'src/app/[lang]/projects/page.tsx',
  'src/app/[lang]/projects/[id]/page.tsx',
  'src/app/[lang]/projects/error.tsx',
  'src/app/[lang]/categories/[slug]/page.tsx',
]) {
  if (!fs.existsSync(path.join(root, requiredRoute))) failures.push(`missing critical route file: ${requiredRoute}`);
}


const rootLayoutSource = fs.readFileSync(path.join(root, 'src/app/layout.tsx'), 'utf8');
const rootStylesSource = fs.readFileSync(path.join(root, 'src/app/styles/globals.css'), 'utf8');
const smoothMotionSource = fs.readFileSync(path.join(root, 'src/components/motion/SmoothMotion.tsx'), 'utf8');
if (rootLayoutSource.includes('fonts.googleapis.com/css2') || rootLayoutSource.includes('fonts.gstatic.com')) {
  failures.push('render-blocking third-party webfont dependency remains in the root document');
}
if (!rootStylesSource.includes('"Segoe UI", Tahoma') || !rootStylesSource.includes('Cascadia Code')) {
  failures.push('system-font fallback stack for network-independent first paint is missing');
}
if (!smoothMotionSource.includes('import("lenis")') || !smoothMotionSource.includes('import("gsap")') || !smoothMotionSource.includes('scheduleIdle')) {
  failures.push('Lenis / GSAP must remain deferred desktop-only enhancements');
}
if (!smoothMotionSource.includes('const cancelScheduled = scheduleIdle') ||
    !smoothMotionSource.includes('cancelScheduled();') ||
    !smoothMotionSource.includes('window.setTimeout(() => {') ||
    !smoothMotionSource.includes('}, 850);')) {
  failures.push('deferred motion enhancements must be cancellable and wait for idle user intent');
}
const visualQueueFile = fs.readFileSync(path.join(root, 'src/components/visuals/visual-preparation-queue.ts'), 'utf8');
if (lazyVisualFile.includes('window.addEventListener("pointerdown", grantEligibility') ||
    lazyVisualFile.includes('window.addEventListener("wheel", grantEligibility') ||
    !lazyVisualFile.includes('const nearViewport = rect.bottom > -80 && rect.top < window.innerHeight + 160') ||
    !lazyVisualFile.includes('setTimeout(() => {') ||
    !lazyVisualFile.includes('queuePreparation("intent")') ||
    !lazyVisualFile.includes('queuePreparation("route")') ||
    !visualQueueFile.includes('function drain()') ||
    !visualQueueFile.includes('const waiting: VisualRequest[] = []') ||
    !visualQueueFile.includes('releaseVisualPreparation(next.id)')) {
  failures.push('WebGL should auto-enhance near-viewport scenes and serialize expensive scene bootstraps');
}
if (!globalCss.includes('.footer-marquee-track { animation: none !important; transform: none !important; }') ||
    !globalCss.includes('footer-marquee-ltr 42s linear infinite')) {
  failures.push('footer marquee should use CSS-only motion and respect reduced-motion preferences');
}
const sceneSource = fs.readFileSync(path.join(root, 'src/components/visuals/Scene3D.tsx'), 'utf8');
if (!sceneSource.includes('const shouldAnimate = !reduce && inView && (!mobile || tier === "hero")') ||
    sceneSource.includes('<Preload all />') || sceneSource.includes('<AdaptiveDpr pixelated />') || sceneSource.includes('<AdaptiveEvents />')) {
  failures.push('mobile WebGL rendering safeguards or unnecessary Canvas helpers regressed');
}
const headerPerfSource = fs.readFileSync(path.join(root, 'src/components/Header.tsx'), 'utf8');
if (!headerPerfSource.includes('dynamic(() => import("./CommandPalette")') || !headerPerfSource.includes('{cmdOpen ? <CommandPalette')) {
  failures.push('Command Palette must be code-split and loaded only when opened');
}
const homeHeroSource = fs.readFileSync(path.join(root, 'src/components/Hero.tsx'), 'utf8');
if (homeHeroSource.includes('"use client"') || homeHeroSource.includes('framer-motion') ||
    homeHeroSource.includes('initial=') || !homeHeroSource.includes('<h1')) {
  failures.push('homepage LCP headline should stay server-rendered and immediately paintable without a JS motion runtime');
}

// Dashboard reliability and image-audit checks added in the full review.
const adminProjectsSource = fs.readFileSync(path.join(root, 'src/app/admin/projects/page.tsx'), 'utf8');
const adminCategoriesSource = fs.readFileSync(path.join(root, 'src/app/admin/categories/page.tsx'), 'utf8');
const adminToolsSource = fs.readFileSync(path.join(root, 'src/app/admin/tools/page.tsx'), 'utf8');
const adminSeoSource = fs.readFileSync(path.join(root, 'src/app/admin/seo/page.tsx'), 'utf8');
const adminSettingsSource = fs.readFileSync(path.join(root, 'src/app/admin/settings/page.tsx'), 'utf8');
const adminContentSource = fs.readFileSync(path.join(root, 'src/app/admin/content/page.tsx'), 'utf8');
const adminLoginSource = fs.readFileSync(path.join(root, 'src/app/admin/login/page.tsx'), 'utf8');
const adminShellSource = fs.readFileSync(path.join(root, 'src/components/admin/AdminShell.tsx'), 'utf8');
if (!adminLoginSource.includes('useReducedMotion') || !adminLoginSource.includes('animate={reduceMotion ? undefined : { x: [0, 40, 0]')) {
  failures.push('admin login decorative animations must stop when the user requests reduced motion');
}
if (!adminShellSource.includes('MotionConfig reducedMotion=\"user\"') ||
    !adminShellSource.includes('className=\"admin-route-content\"') ||
    !adminShellSource.includes('initial={reduceMotion ? false : { opacity: 0.97, y: 10 }}')) {
  failures.push('admin route entrance motion must run on first render/navigation and respect reduced-motion preferences');
}
if (!adminProjectsSource.includes('finally {') || !adminProjectsSource.includes('Could not save project.') ||
    !adminCategoriesSource.includes('Could not load categories.') ||
    !adminToolsSource.includes('mediaProjectIds.has(String(x.id))') ||
    !adminSeoSource.includes('has_linked_image') || !adminSeoSource.includes('Could not load SEO audit data.')) {
  failures.push('dashboard project/category/image audit loading and error safeguards are missing');
}
if (!adminSettingsSource.includes('.select("id").maybeSingle()') ||
    !adminContentSource.includes('Homepage settings were not updated.') ||
    !adminLoginSource.includes('Could not connect to login service') && !adminLoginSource.includes('تعذر الاتصال بخدمة تسجيل الدخول')) {
  failures.push('dashboard save confirmation and login-network error handling are missing');
}
if (!rootLayoutSource.includes('Archai Integrated Systems') ||
    !rootLayoutSource.includes('metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://archai-next-v2.vercel.app")')) {
  failures.push('root metadata brand or production canonical fallback regressed');
}

console.log(`Source files parsed: ${parsedFiles}`);
console.log(`Local imports checked: ${localImportsChecked}`);
if (failures.length) {
  console.error(`\nVerification failed (${failures.length} issue(s)):`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exitCode = 1;
} else {
  console.log('Syntax, local imports, project JSON, 3D readiness, CMS safety, mobile preloading, and polling checks: PASS');
}
