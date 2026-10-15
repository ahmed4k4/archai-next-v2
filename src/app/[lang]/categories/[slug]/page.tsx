import Link from "next/link";
import { notFound } from "next/navigation";
import Slider from "@/components/Slider";
import Explorer from "@/components/Explorer";
import CategoryCards from "@/components/CategoryCards";
import LazyVisual from "@/components/visuals/LazyVisual";
import { sceneForCategory } from "@/components/visuals/PageScenes";
import { getHome } from "@/lib/data";
import { LOCALES, pick, tr } from "@/lib/i18n";
import { SITE_URL } from "@/lib/supabase";
import { pageSeo } from "@/lib/seo";
import {
  breadcrumbSchema,
  collectionPageSchema,
  jsonLd,
} from "@/lib/structured-data";

export const revalidate = 60;

export async function generateStaticParams() {
  const { cats } = await getHome();
  return LOCALES.flatMap((lang) =>
    cats.map((c) => ({ lang, slug: c.slug }))
  );
}

export async function generateMetadata({
  params,
}: {
  params: { lang: string; slug: string };
}) {
  const { lang, slug } = params;
  const { cats } = await getHome();
  const c = cats.find((x) => x.slug === slug);
  if (!c) return {};
  const desc = pick(c, "description", lang as any);
  const title = pick(c, "name", lang as any);
  return pageSeo(lang as any, `categories/${slug}`, title, desc || title);
}

export default async function CategoryPage({
  params,
}: {
  params: { lang: string; slug: string };
}) {
  const { lang, slug } = params;
  const T = tr(lang as any);
  const { cats, projects } = await getHome();
  const cat = cats.find((c) => c.slug === slug);
  if (!cat) notFound();

  const list = projects
    .filter((p) => String(p.category_id ?? "") === String(cat.id))
    .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));

  const feat = list
    .filter((p) => p.featured)
    .sort(
      (a, b) =>
        (a.featured_sort_order || 0) - (b.featured_sort_order || 0) ||
        (a.sort_order || 0) - (b.sort_order || 0)
    );

  const slides = (feat.length ? feat : list).slice(0, 6);
  const others = cats.filter((c) => c.id !== cat.id);
  const name = pick(cat, "name", lang as any);
  const desc = pick(cat, "description", lang as any);

  return (
    <main data-route-ready="true" className="wrap py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLd(
            breadcrumbSchema(lang as any, [
              { name: T("home"), url: `${SITE_URL}/${lang}` },
              {
                name,
                url: `${SITE_URL}/${lang}/categories/${slug}`,
              },
            ])
          ),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLd(
            collectionPageSchema(
              lang as any,
              name,
              desc || name,
              `${SITE_URL}/${lang}/categories/${slug}`,
              list.map((p) => ({
                name: pick(p, "title", lang as any),
                url: `${SITE_URL}/${lang}/projects/${p.slug || p.id}`,
              }))
            )
          ),
        }}
      />

      {/* Breadcrumb */}
      <nav
        className="flex items-center gap-2 text-xs text-ink-4 mb-8"
        aria-label="Breadcrumb"
      >
        <Link href={`/${lang}`} className="hover:text-violet-300 transition-colors">
          {T("home")}
        </Link>
        <span>›</span>
        <span className="text-ink-2">{name}</span>
      </nav>

      {/* Hero header */}
      <header data-gsap-scene className="relative mb-12 p-8 lg:p-12 rounded-4xl glass overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-grad-primary opacity-15 blur-3xl rounded-full pointer-events-none" />
        <div className="absolute inset-y-0 right-0 rtl:left-0 rtl:right-auto w-1/2 opacity-50 pointer-events-none" data-gsap-parallax="18">
          <LazyVisual name={sceneForCategory(cat)} className="absolute inset-0" rootMargin="220px 0px" />
        </div>
        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center gap-6">
          <span className="w-20 h-20 grid place-items-center rounded-3xl bg-violet-500/10 border border-violet-500/30 text-4xl shrink-0">
            {cat.icon || "◆"}
          </span>
          <div className="flex-1">
            <span className="section-kicker">{T("categories")}</span>
            <h1 className="section-title mt-2">{name}</h1>
            {desc && (
              <p className="text-ink-3 mt-3 max-w-2xl leading-relaxed">{desc}</p>
            )}
          </div>
          <div className="text-center p-5 rounded-2xl bg-white/[0.03] border border-violet-500/20">
            <b className="block font-display text-4xl font-medium bg-grad-text-light dark:bg-grad-text bg-clip-text text-transparent">
              {list.length}
            </b>
            <span className="text-xs text-ink-4 font-mono uppercase tracking-wider">
              {T("projectsWord")}
            </span>
          </div>
        </div>
      </header>

      {/* Slider */}
      {slides.length > 0 && (
        <Slider
          items={slides}
          lang={lang as any}
          label={feat.length ? T("featT") : T("topInCat")}
        />
      )}

      {/* All projects */}
      <h2 className="section-title mt-16 mb-8">{T("allInCat")}</h2>
      <Explorer
        cats={[cat]}
        projects={list}
        lang={lang as any}
        fixedCat
      />

      {/* Other categories */}
      {others.some((c) => projects.some((p) => String(p.category_id ?? "") === String(c.id))) && (
        <section className="mt-20">
          <h2 className="section-title mb-8">{T("otherCats")}</h2>
          <CategoryCards cats={others} projects={projects} lang={lang as any} />
        </section>
      )}
    </main>
  );
}