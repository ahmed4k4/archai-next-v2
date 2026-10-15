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

for (const jsonFile of ['package.json', 'package-lock.json', 'tsconfig.json', 'next.config.cjs']) {
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
if (!projectsPage.includes('Promise.all([') || !projectsPage.includes('export const revalidate = 300;')) {
  failures.push('projects route concurrency/cache optimizations are missing');
}
const transitionFile = fs.readFileSync(path.join(root, 'src/components/motion/RouteTransition.tsx'), 'utf8');
if (!transitionFile.includes('const MAX_CURTAIN_MS = 1_650') ||
    !transitionFile.includes('value={preloadVisuals || Boolean(reducedMotion)}') ||
    !transitionFile.includes('allRouteVisualsResolved') ||
    !transitionFile.includes('LAZY_VISUAL_SELECTOR')) {
  failures.push('bounded route curtain / route-wide 3D preparation safeguards are missing');
}
const lazyVisualFile = fs.readFileSync(path.join(root, 'src/components/visuals/LazyVisual.tsx'), 'utf8');
if (!lazyVisualFile.includes('if (preloadRouteVisuals && !prepared)') ||
    !lazyVisualFile.includes('hasLayout')) {
  failures.push('route-transition scene preparation / hidden responsive visual guard is missing');
}
const headerSource = fs.readFileSync(path.join(root, 'src/components/Header.tsx'), 'utf8');
const stableLinkSource = headerSource.slice(headerSource.indexOf('function StableNavLink('), headerSource.indexOf('export default function Header('));
if (!stableLinkSource.includes('function StableNavLink(') ||
    !stableLinkSource.includes('onMouseEnter={prefetchRoute}') ||
    stableLinkSource.includes('event.preventDefault()') ||
    stableLinkSource.includes('router.push(') ||
    !stableLinkSource.includes('prefetch={false}') ||
    !headerSource.includes('const closeNavigationMenus = useCallback') ||
    !headerSource.includes('prefetch={false}') ||
    !headerSource.includes('pointerEvents: "none"') ||
    !headerSource.includes('const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`)')) {
  failures.push('native single-click localized navigation / intent prefetch / pointer-inert dropdown exits are missing');
}
const galaxySource = fs.readFileSync(path.join(root, 'src/components/visuals/GalaxyBackground.tsx'), 'utf8');
if (!galaxySource.includes('followUpMeteorAt') ||
    !galaxySource.includes('const maxActiveMeteors = lowPower || width < 520 ? 2 : 3') ||
    !galaxySource.includes('random(900, 1650)') ||
    !galaxySource.includes('const baseCount = width < 520 ? 430 : width < 1000 ? 820 : 1420')) {
  failures.push('increased but performance-bounded star density / meteor cadence / paired meteor safeguards are missing');
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
if (!pageContentFile.includes('withContentDeadline(readPageContent(pageKey, locale))') ||
    !pageContentFile.includes('timeoutMs = 1_100')) {
  failures.push('CMS page content deadline / fallback protection is missing');
}
const motionFile = fs.readFileSync(path.join(root, 'src/components/marketing/AboutStats.tsx'), 'utf8');
if (!motionFile.includes('initial={reduce ? { opacity: 1, rotateX: 0, y: 0 }') ||
    !motionFile.includes('whileInView={reduce ? undefined :')) {
  failures.push('reduced-motion opacity initial state guard is missing');
}
const visitorFile = fs.readFileSync(path.join(root, 'src/components/admin/LiveVisitors.tsx'), 'utf8');
const setupSql = fs.readFileSync(path.join(root, 'supabase/01_setup.sql'), 'utf8');
if (!visitorFile.includes('setInterval(() => void poll(), 60_000') ||
    !visitorFile.includes('document.hidden') ||
    !setupSql.includes('idx_visitor_sessions_last_seen_at')) {
  failures.push('low-frequency live visitor polling / index safeguards are missing');
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

const sitemapSource = fs.readFileSync(path.join(root, 'src/app/sitemap.ts'), 'utf8');
const routePaths = [...sitemapSource.matchAll(/path:\s*["']([^"']+)["']/g)].map((match) => match[1]);
for (const routePath of routePaths) {
  if (!fs.existsSync(path.join(root, 'src/app/[lang]', routePath, 'page.tsx'))) {
    failures.push(`sitemap route has no local page file: ${routePath}`);
  }
}
for (const requiredRoute of [
  'src/app/[lang]/projects/page.tsx',
  'src/app/[lang]/projects/[id]/page.tsx',
  'src/app/[lang]/projects/error.tsx',
  'src/app/[lang]/categories/[slug]/page.tsx',
]) {
  if (!fs.existsSync(path.join(root, requiredRoute))) failures.push(`missing critical route file: ${requiredRoute}`);
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
