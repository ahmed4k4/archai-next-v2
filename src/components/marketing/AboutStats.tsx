import type { Locale } from "@/lib/types";

/** Animated capability highlights; intentionally avoids unverified success metrics. */
const HIGHLIGHTS = [
  {
    index: "01",
    titleAr: "6 مسارات خدمة أساسية",
    titleEn: "Six core service lines",
    bodyAr: "تطوير الويب، أنظمة الأعمال، الذكاء الاصطناعي، الأنظمة المدمجة وإنترنت الأشياء، تطبيقات الموبايل، والدعم المستمر.",
    bodyEn: "Web development, business systems, AI, embedded and IoT, mobile applications, and ongoing support.",
  },
  {
    index: "02",
    titleAr: "لغتان، تجربة واحدة",
    titleEn: "Two languages, one experience",
    bodyAr: "تجربة عربية وإنجليزية مع مراعاة اتجاه الكتابة وتنسيق الواجهة في كل لغة.",
    bodyEn: "Arabic and English experiences designed around the right reading direction and layout for each language.",
  },
  {
    index: "03",
    titleAr: "من الواجهات إلى الأجهزة",
    titleEn: "From interfaces to devices",
    bodyAr: "نجمع تطوير الويب والموبايل وتكامل الذكاء الاصطناعي والأنظمة المدمجة ضمن نطاق هندسي متكامل.",
    bodyEn: "Our technical scope spans web and mobile products, practical AI integrations, and embedded systems.",
  },
  {
    index: "04",
    titleAr: "ما بعد الإطلاق أيضًا",
    titleEn: "Beyond launch",
    bodyAr: "يشمل نطاق العمل الصيانة وتحسين الأداء والمراجعات التقنية وتطوير المنتج على مراحل.",
    bodyEn: "The service scope includes maintenance, performance improvements, technical reviews, and iterative product development.",
  },
];

type AboutHighlight = {
  index?: string;
  title?: string;
  body?: string;
  titleAr?: string;
  titleEn?: string;
  bodyAr?: string;
  bodyEn?: string;
};

export default function AboutStats({ lang, items }: { lang: Locale; items?: unknown }) {
  const ar = lang === "ar";
  const supplied = Array.isArray(items)
    ? (items as AboutHighlight[]).filter((item) => item && typeof item === "object" && (
        typeof item.title === "string" || typeof item.titleAr === "string" || typeof item.titleEn === "string"
      )).slice(0, 8)
    : null;
  // An explicit empty CMS array means the editor intentionally removed this section's cards.
  if (supplied && supplied.length === 0) return null;
  const highlights = supplied
    ? supplied.map((item, i) => ({
        index: typeof item.index === "string" && item.index.trim() ? item.index : String(i + 1).padStart(2, "0"),
        title: typeof item.title === "string" ? item.title : (ar ? item.titleAr : item.titleEn) || "",
        body: typeof item.body === "string" ? item.body : (ar ? item.bodyAr : item.bodyEn) || "",
      }))
    : HIGHLIGHTS.map((item) => ({
        index: item.index,
        title: ar ? item.titleAr : item.titleEn,
        body: ar ? item.bodyAr : item.bodyEn,
      }));

  return (
    <section className="wrap py-20" aria-labelledby="about-capabilities-title">
      <h2 id="about-capabilities-title" className="sr-only">
        {ar ? "نطاق قدرات أركاي" : "Archai capabilities"}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {highlights.map((item, i) => (
          <article
            key={item.index}
            className="about-highlight-card relative h-full min-h-56 p-6 rounded-3xl glass overflow-hidden"
            style={{ animationDelay: `${Math.min(i, 7) * 60}ms` }}
          >
            <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full bg-grad-primary opacity-10 blur-2xl" />
            <div className="relative flex items-center justify-between gap-3 mb-8">
              <span className="font-mono text-[10px] tracking-[0.18em] text-ink-4">ARCHAI / {item.index}</span>
              <span aria-hidden="true" className="w-2 h-2 rounded-full bg-mint-300 shadow-[0_0_16px_rgba(76,226,208,0.45)]" />
            </div>
            <h3 className="relative font-display text-xl leading-snug font-medium text-ink-0 mb-3">
              {item.title}
            </h3>
            <p className="relative text-sm leading-relaxed text-ink-3">
              {item.body}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
