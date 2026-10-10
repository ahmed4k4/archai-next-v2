import Link from "next/link";
import { notFound } from "next/navigation";
import Gallery from "../../../../components/Gallery";
import ProjectCard from "../../../../components/ProjectCard";
import { getHome, getProject } from "../../../../lib/data";
import { LOCALES, pick, tr, safeUrl } from "../../../../lib/i18n";
import { SITE_URL } from "../../../../lib/supabase";

export const revalidate = 60;

export async function generateStaticParams() {
  const { projects } = await getHome();
  return LOCALES.flatMap((lang) => projects.map((p) => ({ lang, id: p.id })));
}

export async function generateMetadata({ params }) {
  const { lang, id } = params;
  const p = await getProject(id);
  if (!p) return {};
  const title = pick(p, "title", lang);
  const description = pick(p, "summary", lang) || (lang === "ar" ? `تفاصيل مشروع ${title} من أعمال Archai Solutions.` : `Project details for ${title}, built by Archai Solutions.`);
  const image = p.cover_image || p.featured_image;
  const canonical = `${SITE_URL}/${lang}/projects/${id}`;
  return {
    title,
    description,
    alternates: { canonical, languages: { ar: `${SITE_URL}/ar/projects/${id}`, en: `${SITE_URL}/en/projects/${id}` } },
    openGraph: { title: `${title} | Archai Solutions`, description, url: canonical, siteName: "Archai Solutions", type: "article", images: image ? [{ url: image, alt: title }] : undefined },
    twitter: { card: "summary_large_image", title: `${title} | Archai Solutions`, description, images: image ? [image] : undefined },
  };
}

export default async function ProjectPage({ params }) {
  const { lang, id } = params;
  const T = tr(lang);
  const p = await getProject(id);
  if (!p) notFound();

  const { projects } = await getHome();
  const title = pick(p, "title", lang);
  const catName = pick(p.categories, "name", lang);
  const tg = p.project_technologies.map((x) => x.technology);
  const ins = p.project_industries.map((x) => x.industry);
  let images = [...p.project_images].sort((a, b) => Number(b.is_hero) - Number(a.is_hero) || a.sort_order - b.sort_order);
  if (!images.length && p.cover_image) images = [{ public_url: p.cover_image }];

  const score = (x) =>
    (x.category_id && x.category_id === p.category_id ? 2 : 0) +
    x.project_technologies.filter((y) => tg.includes(y.technology)).length +
    x.project_industries.filter((y) => ins.includes(y.industry)).length;
  const related = projects
    .filter((x) => x.id !== p.id)
    .map((x) => [score(x), x])
    .filter((a) => a[0] > 0)
    .sort((a, b) => b[0] - a[0])
    .slice(0, 3)
    .map((a) => a[1]);

  const live = p.live_url ? (
    <a className="btn p" target="_blank" rel="noopener noreferrer" href={safeUrl(p.live_url)}>
      {T("visit")} ↗
    </a>
  ) : null;
  const chips = (a) => (a.length ? a.map((x) => <span className="badge" key={x}>{x}</span>) : "—");

  const projectSchema = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: title,
    description: pick(p, "summary", lang) || pick(p, "description", lang),
    url: `${SITE_URL}/${lang}/projects/${id}`,
    image: p.cover_image || p.featured_image || undefined,
    inLanguage: lang,
    keywords: [...tg, ...ins].join(", ") || undefined,
    creator: { "@type": "Organization", name: "Archai Solutions", url: SITE_URL },
  };
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: lang === "ar" ? "الرئيسية" : "Home", item: `${SITE_URL}/${lang}` },
      ...(p.categories ? [{ "@type": "ListItem", position: 2, name: catName, item: `${SITE_URL}/${lang}/categories/${p.categories.slug}` }] : []),
      { "@type": "ListItem", position: p.categories ? 3 : 2, name: title, item: `${SITE_URL}/${lang}/projects/${id}` },
    ],
  };

  return (
    <main className="wrap">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(projectSchema).replace(/</g, "\\u003c") }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema).replace(/</g, "\\u003c") }} />
      <nav className="crumb reveal" aria-label="Breadcrumb">
        <Link href={`/${lang}`}>{T("home")}</Link> <span aria-hidden="true">›</span>{" "}
        {p.categories ? (
          <>
            <Link href={`/${lang}/categories/${p.categories.slug}`}>{catName}</Link> <span aria-hidden="true">›</span>{" "}
          </>
        ) : null}
        <span>{title}</span>
      </nav>

      <header className="reveal">
        <div style={{ display: "flex", gap: ".5rem", flexWrap: "wrap", marginBottom: ".6rem" }}>
          {p.categories ? (
            <Link className="badge c" href={`/${lang}/categories/${p.categories.slug}`}>{catName}</Link>
          ) : (
            <span className="badge c">{T("other")}</span>
          )}
          {p.featured ? <span className="badge">★ {T("feat")}</span> : null}
        </div>
        <h1 className="ptitle">{title}</h1>
        <p className="psum">{pick(p, "summary", lang)}</p>
        <div className="row">{live}</div>
      </header>

      <Gallery images={images} title={title} lang={lang} />

      <div className="pg">
        <section className="box reveal">
          <h2 className="ph2">{T("details")}</h2>
          <p className="pre">{pick(p, "description", lang) || pick(p, "summary", lang)}</p>
          <h3 className="ph3">{T("tech")}</h3>
          <div>{chips(tg)}</div>
          <h3 className="ph3">{T("ind")}</h3>
          <div>{chips(ins)}</div>
        </section>
        <aside className="reveal">
          <div className="box">
            <h3 className="ph3" style={{ marginTop: 0 }}>{T("info")}</h3>
            <p>
              {T("cat")}: <b>{catName || "—"}</b>
              <br />
              {T("status")}: <b>{p.status}</b>
            </p>
          </div>
          {p.live_url ? (
            <div className="box" style={{ marginTop: "var(--sp-4)" }}>
              <h3 className="ph3" style={{ marginTop: 0 }}>{T("tryT")}</h3>
              <p>{T("tryD")}</p>
              {live}
            </div>
          ) : null}
        </aside>
      </div>

      {related.length ? (
        <>
          <h2 className="st reveal">{T("related")}</h2>
          <div className="grid stagger">
            {related.map((x) => (
              <ProjectCard key={x.id} p={x} lang={lang} />
            ))}
          </div>
        </>
      ) : null}
    </main>
  );
}
