import MarketingPage from "@/components/marketing/MarketingPage";
import { pageSeo } from "@/lib/seo";
import { marketingContent } from "@/lib/marketing-content";
import { isLocale } from "@/lib/i18n";
import { notFound } from "next/navigation";
import type { Locale } from "@/lib/types";
import { servicesSchema, jsonLd } from "@/lib/structured-data";

export async function generateMetadata({
  params,
}: {
  params: { lang: string };
}) {
  const lang = isLocale(params.lang) ? params.lang : "en";
  const c = marketingContent(lang, "services");
  return pageSeo(lang, "services", `${c.title} ${c.accent}`, c.description, {
    keywords:
      lang === "ar"
        ? ["تطوير ويب", "أنظمة ERP", "ذكاء اصطناعي", "أنظمة مدمجة", "تطبيقات موبايل"]
        : [
            "web development",
            "ERP systems",
            "AI integration",
            "embedded systems",
            "mobile apps",
          ],
  });
}

export default function Page({ params }: { params: { lang: string } }) {
  if (!isLocale(params.lang)) notFound();
  const lang = params.lang as Locale;
  const c = marketingContent(lang, "services");

  const serviceItems = c.cards.map((card: any) => ({
    name: card.title,
    description: card.body,
  }));

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLd(servicesSchema(lang, serviceItems)),
        }}
      />
      <MarketingPage
        lang={lang}
        kind="services"
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
      />
    </>
  );
}