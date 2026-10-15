import Link from "next/link";
import { notFound } from "next/navigation";
import Explorer from "@/components/Explorer";
import LazyVisual from "@/components/visuals/LazyVisual";
import { getHome } from "@/lib/data";
import { isLocale, pick } from "@/lib/i18n";
import { pageSeo } from "@/lib/seo";
import { breadcrumbSchema, collectionPageSchema, jsonLd } from "@/lib/structured-data";
import { SITE_URL } from "@/lib/supabase";
import type { Locale } from "@/lib/types";
import { getEditablePageCopy } from "@/lib/page-content";

export const revalidate = 60;

const copy = {
  ar: {
    eyebrow: "دراسات حالة منشورة",
    title: "العمل الحقيقي",
    accent: "هو ما يحكي القصة",
    description: "تعرض هذه الصفحة المشروعات المنشورة والمميزة من قاعدة بيانات أركاي فقط. لا تُنشأ دراسات حالة وهمية أو سجلات مشاريع ثابتة داخل الكود.",
    list: "دراسات الحالة",
    listDescription: "تُدار أسماء المشروعات وصورها وبياناتها وتقنياتها وروابطها من لوحة الإدارة.",
    emptyTitle: "لا توجد دراسات حالة منشورة بعد",
    emptyBody: "انشر مشروعًا من لوحة الإدارة وحدد أنه مميز ليظهر هنا. يمكنك حاليًا استكشاف الخدمات أو التواصل لمناقشة احتياجك.",
    unavailableTitle: "بيانات المشروعات غير متاحة",
    unavailableBody: "تعذر الاتصال ببيانات المشروعات. تحقق من إعدادات Supabase وصلاحيات القراءة RLS. لا يعرض الموقع بيانات مشروعات ثابتة كبديل.",
    services: "الخدمات",
    contact: "تواصل معنا",
  },
  en: {
    eyebrow: "PUBLISHED CASE STUDIES",
    title: "Real work",
    accent: "tells the story",
    description: "This page displays featured, published projects from Archai’s database only. No fictional case studies or static project records are generated in source code.",
    list: "Case studies",
    listDescription: "Project names, images, descriptions, technologies and links are managed through the admin dashboard.",
    emptyTitle: "No published case studies yet",
    emptyBody: "Publish a project and mark it as featured in the admin dashboard to show it here. In the meantime, explore the services or contact the team.",
    unavailableTitle: "Project data is unavailable",
    unavailableBody: "Project data could not be read. Check Supabase configuration and RLS read policies. The site does not use static project records as a replacement.",
    services: "Services",
    contact: "Contact us",
  },
} as const;

export async function generateMetadata({ params }: { params: { lang: string } }) {
  const lang: Locale = isLocale(params.lang) ? params.lang : "en";
  const c = await getEditablePageCopy(lang, "case-studies", copy[lang]);
  return pageSeo(lang, "case-studies", c.seoTitle || `${c.title} ${c.accent}`, c.seoDescription || c.description, {
    keywords: lang === "ar"
      ? ["دراسات حالة أركاي", "مشروعات منشورة", "هندسة المنتجات الرقمية"]
      : ["Archai case studies", "published software projects", "digital product engineering"],
  });
}

export default async function CaseStudiesPage({ params }: { params: { lang: string } }) {
  if (!isLocale(params.lang)) notFound();
  const lang = params.lang as Locale;
  const ar = lang === "ar";
  const c = await getEditablePageCopy(lang, "case-studies", copy[lang]);
  const home = await getHome();
  const featured = home.projects.filter((project) => project.featured && (project.title_ar || project.title_en));
  const projects = featured.length ? featured : [];
  const url = `${SITE_URL}/${lang}/case-studies`;
  const title = `${c.title} ${c.accent}`;
  const schema = [
    collectionPageSchema(lang, title, c.description, url, projects.map((project) => ({
      name: pick(project, "title", lang),
      url: `${SITE_URL}/${lang}/projects/${project.slug || project.id}`,
    }))),
    breadcrumbSchema(lang, [
      { name: ar ? "الرئيسية" : "Home", url: `${SITE_URL}/${lang}` },
      { name: c.list, url },
    ]),
  ];

  return (
    <main data-route-ready="true" lang={lang} dir={ar ? "rtl" : "ltr"} className="relative min-h-screen overflow-x-clip">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(schema) }} />
      <section className="relative isolate overflow-hidden py-20 md:py-28">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_72%_45%,rgba(89,98,216,0.13),transparent_48%)]" />
        <div className="wrap relative grid items-center gap-8 lg:grid-cols-[1.05fr_.95fr]">
          <div className="relative z-10 max-w-3xl">
            <p className="section-kicker">{c.eyebrow}</p>
            <h1 className="mt-4 font-display text-5xl font-medium leading-[1.06] tracking-tight text-ink-0 md:text-6xl xl:text-7xl">
              {c.title}<br /><span className="bg-grad-text-light bg-clip-text text-transparent dark:bg-grad-text">{c.accent}</span>
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-ink-3 md:text-lg">{c.description}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href={`/${lang}/projects`} className="btn-primary">{c.list} ↗</Link>
              <Link href={`/${lang}/contact`} className="btn-ghost">{c.contact} ↗</Link>
            </div>
          </div>
          <div className="relative mx-auto aspect-square w-full max-w-[470px]" aria-hidden="true">
            <LazyVisual name="ProjectOrbit" className="absolute inset-0" rootMargin="280px 0px" />
          </div>
        </div>
      </section>

      <section className="wrap pb-24" aria-labelledby="case-studies-title">
        <div className="mb-8 max-w-3xl">
          <h2 id="case-studies-title" className="section-title">{c.list}</h2>
          <p className="mt-4 leading-7 text-ink-3">{c.listDescription}</p>
        </div>
        {(!home.configured || home.dataError) ? (
          <div role="status" className="rounded-2xl border border-violet-300/20 bg-[var(--bg-1)]/70 p-6">
            <h3 className="font-semibold text-ink-0">{c.unavailableTitle}</h3>
            <p className="mt-2 max-w-3xl text-sm leading-7 text-ink-3">{c.unavailableBody}</p>
          </div>
        ) : projects.length ? (
          <Explorer cats={home.cats} projects={projects} lang={lang} limit={projects.length} />
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
