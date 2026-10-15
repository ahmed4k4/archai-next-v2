import MarketingPage from "@/components/marketing/MarketingPage";
import { pageSeo } from "@/lib/seo";
import { marketingContent } from "@/lib/marketing-content";
import { getEditablePageCopy } from "@/lib/page-content";
import { isLocale } from "@/lib/i18n";
import { notFound } from "next/navigation";
import type { Locale } from "@/lib/types";
import { howToSchema, jsonLd } from "@/lib/structured-data";

export async function generateMetadata({
  params,
}: {
  params: { lang: string };
}) {
  const lang = isLocale(params.lang) ? params.lang : "en";
  const c = await getEditablePageCopy(lang, "process", marketingContent(lang, "process"));
  return pageSeo(lang, "process", c.seoTitle || `${c.title} ${c.accent}`, c.seoDescription || c.description);
}

export default async function Page({ params }: { params: { lang: string } }) {
  if (!isLocale(params.lang)) notFound();
  const lang = params.lang as Locale;
  const c = await getEditablePageCopy(lang, "process", marketingContent(lang, "process"));

  const steps = c.cards.map((card: any) => ({
    name: card.title,
    text: card.body,
  }));

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLd(
            howToSchema(
              lang,
              `${c.title} ${c.accent}`,
              c.description,
              steps
            )
          ),
        }}
      />
      <MarketingPage
        lang={lang}
        kind="process"
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
        sections={c.sections as Record<string, unknown> | null}
        accentColor="mint"
      />
    </>
  );
}