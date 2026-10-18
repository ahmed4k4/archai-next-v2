import type { Locale } from "@/lib/types";

/**
 * A motion-led overview of the studio's engineering focus.
 * Avoids fabricated client logos/names: only capabilities described elsewhere on the site are shown.
 */
const FOCUS_AREAS = [
  "DIGITAL PRODUCT ENGINEERING",
  "AI & WORKFLOW AUTOMATION",
  "EMBEDDED SYSTEMS",
  "IOT & CONNECTIVITY",
  "BUSINESS PLATFORMS",
  "DATA & API INTEGRATION",
  "PERFORMANCE-LED UX",
  "INTERACTIVE 3D EXPERIENCES",
];

type ClientShowcaseProps = { lang: Locale; content?: Record<string, unknown> | null; visible?: boolean };

export default function ClientShowcase({ lang, content, visible = true }: ClientShowcaseProps) {
  const ar = lang === "ar";
  const supplied = content && typeof content === "object" ? content : {};
  const labels = Array.isArray(supplied.items) && supplied.items.every((item) => typeof item === "string")
    ? supplied.items as string[] : [...FOCUS_AREAS];
  const items = [...labels, ...labels];
  if (!visible) return null;

  return (
    <section className="home-focus-showcase relative overflow-hidden py-16" aria-label={ar ? "مجالات أركاي الهندسية" : "Archai engineering focus"}>
      <div className="wrap">
        <div>
          <div className="mb-8 flex items-center gap-3">
            <span className="h-px w-6 bg-mint-400" />
            <span className="section-kicker mb-0">{(ar ? supplied.headingAr : supplied.headingEn) as string || (ar ? "مجالاتنا الهندسية" : "ENGINEERING FOCUS")}</span>
          </div>
          <p className="mb-8 max-w-2xl text-sm leading-7 text-ink-3">
            {(ar ? supplied.descriptionAr : supplied.descriptionEn) as string || (ar
              ? "مجموعة من التخصصات التي ندمجها وفق احتياج كل منتج، وليست قائمة عملاء أو شعارات تجارية."
              : "A practical set of disciplines we combine around each product’s needs—not a list of client brands or endorsements.")}
          </p>
        </div>
      </div>

      <div className="relative" style={{ perspective: "900px" }}>
        <div className="relative overflow-hidden" style={{ transform: "rotateX(8deg)", transformStyle: "preserve-3d" }}>
          <div className={`focus-marquee-track flex w-max gap-4 md:gap-6 ${ar ? "is-rtl" : "is-ltr"}`}>

            {items.map((name, i) => (
              <div
                key={`${name}-${i}`}
                className="group flex shrink-0 items-center gap-3 rounded-2xl border border-violet-500/15 bg-white/[0.025] px-5 py-4 md:px-6"
                style={{ boxShadow: "0 12px 40px rgba(3,5,16,.28)" }}
              >
                <span className="h-2 w-2 rounded-full bg-mint-400 shadow-glow-mint-sm" />
                <span className="whitespace-nowrap font-mono text-xs tracking-[0.14em] text-ink-2 transition-colors group-hover:text-ink-0 md:text-sm">
                  {name}
                </span>
              </div>
            ))}
          </div>
          <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-[var(--bg-0)] to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-[var(--bg-0)] to-transparent" />
        </div>
      </div>
    </section>
  );
}
