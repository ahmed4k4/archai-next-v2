import MarketingPage from "@/components/marketing/MarketingPage";
import { pageSeo } from "@/lib/seo";
import { isLocale } from "@/lib/i18n";
import { notFound } from "next/navigation";
import type { Locale } from "@/lib/types";
import { getEditablePageCopy } from "@/lib/page-content";

const copy = {
  ar: {
    eyebrow: "الأسئلة الشائعة",
    title: "إجابات واضحة",
    accent: "قبل أن نبدأ",
    description:
      "معلومات تساعدك على فهم طريقة العمل، نطاق المشاريع، والتعاون مع Archai.",
    cards: [
      { number: "01", icon: "◈", title: "ما أنواع المشاريع التي تنفذونها؟", body: "نحدد الأهداف والمستخدمين والقيود أولًا.", tags: ["GUIDANCE", "SCOPE"] },
      { number: "02", icon: "✳", title: "كيف يبدأ المشروع؟", body: "نقسم العمل إلى مراحل ومخرجات واضحة.", tags: ["GUIDANCE", "DELIVERY"] },
      { number: "03", icon: "⌘", title: "كيف تتم متابعة التقدم؟", body: "نتفق على نقاط مراجعة وتواصل منتظم.", tags: ["GUIDANCE", "REVIEW"] },
      { number: "04", icon: "↗", title: "هل يمكن تطوير مشروع قائم؟", body: "نراجع البنية الحالية قبل اقتراح التعديلات.", tags: ["GUIDANCE", "LEGACY"] },
    ],
    outroTitle: "لم تجد إجابتك؟",
    outroText: "أرسل سؤالك من صفحة التواصل وسنساعدك في تحديد الخطوة المناسبة.",
  },
  en: {
    eyebrow: "FAQ",
    title: "Clear answers",
    accent: "before we begin",
    description:
      "Helpful context on our delivery approach, project scope and how to work with Archai.",
    cards: [
      { number: "01", icon: "◈", title: "What kinds of projects do you build?", body: "We clarify goals, users and constraints first.", tags: ["GUIDANCE", "SCOPE"] },
      { number: "02", icon: "✳", title: "How does a project start?", body: "Work is divided into clear phases and deliverables.", tags: ["GUIDANCE", "DELIVERY"] },
      { number: "03", icon: "⌘", title: "How is progress tracked?", body: "We agree on regular reviews and communication.", tags: ["GUIDANCE", "REVIEW"] },
      { number: "04", icon: "↗", title: "Can you improve an existing product?", body: "We assess the current architecture before proposing changes.", tags: ["GUIDANCE", "LEGACY"] },
    ],
    outroTitle: "Still have a question?",
    outroText: "Send your question through the contact page and we will help identify the right next step.",
  },
} as const;

export async function generateMetadata({ params }: { params: { lang: string } }) {
  const lang = isLocale(params.lang) ? params.lang : "en";
  const c = await getEditablePageCopy(lang, "faq", copy[lang]);
  return pageSeo(lang, "faq", c.seoTitle || `${c.title} ${c.accent}`, c.seoDescription || c.description);
}

export default async function Page({ params }: { params: { lang: string } }) {
  if (!isLocale(params.lang)) notFound();
  const lang = params.lang as Locale;
  const c = await getEditablePageCopy(lang, "faq", copy[lang]);

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: c.cards.map((card) => ({
      "@type": "Question",
      name: card.title,
      acceptedAnswer: { "@type": "Answer", text: card.body },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema).replace(/</g, "\\u003c") }}
      />
      <MarketingPage
        lang={lang}
        kind="faq"
        eyebrow={c.eyebrow}
        title={c.title}
        accent={c.accent}
        description={c.description}
        primary={c.primary || (lang === "ar" ? "تواصل معنا" : "Talk to us")}
        primaryHref={c.primaryHref || `/${lang}/contact`}
        secondary={c.secondary || (lang === "ar" ? "استكشف الخدمات" : "Explore services")}
        secondaryHref={c.secondaryHref || `/${lang}/services`}
        cards={c.cards}
        outroTitle={c.outroTitle}
        outroText={c.outroText}
        sections={c.sections as Record<string, unknown> | null}
        accentColor="rose"
      />
    </>
  );
}
