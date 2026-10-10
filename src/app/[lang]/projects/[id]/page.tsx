import Link from "next/link";
import { notFound } from "next/navigation";
import Gallery from "@/components/Gallery";
import ProjectCard from "@/components/ProjectCard";
import Backdrop from "@/components/visuals/Backdrop";
import { getHome, getProject } from "@/lib/data";
import { LOCALES, pick, tr, safeUrl, projectImages } from "@/lib/i18n";
import { SITE_URL } from "@/lib/supabase";
import { pageSeo } from "@/lib/seo";
import {
  projectSchema,
  breadcrumbSchema,
  jsonLd,
} from "@/lib/structured-data";

export const revalidate = 60;

export async function generateStaticParams() {
  const { projects } = await getHome();
  return LOCALES.flatMap((lang) =>
    projects.map((p) => ({ lang, id: p.id }))
  );
}

export async function generateMetadata({
  params,
}: {
  params: { lang: string; id: string };
}) {
  const { lang, id } = params;
  const p = await getProject(id);
  if (!p) return {};
  const title = pick(p, "title", lang as any);
  const description =
    pick(p, "summary", lang as any) ||
    (lang === "ar"
      ? `تفاصيل مشروع ${title} من أعمال Archai Solutions.`
      : `Project details for ${title}, built by Archai Solutions.`);

  const images = [
    p.cover_image,
    p.featured_image,
    p.hero_image,
    ...(p.project_images?.map((i) => i.public_url) || []),
  ].filter(Boolean) as string[];

  const keywords = [
    ...p.project_technologies.map((t) => t.technology),
    ...p.project_industries.map((i) => i.industry),
    pick(p.categories, "name", lang as any),
  ].filter(Boolean);

  return pageSeo(lang as any, `projects/${id}`, title, description, {
    keywords,
    images,
    type: "article",
    publishedTime: (p as any).created_at,
    modifiedTime: (p as any).updated_at,
  });
}

export default async function ProjectPage({
  params,
}: {
  params: { lang: string; id: string };
}) {
  const { lang, id } = params;
  const T = tr(lang as any);
  const p = await getProject(id);
  if (!p) notFound();

  const { projects } = await getHome();
  const title = pick(p, "title", lang as any);
  const catName = pick(p.categories, "name", lang as any);
  const tg = p.project_technologies.map((x) => x.technology);
  const ins = p.project_industries.map((x) => x.industry);

  const images = projectImages(p);

  const score = (x: any) =>
    (x.category_id && x.category_id === p.category_id ? 2 : 0) +
    x.project_technologies.filter((y) => tg.includes(y.technology)).length +
    x.project_industries.filter((y) => ins.includes(y.industry)).length;

  const related = projects
    .filter((x) => x.id !== p.id)
    .map((x) => [score(x), x] as [number, any])
    .filter((a) => a[0] > 0)
    .sort((a, b) => b[0] - a[0])
    .slice(0, 3)
    .map((a) => a[1]);

  const live = p.live_url ? (
    <a
      className="btn-primary"
      target="_blank"
      rel="noopener noreferrer"
      href={safeUrl(p.live_url)}
    >
      {T("visit")} ↗
    </a>
  ) : null;

  const chips = (a: string[]) =>
    a.length ? (
      <div className="flex flex-wrap gap-2">
        {a.map((x) => (
          <span
            key={x}
            className="px-3 py-1.5 rounded-lg bg-violet-500/10 border border-violet-500/30 text-violet-200 text-xs font-mono"
          >
            {x}
          </span>
        ))}
      </div>
    ) : (
      <span className="text-ink-4">—</span>
    );

  return (
    <main className="wrap py-12">
      <Backdrop name="project" />
      {/* Schemas */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLd(projectSchema(lang as any, p, catName)),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLd(
            breadcrumbSchema(lang as any, [
              { name: T("home"), url: `${SITE_URL}/${lang}` },
              ...(p.categories
                ? [
                    {
                      name: catName,
                      url: `${SITE_URL}/${lang}/categories/${p.categories.slug}`,
                    },
                  ]
                : []),
              { name: title, url: `${SITE_URL}/${lang}/projects/${id}` },
            ])
          ),
        }}
      />

      {/* Breadcrumb */}
      <nav
        className="flex items-center gap-2 text-xs text-ink-4 mb-8 flex-wrap"
        aria-label="Breadcrumb"
      >
        <Link href={`/${lang}`} className="hover:text-violet-300 transition-colors">
          {T("home")}
        </Link>
        <span>›</span>
        {p.categories && (
          <>
            <Link
              href={`/${lang}/categories/${p.categories.slug}`}
              className="hover:text-violet-300 transition-colors"
            >
              {catName}
            </Link>
            <span>›</span>
          </>
        )}
        <span className="text-ink-2">{title}</span>
      </nav>

      {/* Header */}
      <header className="mb-10">
        <div className="flex gap-2 flex-wrap mb-4">
          {p.categories ? (
            <Link className="badge" href={`/${lang}/categories/${p.categories.slug}`}>
              {catName}
            </Link>
          ) : (
            <span className="badge">{T("other")}</span>
          )}
          {p.featured && (
            <span className="badge border-amber-500/30 text-amber-400 bg-amber-500/10">
              ★ {T("feat")}
            </span>
          )}
        </div>

        <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-medium tracking-tight leading-tight text-ink-0 mb-4">
          {title}
        </h1>
        <p className="text-lg text-ink-3 max-w-3xl leading-relaxed">
          {pick(p, "summary", lang as any)}
        </p>
        {live && <div className="mt-6">{live}</div>}
      </header>

      {/* Gallery */}
      <Gallery images={images} title={title} lang={lang as any} />

      {/* Body */}
      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-8 mt-12">
        <section className="glass p-8">
          <h2 className="font-display text-2xl font-medium text-ink-0 mb-4">
            {T("details")}
          </h2>
          <p className="text-ink-2 leading-relaxed whitespace-pre-line">
            {pick(p, "description", lang as any) ||
              pick(p, "summary", lang as any)}
          </p>

          <h3 className="font-display text-lg font-medium text-ink-0 mt-8 mb-3">
            {T("tech")}
          </h3>
          {chips(tg)}

          <h3 className="font-display text-lg font-medium text-ink-0 mt-8 mb-3">
            {T("ind")}
          </h3>
          {chips(ins)}
        </section>

        <aside>
          <div className="glass p-6">
            <h3 className="font-display text-lg font-medium text-ink-0 mb-4">
              {T("info")}
            </h3>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-ink-4">{T("cat")}</dt>
                <dd className="text-ink-1 font-medium">{catName || "—"}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink-4">{T("status")}</dt>
                <dd className="text-mint-300 font-medium">
                  {p.status || "published"}
                </dd>
              </div>
            </dl>
          </div>

          {p.live_url && (
            <div className="glass p-6 mt-4">
              <h3 className="font-display text-lg font-medium text-ink-0 mb-2">
                {T("tryT")}
              </h3>
              <p className="text-sm text-ink-3 mb-4">{T("tryD")}</p>
              {live}
            </div>
          )}
        </aside>
      </div>

      {/* Related */}
      {related.length > 0 && (
        <>
          <h2 className="font-display text-3xl font-medium text-ink-0 mt-20 mb-8">
            {T("related")}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {related.map((x) => (
              <ProjectCard key={x.id} p={x} lang={lang as any} />
            ))}
          </div>
        </>
      )}
    </main>
  );
}