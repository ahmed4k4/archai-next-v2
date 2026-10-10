import MarketingPage from "@/components/marketing/MarketingPage";
import { pageSeo } from "@/lib/seo";
import { isLocale } from "@/lib/i18n";
import { notFound } from "next/navigation";
import type { Locale } from "@/lib/types";

const copy = {
  ar: {
    eyebrow: "دراسات الحالة",
    title: "من الفكرة إلى",
    accent: "أثر ملموس",
    description:
      "نماذج توضح كيف تتحول التحديات المعقدة إلى منتجات رقمية مفيدة وقابلة للتوسع.",
    cards: [
      { number: "01", icon: "◈", title: "منصات الأعمال", body: "تحليل المشكلة وسياق الاستخدام قبل اختيار التقنية.", tags: ["ARCHAI", "ENGINEERING"] },
      { number: "02", icon: "✳", title: "تجارب التجارة الرقمية", body: "تصميم تجربة واضحة وتدفق عمل عملي.", tags: ["COMMERCE", "UX"] },
      { number: "03", icon: "⌘", title: "أنظمة الإدارة والتشغيل", body: "هندسة قابلة للتوسع مع اختبار الجودة.", tags: ["ERP", "SCALE"] },
      { number: "04", icon: "↗", title: "حلول IoT والأنظمة المدمجة", body: "قياس النتائج والتحسين المستمر.", tags: ["IOT", "EMBEDDED"] },
    ],
    outroTitle: "كل مشروع له قصة هندسية",
    outroText: "استكشف المشاريع المنشورة وتواصل معنا لمناقشة تحديك القادم.",
  },
  en: {
    eyebrow: "CASE STUDIES",
    title: "From concept to",
    accent: "measurable impact",
    description:
      "Examples of how complex challenges become useful, connected and scalable digital products.",
    cards: [
      { number: "01", icon: "◈", title: "Business platforms", body: "Understand the problem and context before choosing technology.", tags: ["ARCHAI", "ENGINEERING"] },
      { number: "02", icon: "✳", title: "Digital commerce", body: "Design a clear experience and practical workflow.", tags: ["COMMERCE", "UX"] },
      { number: "03", icon: "⌘", title: "Operations systems", body: "Build scalable architecture and validate quality.", tags: ["ERP", "SCALE"] },
      { number: "04", icon: "↗", title: "IoT & embedded", body: "Measure outcomes and continuously improve.", tags: ["IOT", "EMBEDDED"] },
    ],
    outroTitle: "Every project has an engineering story",
    outroText: "Explore published work and talk to us about your next challenge.",
  },
} as const;

export async function generateMetadata({ params }: { params: { lang: string } }) {
  const lang = isLocale(params.lang) ? params.lang : "en";
  const c = copy[lang];
  return pageSeo(lang, "case-studies", `${c.title} ${c.accent}`, c.description);
}

export default function Page({ params }: { params: { lang: string } }) {
  if (!isLocale(params.lang)) notFound();
  const lang = params.lang as Locale;
  const c = copy[lang];

  return (
    <MarketingPage
      lang={lang}
      kind="case-studies"
      eyebrow={c.eyebrow}
      title={c.title}
      accent={c.accent}
      description={c.description}
      primary={lang === "ar" ? "تواصل معنا" : "Talk to us"}
      primaryHref={`/${lang}/contact`}
      secondary={lang === "ar" ? "استكشف الخدمات" : "Explore services"}
      secondaryHref={`/${lang}/services`}
      cards={c.cards}
      outroTitle={c.outroTitle}
      outroText={c.outroText}
      accentColor="violet"
    />
  );
}