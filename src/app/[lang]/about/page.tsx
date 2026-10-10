import MarketingPage from "@/components/marketing/MarketingPage";
import AboutStats from "@/components/marketing/AboutStats";
import { pageSeo } from "@/lib/seo";
import { marketingContent } from "@/lib/marketing-content";
import { isLocale } from "@/lib/i18n";
import { notFound } from "next/navigation";
import type { Locale } from "@/lib/types";
import { SITE_URL } from "@/lib/supabase";
import { jsonLd } from "@/lib/structured-data";

export async function generateMetadata({
  params,
}: {
  params: { lang: string };
}) {
  const lang = isLocale(params.lang) ? params.lang : "en";
  const c = marketingContent(lang, "about");
  return pageSeo(lang, "about", `${c.title} ${c.accent}`, c.description);
}

export default function Page({ params }: { params: { lang: string } }) {
  if (!isLocale(params.lang)) notFound();
  const lang = params.lang as Locale;
  const c = marketingContent(lang, "about");

  const aboutSchema = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    name: `${c.title} ${c.accent}`,
    description: c.description,
    url: `${SITE_URL}/${lang}/about`,
    inLanguage: lang === "ar" ? "ar-EG" : "en-US",
    mainEntity: { "@id": `${SITE_URL}/#organization` },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(aboutSchema) }}
      />
      <MarketingPage
        lang={lang}
        kind="about"
        eyebrow={c.eyebrow}
        title={c.title}
        accent={c.accent}
        description={c.description}
        primary={lang === "ar" ? "ابدأ مشروعك" : "Start your project"}
        primaryHref="https://landing-ideas.web.app/"
        secondary={lang === "ar" ? "استكشف المشاريع" : "Explore projects"}
        secondaryHref={`/${lang}#list`}
        cards={c.cards}
        outroTitle={c.outroTitle}
        outroText={c.outroText}
        accentColor="violet"
        sectionExtra={<AboutStats lang={lang} />}
      />
    </>
  );
}