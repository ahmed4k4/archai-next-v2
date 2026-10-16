import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const ts = require('typescript');
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

const projectsPage = fs.readFileSync(path.join(root, 'src/app/[lang]/projects/page.tsx'), 'utf8');
if (!projectsPage.includes('Promise.all([') || !projectsPage.includes('export const revalidate = 300;') || !projectsPage.includes('getProjectArchive')) {
  failures.push('projects route concurrency/cache optimizations are missing');
}
const transitionFile = fs.readFileSync(path.join(root, 'src/components/motion/RouteTransition.tsx'), 'utf8');
if (!transitionFile.includes('const CLICK_WATCHDOG_MS = 1_000') ||
    !transitionFile.includes('const ROUTE_WATCHDOG_MS = 1_700') ||
    !transitionFile.includes('const MIN_REVEAL_MS = 180') ||
    !transitionFile.includes('initial={false}') ||
    !transitionFile.includes('document.addEventListener("click", onDocumentClick, true)') ||
    !transitionFile.includes('VISIBLE_VISUAL_SELECTOR') ||
    transitionFile.includes('preloadVisualChunks') ||
    !transitionFile.includes('const visualsReadyOrTimedOut = lightweightDevice || visualsReady() || elapsed >= 700') ||
    !transitionFile.includes('value={preloadVisuals}')) {
  failures.push('performance-bounded click-first transitions / mobile-safe visual readiness safeguards are missing');
}
const lazyVisualFile = fs.readFileSync(path.join(root, 'src/components/visuals/LazyVisual.tsx'), 'utf8');
if (!lazyVisualFile.includes('const scheduleIfVisibleAndIdle =') ||
    !lazyVisualFile.includes('window.addEventListener("pointerdown", grantEligibility') ||
    lazyVisualFile.includes('window.addEventListener("pointermove", grantEligibility') ||
    !lazyVisualFile.includes('requestIdleCallback') ||
    !lazyVisualFile.includes('prefersLightweightScenes') ||
    !lazyVisualFile.includes('<VisualPlaceholder kind={PLACEHOLDER_KIND[name]} />')) {
  failures.push('idle-only WebGL preparation / device-aware static visual fallback is missing');
}
const headerSource = fs.readFileSync(path.join(root, 'src/components/Header.tsx'), 'utf8');
const stableLinkSource = headerSource.slice(headerSource.indexOf('function StableNavLink('), headerSource.indexOf('export default function Header('));
if (!stableLinkSource.includes('function StableNavLink(') ||
    !stableLinkSource.includes('<Link href={href} prefetch={true}') ||
    !stableLinkSource.includes('onMouseEnter={prefetchRoute}') ||
    !stableLinkSource.includes('onPointerDown={prefetchRoute}') ||
    stableLinkSource.includes('if (href.endsWith("/projects"))') ||
    !headerSource.includes('const closeNavigationMenus = useCallback') ||
    !headerSource.includes('pointerEvents: "none"') ||
    !headerSource.includes('const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`)')) {
  failures.push('single-click App Router navigation / route prefetch / pointer-inert dropdown exits are missing');
}
const homeProjectsCta = fs.readFileSync(path.join(root, 'src/components/HomeProjectsCTA.tsx'), 'utf8');
if (!homeProjectsCta.includes('<Link href={`/${lang}/projects`} prefetch={true} className="btn-primary">')) {
  failures.push('homepage projects CTA should use prefetched client-side navigation');
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
const genericLoading = fs.readFileSync(path.join(root, 'src/app/[lang]/loading.tsx'), 'utf8');
if (!genericLoading.includes('aria-busy="true"') || !genericLoading.includes('data-route-loading="true"')) {
  failures.push('locale-level accessible loading skeleton is missing');
}
const galaxySource = fs.readFileSync(path.join(root, 'src/components/visuals/GalaxyBackground.tsx'), 'utf8');
if (!galaxySource.includes('followUpMeteorAt') ||
    !galaxySource.includes('const maxActiveMeteors = lowPower || width < 520 ? 2 : 3') ||
    !galaxySource.includes('random(900, 1650)') ||
    !galaxySource.includes('const baseCount = width < 520 ? 140 : width < 1000 ? 260 : 520') ||
    !galaxySource.includes('1000 / 20') ||
    !galaxySource.includes('1000 / 28')) {
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
if (!motionFile.includes('initial={reduce ? { opacity: 1, rotateX: 0, y: 0 }') ||
    !motionFile.includes('whileInView={reduce ? undefined :')) {
  failures.push('reduced-motion opacity initial state guard is missing');
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
if (!marketingComponent.includes('order-1 min-w-0 lg:order-1') ||
    !marketingComponent.includes('h-[170px] w-full max-w-[340px]') ||
    !marketingComponent.includes('text-[clamp(2rem,9vw,3.25rem)]') ||
    !marketingComponent.includes('hidden justify-between text-[10px] font-mono')) {
  failures.push('marketing hero needs mobile-first heading order, compact visual, and responsive title sizing');
}
if (!galaxySource.includes('lightweightMotion.matches || lowPower') ||
    !galaxySource.includes('lightweightMotion.addEventListener?.("change", onMotionPreferenceChange)') ||
    !fs.readFileSync(path.join(root, 'src/app/styles/globals.css'), 'utf8').includes('.galaxy-background::before { animation: none !important; }') ||
    !fs.readFileSync(path.join(root, 'src/app/globals.css'), 'utf8').includes('backdrop-filter: none !important;')) {
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
if (!lazyVisualFile.includes('window.addEventListener("pointerdown", grantEligibility') ||
    lazyVisualFile.includes('window.addEventListener("pointermove", grantEligibility') ||
    !visualQueueFile.includes('function drain()') ||
    !visualQueueFile.includes('const waiting: VisualRequest[] = []') ||
    !visualQueueFile.includes('releaseVisualPreparation(next.id)')) {
  failures.push('WebGL initialization must wait for deliberate input and serialize expensive scene bootstraps');
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
if (!homeHeroSource.includes('initial={false}') || homeHeroSource.includes('{...appear(0.16)}')) {
  failures.push('homepage LCP headline should be visible in server-rendered HTML instead of waiting for entrance motion');
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
