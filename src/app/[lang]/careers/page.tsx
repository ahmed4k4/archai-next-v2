import MarketingPage from "@/components/marketing/MarketingPage";
import { pageSeo } from "@/lib/seo";
import { isLocale } from "@/lib/i18n";
import { notFound } from "next/navigation";
import type { Locale } from "@/lib/types";

const copy = {
  ar: {
    eyebrow: "الوظائف",
    title: "ابنِ ما",
    accent: "سيستخدمه العالم",
    description:
      "نبحث عن أشخاص يحبون حل المشكلات والتعلم المستمر وتحمل مسؤولية المنتج من الفكرة إلى الإطلاق.",
    cards: [
      { number: "01", icon: "◈", title: "هندسة البرمجيات", body: "تفكير عملي وحل المشكلات.", tags: ["CAREER", "TEAM"] },
      { number: "02", icon: "✳", title: "تصميم UI/UX", body: "تواصل واضح والعمل بروح الفريق.", tags: ["CAREER", "DESIGN"] },
      { number: "03", icon: "⌘", title: "الذكاء الاصطناعي والأتمتة", body: "اهتمام بالجودة وتجربة المستخدم.", tags: ["CAREER", "AI"] },
      { number: "04", icon: "↗", title: "الأنظمة المدمجة وIoT", body: "فضول تقني وتعلم مستمر.", tags: ["CAREER", "IOT"] },
    ],
    outroTitle: "خلينا نتعرف عليك",
    outroText: "أرسل نبذة عن خبرتك ومجالات اهتمامك وروابط أعمالك.",
  },
  en: {
    eyebrow: "CAREERS",
    title: "Build what",
    accent: "people rely on",
    description:
      "We value people who enjoy solving real problems, learning continuously and owning products end to end.",
    cards: [
      { number: "01", icon: "◈", title: "Software engineering", body: "Practical problem-solving mindset.", tags: ["CAREER", "TEAM"] },
      { number: "02", icon: "✳", title: "UI/UX design", body: "Clear communication and collaboration.", tags: ["CAREER", "DESIGN"] },
      { number: "03", icon: "⌘", title: "AI and automation", body: "Care for quality and user experience.", tags: ["CAREER", "AI"] },
      { number: "04", icon: "↗", title: "Embedded systems & IoT", body: "Technical curiosity and continuous learning.", tags: ["CAREER", "IOT"] },
    ],
    outroTitle: "Let's meet you",
    outroText: "Share your background, interests and work samples.",
  },
} as const;

export async function generateMetadata({ params }: { params: { lang: string } }) {
  const lang = isLocale(params.lang) ? params.lang : "en";
  const c = copy[lang];
  return pageSeo(lang, "careers", `${c.title} ${c.accent}`, c.description);
}

export default function Page({ params }: { params: { lang: string } }) {
  if (!isLocale(params.lang)) notFound();
  const lang = params.lang as Locale;
  const c = copy[lang];

  return (
    <MarketingPage
      lang={lang}
      kind="careers"
      eyebrow={c.eyebrow}
      title={c.title}
      accent={c.accent}
      description={c.description}
      primary={lang === "ar" ? "تواصل معنا" : "Talk to our team"}
      primaryHref={`/${lang}/contact`}
      secondary={lang === "ar" ? "استكشف الخدمات" : "Explore services"}
      secondaryHref={`/${lang}/services`}
      cards={c.cards}
      outroTitle={c.outroTitle}
      outroText={c.outroText}
      accentColor="mint"
    />
  );
}