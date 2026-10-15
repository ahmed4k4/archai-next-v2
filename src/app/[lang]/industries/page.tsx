import MarketingPage from "@/components/marketing/MarketingPage";
import { pageSeo } from "@/lib/seo";
import { marketingContent } from "@/lib/marketing-content";
import { getEditablePageCopy } from "@/lib/page-content";
import { isLocale } from "@/lib/i18n";
import { notFound } from "next/navigation";
import type { Locale } from "@/lib/types";

export async function generateMetadata({ params }: { params: { lang: string } }) {
  const lang = isLocale(params.lang) ? params.lang : "en";
  const c = await getEditablePageCopy(lang, "industries", marketingContent(lang, "industries"));
  return pageSeo(lang, "industries", c.seoTitle || `${c.title} ${c.accent}`, c.seoDescription || c.description);
}

export default async function Page({ params }: { params: { lang: string } }) {
  if (!isLocale(params.lang)) notFound();
  const lang = params.lang as Locale;
  const c = await getEditablePageCopy(lang, "industries", marketingContent(lang, "industries"));

  return (
    <MarketingPage
      lang={lang}
      kind="industries"
      eyebrow={c.eyebrow}
      title={c.title}
      accent={c.accent}
      description={c.description}
      primary={c.primary || (lang === "ar" ? "ابدأ مشروعك" : "Start your project")}
      primaryHref={c.primaryHref || `/${lang}/contact`}
      secondary={c.secondary || (lang === "ar" ? "استكشف المشاريع" : "Explore projects")}
      secondaryHref={c.secondaryHref || `/${lang}/projects`}
      cards={c.cards}
      outroTitle={c.outroTitle}
      sections={c.sections as Record<string, unknown> | null}
      outroText={c.outroText}
      accentColor="mint"
    />
  );
}