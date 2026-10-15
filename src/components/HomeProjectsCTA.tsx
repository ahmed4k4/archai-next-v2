import Link from "next/link";
import type { Locale } from "@/lib/types";

type Props = {
  lang: Locale;
  projectCount: number;
  categoryCount: number;
  content?: Record<string, unknown> | null;
  visible?: boolean;
};

export default function HomeProjectsCTA({ lang, projectCount, categoryCount, content, visible = true }: Props) {
  const ar = lang === "ar";
  const supplied = content && typeof content === "object" ? content : {};
  if (!visible) return null;
  const eyebrow = (ar ? supplied.eyebrowAr : supplied.eyebrowEn) as string || (ar ? "أرشيف الأعمال" : "PROJECT ARCHIVE");
  const title = (ar ? supplied.titleAr : supplied.titleEn) as string || (ar ? "كل مشروع له هدف. وكل حل يبدأ بفهم المشكلة." : "Every project has a purpose. Every solution starts by understanding the problem.");
  const description = (ar ? supplied.descriptionAr : supplied.descriptionEn) as string || (ar
    ? "تصفح مجموعة مشروعات أركاي في صفحة مستقلة، واكتشف أنواع المنتجات الرقمية والأنظمة التي نصممها ونطورها، مع تفاصيل كل مشروع وتقنياته وروابطه المتاحة."
    : "Explore Archai’s work in a dedicated catalogue with project details, technologies, categories and available live links—without turning the homepage into a crowded portfolio grid.");
  const primary = (ar ? supplied.primaryAr : supplied.primaryEn) as string || (ar ? "استكشف كل المشروعات" : "Explore all projects");
  const secondary = (ar ? supplied.secondaryAr : supplied.secondaryEn) as string || (ar ? "منهجية دراسات الحالة" : "How we approach case studies");
  return (
    <section className="home-projects-cta py-20 md:py-28" aria-labelledby="home-projects-title">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <div className="home-projects-panel relative isolate overflow-hidden rounded-[2rem] border border-white/10 px-6 py-9 md:px-12 md:py-14">
          <div className="home-projects-orbit-system" aria-hidden="true">
            <span className="home-projects-orbit home-projects-orbit-a" />
            <span className="home-projects-orbit home-projects-orbit-b" />
            <span className="home-projects-orbit home-projects-orbit-c" />
            <span className="home-projects-planet" />
            <span className="home-projects-moon" />
          </div>
          <div className="relative z-10 max-w-3xl">
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.22em] text-mint-300">
              {eyebrow}
            </p>
            <h2 id="home-projects-title" className="max-w-2xl text-3xl font-semibold leading-tight tracking-tight text-ink-0 md:text-5xl">
              {title}
            </h2>
            <p className="mt-5 max-w-2xl text-base leading-8 text-ink-3 md:text-lg">
              {description}
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link href={`/${lang}/projects`} prefetch={true} className="btn-primary">
                {primary}
                <span aria-hidden="true">↗</span>
              </Link>
              <Link href={`/${lang}/case-studies`} className="btn-ghost">
                {secondary}
              </Link>
            </div>
            {projectCount > 0 ? (
              <div className="mt-9 flex flex-wrap gap-x-8 gap-y-3 border-t border-white/10 pt-5 text-sm text-ink-3">
                <span><strong className="me-2 font-mono text-ink-0">{projectCount}</strong>{ar ? "مشروع منشور" : "published projects"}</span>
                {categoryCount > 0 ? <span><strong className="me-2 font-mono text-ink-0">{categoryCount}</strong>{ar ? "مجموعة تخصصية" : "project categories"}</span> : null}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
