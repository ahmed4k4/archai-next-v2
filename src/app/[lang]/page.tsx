import Hero from "../../components/Hero";
import Slider from "../../components/Slider";
import Explorer from "../../components/Explorer";
import CategoryCards from "../../components/CategoryCards";
import ClientShowcase from "../../components/ClientShowcase";
import HomeGrowthSections from "../../components/HomeGrowthSections";
import { getHome } from "../../lib/data";
import { isLocale, tr } from "../../lib/i18n";
import type { Locale } from "../../lib/types";
import { pageSeo } from "@/lib/seo";
import { jsonLd, organizationSchema, websiteSchema } from "@/lib/structured-data";

export const revalidate = 60;

export async function generateMetadata({ params }: { params: { lang: string } }) {
  const lang: Locale = isLocale(params.lang) ? params.lang : "en";
  const ar = lang === "ar";
  return pageSeo(
    lang,
    "",
    ar
      ? "أركاي للحلول البرمجية | تطوير الويب والذكاء الاصطناعي والأنظمة المتصلة"
      : "Archai Solutions | Web Engineering, AI Integration & Connected Systems",
    ar
      ? "نصمم ونطور منصات الويب والمنتجات الرقمية وتكاملات الذكاء الاصطناعي وأنظمة IoT بحلول عملية قابلة للتوسع والصيانة."
      : "We design and build web platforms, digital products, AI integrations and connected IoT systems with practical, scalable engineering.",
    {
      keywords: ar
        ? ["شركة برمجيات", "تطوير مواقع", "تطوير منصات", "تكامل الذكاء الاصطناعي", "أنظمة ERP", "الأنظمة المدمجة", "إنترنت الأشياء"]
        : ["software development company", "web development", "digital product engineering", "AI integration", "ERP systems", "embedded systems", "IoT solutions"],
    },
  );
}

export default async function Home({ params }) {
  const { lang } = params;
  const T = tr(lang);
  const { cats, projects, settings, configured } = await getHome();
  const vis = settings.section_visibility || {};
  const featured = projects
    .filter((p) => p.featured)
    .sort((a, b) => a.featured_sort_order - b.featured_sort_order || a.sort_order - b.sort_order)
    .slice(0, settings.featured_limit || 6);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd([organizationSchema(lang, settings), websiteSchema(lang)]) }}
      />
      {vis.hero !== false ? <Hero lang={lang} settings={settings} count={projects.length} /> : null}
      <main className="wrap" id="app">
        {!configured ? (
          <div className="notice">
            <b>{T("setupTitle")}</b>
            <p>{T("setupBody")}</p>
          </div>
        ) : null}
        {featured.length && vis.featured !== false ? (
          <Slider id="sl" items={featured} lang={lang} label={T("featT")} />
        ) : null}
        {cats.length ? (
          <section className="catsec">
            <h2 className="st reveal">{T("browseCats")}</h2>
            <p className="subline reveal">{T("browseSub")}</p>
            <CategoryCards cats={cats} projects={projects} lang={lang} />
          </section>
        ) : null}
        <Explorer cats={cats} projects={projects} lang={lang} limit={settings.projects_per_category || 6} />
      </main>
      <HomeGrowthSections lang={lang} />
      <ClientShowcase lang={lang} />
    </>
  );
}
