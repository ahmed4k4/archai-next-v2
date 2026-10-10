import Hero from "../../components/Hero";
import Slider from "../../components/Slider";
import Explorer from "../../components/Explorer";
import CategoryCards from "../../components/CategoryCards";
import { getHome } from "../../lib/data";
import { tr } from "../../lib/i18n";

export const revalidate = 60;

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
    </>
  );
}
