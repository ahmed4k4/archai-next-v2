import Link from "next/link";
import { notFound } from "next/navigation";
import Explorer from "@/components/Explorer";
import LazyVisual from "@/components/visuals/LazyVisual";
import { getHome } from "@/lib/data";
import { isLocale, pick } from "@/lib/i18n";
import { jsonLd, collectionPageSchema, breadcrumbSchema } from "@/lib/structured-data";
import { pageSeo } from "@/lib/seo";
import { SITE_URL } from "@/lib/supabase";
import type { Category, Locale, Project } from "@/lib/types";
import { getEditablePageCopy } from "@/lib/page-content";

export const revalidate = 300;
export const dynamicParams = true;

const copy = {
  ar: {
    eyebrow: "فهرس المشروعات",
    title: "أعمال رقمية",
    accent: "مصممة لهدف واضح",
    description: "استكشف المشروعات المنشورة من لوحة إدارة أركاي. كل عنوان وصورة وتقنية وتصنيف ورابط في هذا الأرشيف يأتي من قاعدة البيانات، ولا نعرض سجلات مشروعات تجريبية ثابتة داخل الموقع.",
    catalogue: "استكشف الأرشيف",
    catalogueDescription: "ابحث بالاسم، أو صفِّ النتائج حسب المجال والتقنيات المسجلة للمشروع.",
    services: "استكشف الخدمات",
    contact: "ناقش مشروعًا جديدًا",
    unconfiguredTitle: "اربط قاعدة البيانات لعرض المشروعات",
    unconfiguredBody: "لا توجد سجلات مشروعات محلية بديلة في الكود. أضف إعدادات Supabase وصلاحيات القراءة، وستظهر المشروعات المنشورة المسجلة في لوحة الإدارة هنا.",
    errorTitle: "تعذر قراءة بيانات المشروعات",
    errorBody: "لم يتم عرض بيانات ثابتة بديلة. تحقق من اتصال Supabase، وسياسات القراءة RLS، وبنية جدول projects والعلاقات المرتبطة به.",
    compatibilityTitle: "تم تحميل البيانات بوضع التوافق",
    compatibilityBody: "بعض الحقول الاختيارية أو العلاقات لم تكن متاحة، لذلك تعرض الصفحة السجلات التي أمكن قراءتها من قاعدة البيانات. راجع ترحيلات المخطط إذا كانت الصور أو التقنيات ناقصة.",
    emptyTitle: "لا توجد مشروعات منشورة حاليًا",
    emptyBody: "عند نشر مشروع من لوحة الإدارة سيظهر هنا تلقائيًا. يمكنك التعرف على الخدمات أو بدء محادثة حول فكرتك في الوقت الحالي.",
  },
  en: {
    eyebrow: "PROJECT INDEX",
    title: "Digital work",
    accent: "built around a clear purpose",
    description: "Explore projects published through the Archai admin dashboard. Every project title, image, technology, category and external link in this archive comes from the database; the website does not ship static demo project records.",
    catalogue: "Explore the archive",
    catalogueDescription: "Search by name, or narrow results by the category and technologies saved with each project.",
    services: "Explore services",
    contact: "Discuss a new project",
    unconfiguredTitle: "Connect the database to show projects",
    unconfiguredBody: "No local project records are embedded in the source code. Configure Supabase and read permissions to display published projects managed from the admin dashboard.",
    errorTitle: "Project data could not be read",
    errorBody: "Static replacement records are disabled. Check Supabase connectivity, RLS read policies, the projects table schema and its related tables.",
    compatibilityTitle: "Project data loaded in compatibility mode",
    compatibilityBody: "Some optional fields or relations were unavailable, so the page shows only records readable from the database. Check schema migrations if images or technologies are missing.",
    emptyTitle: "No published projects yet",
    emptyBody: "Projects will appear here automatically when published from the admin dashboard. In the meantime, explore the services or discuss an idea with the team.",
  },
} as const;

export async function generateMetadata({ params }: { params: { lang: string } }) {
  const lang: Locale = isLocale(params.lang) ? params.lang : "en";
  const c = await getEditablePageCopy(lang, "projects", copy[lang]);
  return pageSeo(lang, "projects", c.seoTitle || `${c.title} ${c.accent}`, c.seoDescription || c.description, {
    keywords: lang === "ar"
      ? ["مشروعات أركاي", "معرض أعمال شركة برمجة", "منصات رقمية", "أنظمة أعمال", "ذكاء اصطناعي", "إنترنت الأشياء"]
      : ["Archai projects", "software portfolio", "digital product engineering", "business systems", "AI integration", "IoT projects"],
  });
}

export default async function ProjectsPage({ params }: { params: { lang: string } }) {
  if (!isLocale(params.lang)) notFound();
  const lang = params.lang as Locale;
  const ar = lang === "ar";
  const [c, home] = await Promise.all([
    getEditablePageCopy(lang, "projects", copy[lang]),
    getHome(),
  ]);

  // Keep the public archive strictly DB-driven. Joined categories may fill category-list
  // gaps only when they are attached to an actual published DB project record.
  let projects: Project[] = Array.isArray(home.projects)
    ? home.projects.filter((project): project is Project => Boolean(project && project.id && (project.title_ar || project.title_en)))
    : [];
  const cats: Category[] = Array.isArray(home.cats)
    ? home.cats.filter((category): category is Category => Boolean(category && category.id && category.slug && category.active !== false))
    : [];

  const categoryById = new Map(cats.map((category) => [String(category.id), category]));
  const categoryBySlug = new Map(cats.map((category) => [category.slug, category]));
  projects = projects.map((project) => {
    const joined = project.categories;
    const category = (joined?.slug ? categoryBySlug.get(joined.slug) : null)
      ?? categoryById.get(String(project.category_id ?? ""))
      ?? (joined && joined.active !== false ? joined : null)
      ?? null;
    return { ...project, categories: category, category_id: category?.id ?? project.category_id ?? null };
  }).sort((a, b) => (a.sort_order ?? 9999) - (b.sort_order ?? 9999));

  const url = `${SITE_URL}/${lang}/projects`;
  const title = `${c.title} ${c.accent}`;
  const schema = [
    collectionPageSchema(lang, title, c.description, url, projects.map((project) => ({
      name: pick(project, "title", lang),
      url: `${SITE_URL}/${lang}/projects/${project.slug || project.id}`,
    }))),
    breadcrumbSchema(lang, [
      { name: ar ? "الرئيسية" : "Home", url: `${SITE_URL}/${lang}` },
      { name: ar ? "المشروعات" : "Projects", url },
    ]),
  ];

  return (
    <main data-route-ready="true" lang={lang} dir={ar ? "rtl" : "ltr"} className="projects-index relative min-h-screen overflow-x-clip">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(schema) }} />

      <section className="relative isolate flex min-h-[min(700px,calc(100svh-76px))] items-center overflow-hidden py-16 md:py-24" aria-labelledby="projects-title">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_76%_48%,rgba(81,89,188,0.12),transparent_44%)]" />
        <div className="relative mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-8 px-5 md:px-8 lg:grid-cols-[1.03fr_0.97fr] lg:gap-6">
          <div className="relative z-10 max-w-3xl">
            <p className="mb-5 inline-flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.22em] text-mint-300"><span className="h-px w-8 bg-current" />{c.eyebrow}</p>
            <h1 id="projects-title" className="font-display text-5xl font-medium leading-[1.05] tracking-tight text-ink-0 md:text-6xl xl:text-7xl">
              {c.title}<br /><span className="bg-grad-text-light bg-clip-text text-transparent dark:bg-grad-text">{c.accent}</span>
            </h1>
            <p className="mt-7 max-w-2xl text-base leading-8 text-ink-3 md:text-lg">{c.description}</p>
            <div className="mt-9 flex flex-wrap gap-3">
              <a href="#project-catalogue" className="btn-primary">{c.catalogue} <span aria-hidden="true">↓</span></a>
              <Link href={`/${lang}/contact`} className="btn-ghost">{c.contact} <span aria-hidden="true">↗</span></Link>
            </div>
            {projects.length > 0 && (
              <div className="mt-10 flex flex-wrap gap-x-8 gap-y-3 border-t border-white/10 pt-6 text-sm text-ink-3">
                <span><strong className="me-2 font-mono text-ink-0">{projects.length}</strong>{ar ? "مشروع منشور" : "published projects"}</span>
                <span><strong className="me-2 font-mono text-ink-0">{new Set(projects.map((project) => String(project.category_id ?? "")).filter(Boolean)).size}</strong>{ar ? "تصنيف مستخدم" : "categories represented"}</span>
              </div>
            )}
          </div>
          <div className="relative mx-auto my-2 aspect-square w-full max-w-[min(82vw,360px)] sm:max-w-[400px] lg:my-0 lg:max-w-[500px]" aria-hidden="true">
            <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle,rgba(91,107,255,0.11),transparent_65%)]" />
            <LazyVisual name="ProjectOrbit" className="absolute inset-0" rootMargin="320px 0px" />
            <div className="pointer-events-none absolute inset-x-[13%] bottom-[9%] h-20 rounded-full bg-[#050812]/60 blur-2xl" />
          </div>
        </div>
        <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-300/25 to-transparent" />
      </section>

      <section id="project-catalogue" className="relative mx-auto max-w-7xl px-5 py-16 md:px-8 md:py-24" aria-labelledby="project-catalogue-title">
        <div className="mb-9 max-w-3xl">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-violet-300">ARCHAI / WORK</p>
          <h2 id="project-catalogue-title" className="text-3xl font-semibold leading-tight tracking-tight text-ink-0 md:text-4xl">{c.catalogue}</h2>
          <p className="mt-4 text-base leading-8 text-ink-3">{c.catalogueDescription}</p>
        </div>

        {(!home.configured || home.dataError || home.compatibilityMode || projects.length === 0) && (
          <div className="mb-7 rounded-2xl border border-violet-300/20 bg-[var(--bg-1)]/70 p-5 md:p-6" role="status">
            <h3 className="text-base font-semibold text-ink-0">
              {!home.configured ? c.unconfiguredTitle : home.dataError ? c.errorTitle : home.compatibilityMode ? c.compatibilityTitle : c.emptyTitle}
            </h3>
            <p className="mt-2 max-w-3xl text-sm leading-7 text-ink-3">
              {!home.configured ? c.unconfiguredBody : home.dataError ? c.errorBody : home.compatibilityMode ? c.compatibilityBody : c.emptyBody}
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link className="btn-primary" href={`/${lang}/services`}>{c.services} ↗</Link>
              <Link className="btn-ghost" href={`/${lang}/contact`}>{c.contact} ↗</Link>
            </div>
          </div>
        )}

        {projects.length > 0 ? (
          <Explorer cats={cats} projects={projects} lang={lang} limit={projects.length} />
        ) : (
          <div className="rounded-3xl border border-dashed border-violet-300/25 bg-[var(--bg-1)]/45 p-8 text-center md:p-14">
            <h3 className="text-xl font-semibold text-ink-0">{c.emptyTitle}</h3>
            <p className="mx-auto mt-3 max-w-2xl leading-7 text-ink-3">{c.emptyBody}</p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link className="btn-primary" href={`/${lang}/services`}>{c.services} ↗</Link>
              <Link className="btn-ghost" href={`/${lang}/contact`}>{c.contact} ↗</Link>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
