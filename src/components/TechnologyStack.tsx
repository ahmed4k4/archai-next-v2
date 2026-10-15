import Link from "next/link";
import type { Locale } from "@/lib/types";

const stacks = [
  {
    en: "Frontend engineering", ar: "تطوير الواجهات",
    items: ["React", "TypeScript", "Next.js", "Tailwind CSS", "Three.js", "Framer Motion"],
    tone: "violet",
  },
  {
    en: "Backend & data", ar: "الخلفية والبيانات",
    items: ["Node.js", "Python", "Go", "Rust", "PostgreSQL", "Redis"],
    tone: "mint",
  },
  {
    en: "Embedded systems", ar: "الأنظمة المدمجة",
    items: ["C / C++", "Zephyr RTOS", "FreeRTOS", "ARM Cortex-M", "FPGA", "VHDL / Verilog"],
    tone: "blue",
  },
  {
    en: "AI & machine learning", ar: "الذكاء الاصطناعي وتعلم الآلة",
    items: ["PyTorch", "TensorFlow", "ONNX Runtime", "Hugging Face", "LangChain", "OpenCV"],
    tone: "violet",
  },
  {
    en: "Cloud & DevOps", ar: "السحابة وعمليات التطوير",
    items: ["Kubernetes", "Docker", "AWS", "Google Cloud", "Terraform", "GitLab CI"],
    tone: "mint",
  },
  {
    en: "IoT & connectivity", ar: "إنترنت الأشياء والاتصال",
    items: ["MQTT", "LoRaWAN", "BLE", "Modbus", "OPC UA", "Thread"],
    tone: "blue",
  },
  {
    en: "Mobile applications", ar: "تطبيقات الهواتف",
    items: ["React Native", "Flutter", "Swift", "Kotlin", "Expo", "Capacitor"],
    tone: "violet",
  },
] as const;

const copy = {
  en: {
    eyebrow: "TECHNOLOGY STACK / 007",
    title: "The right tool for the real problem.",
    description: "We choose technologies for fit, reliability, maintainability and performance—not because a tool is trending. The stack adapts to each product's requirements and operating constraints.",
    note: "Technology choices depend on each project's scope, integrations, team and deployment environment.",
    link: "Explore our engineering services",
  },
  ar: {
    eyebrow: "التقنيات / 007",
    title: "نختار التقنية المناسبة للمشكلة الحقيقية.",
    description: "نختار التقنيات وفق ملاءمتها وموثوقيتها وسهولة صيانتها وأدائها، لا لمجرد انتشارها. تتحدد الأدوات بحسب احتياجات المنتج وقيود التشغيل الفعلية.",
    note: "يختلف الاختيار التقني حسب نطاق المشروع والتكاملات والفريق وبيئة التشغيل.",
    link: "استكشف خدماتنا الهندسية",
  },
} as const;

type TechnologyStackProps = {
  lang: Locale;
  content?: Record<string, unknown> | null;
  stacksOverride?: unknown;
  visible?: boolean;
};

export default function TechnologyStack({ lang, content, stacksOverride, visible = true }: TechnologyStackProps) {
  const ar = lang === "ar";
  const c = { ...copy[ar ? "ar" : "en"], ...(content && typeof content === "object" ? content : {}) } as typeof copy.ar;
  const visibleStacks = Array.isArray(stacksOverride) ? stacksOverride as Array<{ en: string; ar: string; items: string[]; tone: string }> : stacks;
  if (!visible) return null;

  return (
    <section id="technology-stack" className="technology-stack relative isolate overflow-hidden py-20 md:py-28" aria-labelledby="technology-stack-title" lang={lang} dir={ar ? "rtl" : "ltr"}>
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_15%_18%,rgba(124,92,255,0.11),transparent_38%),radial-gradient(ellipse_at_86%_75%,rgba(76,226,208,0.07),transparent_34%)]" />
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <div className="mb-10 grid gap-6 lg:mb-14 lg:grid-cols-[0.8fr_1.2fr] lg:items-end lg:gap-12" data-gsap-scene>
          <div>
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-mint-300">{c.eyebrow}</p>
            <h2 id="technology-stack-title" className="max-w-2xl text-3xl font-semibold leading-tight tracking-tight text-ink-0 md:text-5xl">{c.title}</h2>
          </div>
          <div>
            <p className="max-w-3xl text-sm leading-8 text-ink-3 md:text-base">{c.description}</p>
            <p className="mt-3 text-xs leading-6 text-ink-4">{c.note}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {visibleStacks.map((stack, index) => (
            <article key={stack.en} className="technology-stack-card group relative overflow-hidden rounded-2xl border border-white/10 bg-[var(--bg-1)]/75 p-5 transition-[border-color,background,transform] duration-300 hover:-translate-y-1 hover:border-violet-300/30 hover:bg-[var(--bg-2)] md:p-6" data-gsap-scene>
              <div className="mb-5 flex items-center justify-between gap-4">
                <span className="font-mono text-xs tracking-[0.16em] text-mint-300">{String(index + 1).padStart(2, "0")}</span>
                <span className={`technology-stack-signal technology-stack-signal-${stack.tone}`} aria-hidden="true" />
              </div>
              <h3 className="mb-5 text-lg font-semibold text-ink-0">{ar ? stack.ar : stack.en}</h3>
              <ul className="flex flex-wrap gap-2" aria-label={ar ? `تقنيات ${stack.ar}` : stack.en}>
                {stack.items.map((technology) => (
                  <li key={technology} className="rounded-lg border border-white/[0.09] bg-white/[0.025] px-2.5 py-1.5 font-mono text-[11px] text-ink-2 transition-colors group-hover:border-violet-300/20 group-hover:text-ink-0">{technology}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-between gap-5 rounded-2xl border border-white/10 bg-white/[0.02] p-5 md:p-7" data-gsap-scene>
          <p className="max-w-2xl text-sm leading-7 text-ink-3">{ar ? "تحتاج إلى اختيار بنية تقنية أو تطوير نظام قائم؟ نبدأ بفهم الاستخدام والقيود ثم نحدد الاختيارات المناسبة." : "Choosing an architecture or improving an existing system? We start with the use case and constraints, then select the stack that fits."}</p>
          <Link href={`/${lang}/services`} className="btn-primary">{c.link} <span aria-hidden="true">↗</span></Link>
        </div>
      </div>
    </section>
  );
}
