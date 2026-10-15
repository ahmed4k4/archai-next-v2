import MarketingPage from "@/components/marketing/MarketingPage";
import { pageSeo } from "@/lib/seo";
import { marketingContent } from "@/lib/marketing-content";
import { getEditablePageCopy } from "@/lib/page-content";
import { isLocale } from "@/lib/i18n";
import { notFound } from "next/navigation";
import type { Locale } from "@/lib/types";

export async function generateMetadata({ params }: { params: { lang: string } }) {
  const lang = isLocale(params.lang) ? params.lang : "en";
  const c = await getEditablePageCopy(lang, "insights", marketingContent(lang, "insights"));
  return pageSeo(lang, "insights", c.seoTitle || `${c.title} ${c.accent}`, c.seoDescription || c.description);
}

export default async function Page({ params }: { params: { lang: string } }) {
  if (!isLocale(params.lang)) notFound();
  const lang = params.lang as Locale;
  const c = await getEditablePageCopy(lang, "insights", marketingContent(lang, "insights"));

  return (
    <MarketingPage
      lang={lang}
      kind="insights"
      eyebrow={c.eyebrow}
      title={c.title}
      accent={c.accent}
      description={c.description}
      primary={lang === "ar" ? "ابدأ مشروعك" : "Start your project"}
      primaryHref={`/${lang}/contact`}
      secondary={lang === "ar" ? "استكشف المشاريع" : "Explore projects"}
      secondaryHref={`/${lang}/projects`}
      cards={c.cards}
      outroTitle={c.outroTitle}
      outroText={c.outroText}
      accentColor="violet"
    />
  );
}