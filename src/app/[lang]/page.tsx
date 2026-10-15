import Hero from "../../components/Hero";
import ClientShowcase from "../../components/ClientShowcase";
import HomeOverview from "../../components/HomeOverview";
import HomeProjectsCTA from "../../components/HomeProjectsCTA";
import TechnologyStack from "../../components/TechnologyStack";
import { getHome } from "../../lib/data";
import { tr, pick, isLocale } from "../../lib/i18n";
import { pageSeo } from "../../lib/seo";
import type { Locale } from "../../lib/types";
import { getPageContent } from "../../lib/page-content";

export const revalidate = 60;

export async function generateMetadata({ params }: { params: { lang: string } }) {
  const lang: Locale = isLocale(params.lang) ? params.lang : "ar";
  const [{ settings }, cmsHome] = await Promise.all([getHome(), getPageContent("home", lang)]);
  const title = cmsHome?.seo_title || (lang === "ar"
    ? "تطوير البرمجيات والذكاء الاصطناعي والمنتجات الرقمية"
    : "Software, AI & Digital Product Engineering");
  const description = cmsHome?.seo_description || pick(settings, "home_desc", lang) || (lang === "ar"
    ? "أركاي للحلول البرمجية: نبني المنتجات الرقمية ومنصات الويب وحلول الذكاء الاصطناعي والأنظمة المدمجة وإنترنت الأشياء."
    : "Archai Solutions designs and builds digital products, web platforms, AI-powered workflows, and embedded and IoT systems.");
  return pageSeo(lang, "", title, description, {
    keywords: lang === "ar"
      ? ["أركاي للحلول البرمجية", "شركة برمجة", "تطوير مواقع وتطبيقات", "الذكاء الاصطناعي", "أنظمة ERP", "إنترنت الأشياء", "أنظمة مدمجة"]
      : ["Archai Solutions", "software development company", "web development", "AI integration", "ERP systems", "embedded systems", "IoT solutions"],
  });
}

export default async function Home({ params }) {
  const { lang } = params;
  const T = tr(lang);
  const [{ cats, projects, settings, configured, dataError }, cmsHome] = await Promise.all([getHome(), getPageContent("home", lang)]);
  const cmsSections = (cmsHome?.sections && typeof cmsHome.sections === "object" ? cmsHome.sections : {}) as Record<string, any>;
  const heroCapabilities = Array.isArray(cmsSections.heroCapabilities)
    ? cmsSections.heroCapabilities.filter((item: unknown): item is string => typeof item === "string").slice(0, 3)
    : undefined;
  const visibility = settings.section_visibility || {};
  const vis = settings.section_visibility || {};
  const projectCategories = cats.filter((category) =>
    projects.some((project) => String(project.category_id ?? "") === String(category.id))
  );

  return (
    <main id="app" data-route-ready="true" lang={lang} dir={lang === "ar" ? "rtl" : "ltr"}>
      {vis.hero !== false ? (
        <Hero
          lang={lang}
          settings={settings}
          count={projects.filter((project) => project.status === "published").length}
          categoryCount={projectCategories.length}
          primaryLabel={cmsHome?.primary_label || undefined}
          primaryHref={cmsHome?.primary_href || undefined}
          secondaryLabel={cmsHome?.secondary_label || undefined}
          secondaryHref={cmsHome?.secondary_href || undefined}
          capabilityLabels={heroCapabilities}
          eyebrow={cmsHome?.eyebrow || undefined}
        />
      ) : null}
      <div className="wrap">
        {!configured || dataError ? (
          <div className="notice" role="status">
            <b>{!configured ? T("setupTitle") : lang === "ar" ? "تعذر تحميل بيانات المشروعات" : "Project data could not be loaded"}</b>
            <p>{!configured ? T("setupBody") : lang === "ar" ? "لم يتم استبدال بيانات قاعدة البيانات بسجلات مشروعات ثابتة. تحقق من الاتصال بـ Supabase وصلاحيات القراءة RLS." : "The database was not replaced with static project records. Check the Supabase connection and RLS read policies."}</p>
          </div>
        ) : null}
      </div>
      {vis.overview !== false ? (
        <HomeOverview
          lang={lang}
          overrides={(cmsSections.homeOverview || null) as Record<string, unknown> | null}
          visibility={visibility}
        />
      ) : null}
      <HomeProjectsCTA
        lang={lang}
        projectCount={projects.filter((project) => project.status === "published").length}
        categoryCount={projectCategories.length}
        content={(cmsSections.homeProjectsCTA || null) as Record<string, unknown> | null}
        visible={vis.projectsCta !== false}
      />
      <TechnologyStack
        lang={lang}
        content={(cmsSections.technology || null) as Record<string, unknown> | null}
        stacksOverride={cmsSections.technologyStacks}
        visible={vis.technology !== false}
      />
      <ClientShowcase
        lang={lang}
        content={(cmsSections.focus || null) as Record<string, unknown> | null}
        visible={vis.focus !== false}
      />
    </main>
  );
}
