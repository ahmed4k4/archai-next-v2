import Link from "next/link";
import { notFound } from "next/navigation";
import Slider from "../../../../components/Slider";
import Explorer from "../../../../components/Explorer";
import CategoryCards from "../../../../components/CategoryCards";
import { getHome } from "../../../../lib/data";
import { LOCALES, pick, tr } from "../../../../lib/i18n";
import { SITE_URL } from "../../../../lib/supabase";

export const revalidate = 60;

export async function generateStaticParams() {
  const { cats } = await getHome();
  return LOCALES.flatMap((lang) => cats.map((c) => ({ lang, slug: c.slug })));
}

export async function generateMetadata({ params }) {
  const { lang, slug } = params;
  const { cats } = await getHome();
  const c = cats.find((x) => x.slug === slug);
  if (!c) return {};
  const desc = pick(c, "description", lang);
  const title = pick(c, "name", lang);
  const canonical = `${SITE_URL}/${lang}/categories/${slug}`;
  return {
    title,
    description: desc || (lang === "ar" ? `استكشف مشاريع أركاي في ${title} والتقنيات والحلول المستخدمة.` : `Explore Archai Solutions projects in ${title}, including the technologies and solutions behind them.`),
    alternates: { canonical, languages: { ar: `${SITE_URL}/ar/categories/${slug}`, en: `${SITE_URL}/en/categories/${slug}` } },
    openGraph: { title: `${title} | Archai Solutions`, description: desc || title, url: canonical, siteName: "Archai Solutions", type: "website" },
    twitter: { card: "summary", title: `${title} | Archai Solutions`, description: desc || title },
  };
}

export default async function CategoryPage({ params }) {
  const { lang, slug } = params;
  const T = tr(lang);
  const { cats, projects } = await getHome();
  const cat = cats.find((c) => c.slug === slug);
  if (!cat) notFound();

  const list = projects.filter((p) => p.category_id === cat.id).sort((a, b) => a.sort_order - b.sort_order);
  const feat = list
    .filter((p) => p.featured)
    .sort((a, b) => a.featured_sort_order - b.featured_sort_order || a.sort_order - b.sort_order);
  const slides = (feat.length ? feat : list).slice(0, 6);
  const others = cats.filter((c) => c.id !== cat.id);
  const name = pick(cat, "name", lang);
  const desc = pick(cat, "description", lang);
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: lang === "ar" ? "الرئيسية" : "Home", item: `${SITE_URL}/${lang}` },
      { "@type": "ListItem", position: 2, name, item: `${SITE_URL}/${lang}/categories/${slug}` },
    ],
  };

  return (
    <main className="wrap">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema).replace(/</g, "\\u003c") }} />
      <nav className="crumb reveal" aria-label="Breadcrumb">
        <Link href={`/${lang}`}>{T("home")}</Link> <span aria-hidden="true">›</span> <span>{name}</span>
      </nav>

      <header className="cathero reveal">
        <span className="cathero-ic" aria-hidden="true">{cat.icon || "◆"}</span>
        <div className="cathero-tx">
          <span className="eyebrow">{T("categories")}</span>
          <h1>{name}</h1>
          {desc ? <p>{desc}</p> : null}
        </div>
        <div className="cathero-count">
          <b>{list.length}</b>
          <span>{T("projectsWord")}</span>
        </div>
      </header>

      {slides.length ? (
        <Slider items={slides} lang={lang} label={feat.length ? T("featT") : T("topInCat")} />
      ) : null}

      <h2 className="st reveal">{T("allInCat")}</h2>
      <Explorer cats={[cat]} projects={list} lang={lang} fixedCat />

      {others.some((c) => projects.some((p) => p.category_id === c.id)) ? (
        <section className="catsec">
          <h2 className="st reveal">{T("otherCats")}</h2>
          <CategoryCards cats={others} projects={projects} lang={lang} />
        </section>
      ) : null}
    </main>
  );
}
