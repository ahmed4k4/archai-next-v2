import Link from "next/link";
import type { Locale } from "@/lib/types";

type OverviewContent = {
  eyebrow: string;
  title: string;
  description: string;
  capabilitiesTitle: string;
  capabilities: { number: string; title: string; text: string }[];
  audienceEyebrow: string;
  audienceTitle: string;
  audiences: { title: string; text: string }[];
  principlesTitle: string;
  principles: { title: string; text: string }[];
  processTitle: string;
  process: { number: string; title: string; text: string }[];
  note: string;
  faqEyebrow: string;
  faqTitle: string;
  questions: { q: string; a: string }[];
  faqLink: string;
  ctaTitle: string;
  ctaText: string;
  services: string;
  contact: string;
};

const content: Record<"ar" | "en", OverviewContent> = {
  ar: {
    eyebrow: "من الفكرة إلى الإطلاق",
    title: "نبني أنظمة رقمية تعمل معًا، لا مجرد صفحات منفصلة",
    description: "تجمع أركاي بين هندسة البرمجيات والتصميم وتجربة المستخدم والأنظمة الذكية لتحويل احتياجات العمل إلى منتجات عملية قابلة للتطوير.",
    capabilitiesTitle: "ما الذي يمكننا بناؤه؟",
    capabilities: [
      { number: "01", title: "المنتجات والمنصات الرقمية", text: "مواقع مؤسسية، متاجر إلكترونية، لوحات تحكم وتطبيقات ويب مصممة لتكون سريعة وسهلة الاستخدام." },
      { number: "02", title: "الذكاء الاصطناعي والأتمتة", text: "دمج نماذج الذكاء الاصطناعي في سير العمل، وأتمتة المهام المتكررة، وبناء أدوات تساعد الفرق على اتخاذ قرارات أفضل." },
      { number: "03", title: "الأنظمة المدمجة وإنترنت الأشياء", text: "ربط الأجهزة والمستشعرات والأنظمة المادية بالبرمجيات ولوحات المتابعة والتحكم." },
      { number: "04", title: "أنظمة الأعمال والبيانات", text: "أنظمة إدارة داخلية، تكاملات API، تقارير ولوحات مؤشرات تساعد على تنظيم العمليات ومتابعة الأداء." },
    ],
    audienceEyebrow: "لمن نبني الحلول؟",
    audienceTitle: "حلول تقنية تناسب سياقات عمل مختلفة",
    audiences: [
      { title: "شركات في مرحلة النمو", text: "منصات قابلة للتوسع بدل إعادة بناء النظام كلما زاد حجم العمل." },
      { title: "فرق التشغيل والإدارة", text: "لوحات تحكم وتكاملات تساعد على تقليل العمل اليدوي ورؤية العمليات بوضوح." },
      { title: "منتجات رقمية جديدة", text: "تحويل الفكرة إلى نطاق واضح وتجربة قابلة للاختبار ثم التطوير على مراحل." },
      { title: "أجهزة وأنظمة متصلة", text: "ربط الأجهزة والمستشعرات والبرمجيات ضمن تجربة واحدة قابلة للمتابعة." },
    ],
    principlesTitle: "معايير نضعها في كل مشروع",
    principles: [
      { title: "أداء محسوب", text: "نراعي سرعة التحميل واستجابة الواجهة وحجم الموارد منذ بداية التخطيط." },
      { title: "بنية قابلة للصيانة", text: "نفضّل تنظيمًا واضحًا ومكونات قابلة لإعادة الاستخدام يسهل تطويرها لاحقًا." },
      { title: "تكامل عملي", text: "نصمم واجهات API وتدفقات البيانات لتتوافق مع الأدوات والأنظمة الموجودة عند الحاجة." },
      { title: "اختبار قبل الإطلاق", text: "نراجع المسارات الأساسية وحالات الخطأ والتوافق قبل اعتبار العمل جاهزًا." },
    ],
    processTitle: "طريقة عمل واضحة من البداية",
    process: [
      { number: "01", title: "نفهم الهدف", text: "نحدد المشكلة والمستخدمين والأولويات قبل اختيار التقنية." },
      { number: "02", title: "نخطط التجربة", text: "نرتب تدفق الاستخدام والواجهات وبنية الحل حول احتياج حقيقي." },
      { number: "03", title: "نبني ونختبر", text: "نطور على مراحل، ونراجع الوظائف والأداء والتوافق قبل الإطلاق." },
      { number: "04", title: "نطلق ونحسن", text: "نجهز الحل للنشر ونحدد فرص التطوير بناءً على الاستخدام والنتائج." },
    ],
    note: "كل مشروع له نطاقه وأولوياته؛ نختار الأدوات والبنية بناءً على احتياجه بدل فرض حل واحد على الجميع.",
    faqEyebrow: "قبل أن نبدأ",
    faqTitle: "أسئلة مهمة في بداية أي مشروع",
    questions: [
      { q: "هل يمكن ربط الحل بأنظمتنا الحالية؟", a: "نراجع الأنظمة الحالية وواجهات API وتدفقات البيانات أولًا، ثم نحدد ما يمكن تكامله بأمان ووضوح ضمن النطاق." },
      { q: "هل يمكن تطوير منتج موجود بالفعل؟", a: "نعم؛ يمكن بدء العمل بمراجعة تجربة الاستخدام والأداء والبنية التقنية، ثم ترتيب التحسينات حسب أثرها وأولويتها." },
      { q: "كيف نحدد الوقت والتكلفة؟", a: "نحدد المطلوب والقيود والأولويات أولًا، ثم نقسم العمل إلى مراحل ونوضح نطاق كل مرحلة قبل الالتزام بالتنفيذ." },
    ],
    faqLink: "كل الأسئلة الشائعة",
    ctaTitle: "لديك فكرة أو تحدٍ تقني؟",
    ctaText: "شاركنا الهدف، وسنساعدك في تحديد الخطوة العملية التالية ونطاق الحل المناسب.",
    services: "استكشف خدماتنا",
    contact: "ناقش مشروعك",
  },
  en: {
    eyebrow: "From idea to launch",
    title: "We build connected digital systems, not just standalone pages",
    description: "Archai combines software engineering, design, user experience and intelligent systems to turn business needs into practical products that can grow.",
    capabilitiesTitle: "What can we build?",
    capabilities: [
      { number: "01", title: "Digital products & platforms", text: "Corporate websites, commerce experiences, dashboards and web apps designed to be fast and intuitive." },
      { number: "02", title: "AI & workflow automation", text: "Integrate AI into real workflows, automate repetitive tasks and build tools that help teams make better decisions." },
      { number: "03", title: "Embedded systems & IoT", text: "Connect devices, sensors and physical systems with software, monitoring and control interfaces." },
      { number: "04", title: "Business systems & data", text: "Internal tools, API integrations, reports and dashboards that help organize operations and track performance." },
    ],
    audienceEyebrow: "WHO WE BUILD FOR",
    audienceTitle: "Technology shaped around different operating contexts",
    audiences: [
      { title: "Growing businesses", text: "Scalable platforms that can evolve as operations and customer needs grow." },
      { title: "Operations teams", text: "Dashboards and integrations that reduce repetitive work and make workflows easier to monitor." },
      { title: "New digital products", text: "Turn an idea into a clear scope, a testable experience and a product that can improve in stages." },
      { title: "Connected environments", text: "Bring devices, sensors and software together in a system that can be monitored and maintained." },
    ],
    principlesTitle: "Principles behind every delivery",
    principles: [
      { title: "Performance by design", text: "Loading speed, interface response and resource use are considered from the planning stage." },
      { title: "Maintainable architecture", text: "Clear structure and reusable components make future changes easier to reason about." },
      { title: "Practical integration", text: "APIs and data flows are designed to work with existing tools and systems when needed." },
      { title: "Validate before launch", text: "Core journeys, error states and compatibility are reviewed before release." },
    ],
    processTitle: "A clear delivery process from day one",
    process: [
      { number: "01", title: "Understand", text: "Define the problem, users and priorities before choosing technology." },
      { number: "02", title: "Shape the experience", text: "Plan user flows, interfaces and architecture around real needs." },
      { number: "03", title: "Build & validate", text: "Deliver in stages and review functionality, performance and compatibility." },
      { number: "04", title: "Launch & improve", text: "Prepare the solution for release and identify improvements from real usage." },
    ],
    note: "Every project has its own scope and priorities. We choose tools and architecture to fit the problem instead of forcing one solution on every team.",
    faqEyebrow: "BEFORE WE START",
    faqTitle: "Questions worth answering at the start",
    questions: [
      { q: "Can the solution integrate with our current systems?", a: "We review current tools, APIs and data flows first, then define a safe and practical integration scope." },
      { q: "Can you improve a product that already exists?", a: "Yes. We can assess usability, performance and architecture, then prioritize improvements based on impact and risk." },
      { q: "How are time and cost estimated?", a: "We clarify needs, constraints and priorities, then break the work into stages with a defined scope before delivery begins." },
    ],
    faqLink: "Browse all FAQs",
    ctaTitle: "Have an idea or a technical challenge?",
    ctaText: "Tell us what you want to achieve and we will help identify a practical next step and a suitable scope.",
    services: "Explore our services",
    contact: "Discuss your project",
  },
};

type OverviewProps = {
  lang: Locale;
  overrides?: Record<string, unknown> | null;
  visibility?: Record<string, boolean>;
};

export default function HomeOverview({ lang, overrides, visibility = {} }: OverviewProps) {
  const base = content[lang === "ar" ? "ar" : "en"];
  const supplied = overrides && typeof overrides === "object" ? overrides : {};

  const text = (key: keyof OverviewContent): string => {
    const value = supplied[key];
    return typeof value === "string" && value.trim() ? value.trim().slice(0, 12_000) : base[key] as string;
  };

  const safeArray = <T extends object>(
    value: unknown,
    fallback: readonly T[],
    requiredKeys: readonly string[],
  ): T[] | readonly T[] => {
    if (!Array.isArray(value) || value.length > 150) return fallback;
    const valid = value.filter((item): item is T => {
      if (!item || typeof item !== "object" || Array.isArray(item)) return false;
      const record = item as Record<string, unknown>;
      return requiredKeys.every((key) => typeof record[key] === "string");
    });
    return valid.length === value.length ? valid : fallback;
  };

  const c: OverviewContent = {
    eyebrow: text("eyebrow"),
    title: text("title"),
    description: text("description"),
    capabilitiesTitle: text("capabilitiesTitle"),
    capabilities: safeArray(supplied.capabilities, base.capabilities, ["number", "title", "text"]) as OverviewContent["capabilities"],
    audienceEyebrow: text("audienceEyebrow"),
    audienceTitle: text("audienceTitle"),
    audiences: safeArray(supplied.audiences, base.audiences, ["title", "text"]) as OverviewContent["audiences"],
    principlesTitle: text("principlesTitle"),
    principles: safeArray(supplied.principles, base.principles, ["title", "text"]) as OverviewContent["principles"],
    processTitle: text("processTitle"),
    process: safeArray(supplied.process, base.process, ["number", "title", "text"]) as OverviewContent["process"],
    note: text("note"),
    faqEyebrow: text("faqEyebrow"),
    faqTitle: text("faqTitle"),
    questions: safeArray(supplied.questions, base.questions, ["q", "a"]) as OverviewContent["questions"],
    faqLink: text("faqLink"),
    ctaTitle: text("ctaTitle"),
    ctaText: text("ctaText"),
    services: text("services"),
    contact: text("contact"),
  };
  const visible = (key: string) => visibility[key] !== false;
  const rtl = lang === "ar";

  return (
    <section id="home-overview" className="home-overview py-20 md:py-28" aria-labelledby="home-overview-title">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <div className="max-w-3xl mb-12 md:mb-16">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.22em] text-mint-400">{c.eyebrow}</p>
          <h2 id="home-overview-title" className="text-3xl md:text-5xl font-semibold leading-tight tracking-tight text-ink-0">{c.title}</h2>
          <p className="mt-5 max-w-2xl text-base md:text-lg leading-8 text-ink-3">{c.description}</p>
        </div>

        {visible("capabilities") && <div className="mb-20">
          <div className="mb-7 flex items-end justify-between gap-4">
            <h3 className="text-xl md:text-2xl font-semibold text-ink-0">{c.capabilitiesTitle}</h3>
            <span className="hidden md:block text-xs font-mono tracking-widest text-ink-4">ARCHAI / CAPABILITIES</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {c.capabilities.map((item) => (
              <article key={item.number} className="home-overview-card home-capability-card group relative min-h-[230px] overflow-hidden rounded-2xl border border-white/10 bg-white/[0.025] p-6 transition-colors duration-300 hover:border-violet-400/40 hover:bg-white/[0.045]">
                <span className="font-mono text-xs tracking-widest text-mint-400">{item.number}</span>
                <div className="my-5 h-px w-12 bg-gradient-to-r from-violet-400 to-mint-300 transition-all duration-300 group-hover:w-20" />
                <h4 className="text-lg font-semibold leading-snug text-ink-0">{item.title}</h4>
                <p className="mt-3 text-sm leading-7 text-ink-3">{item.text}</p>
                <span className={`pointer-events-none absolute ${rtl ? "left-4" : "right-4"} bottom-2 text-6xl font-semibold text-white/[0.025] transition-colors group-hover:text-violet-300/[0.07]`} aria-hidden="true">{item.number}</span>
              </article>
            ))}
          </div>
        </div>}

        {visible("audience") && <div className="mb-20">
          <div className="mb-7 max-w-3xl">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-mint-300">{c.audienceEyebrow}</p>
            <h3 className="text-2xl md:text-3xl font-semibold leading-tight text-ink-0">{c.audienceTitle}</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {c.audiences.map((item, index) => (
              <article key={item.title} className="home-overview-card rounded-2xl border border-white/10 p-5 md:p-6">
                <span className="mb-5 grid h-9 w-9 place-items-center rounded-xl border border-violet-300/20 bg-violet-300/[0.07] font-mono text-xs text-violet-300">0{index + 1}</span>
                <h4 className="font-semibold text-ink-0">{item.title}</h4>
                <p className="mt-3 text-sm leading-7 text-ink-3">{item.text}</p>
              </article>
            ))}
          </div>
        </div>}

        {visible("principles") && <div className="mb-20">
          <div className="mb-7 max-w-3xl">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-violet-300">{rtl ? "مبادئ الهندسة" : "Engineering principles"}</p>
            <h3 className="text-2xl md:text-3xl font-semibold leading-tight text-ink-0">{c.principlesTitle}</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {c.principles.map((item, index) => (
              <article key={item.title} className="home-overview-card home-principle-card rounded-2xl border border-white/10 bg-white/[0.02] p-5 md:p-6">
                <span className="mb-5 grid h-9 w-9 place-items-center rounded-xl border border-mint-300/20 bg-mint-300/[0.07] font-mono text-xs text-mint-300">0{index + 1}</span>
                <h4 className="font-semibold text-ink-0">{item.title}</h4>
                <p className="mt-3 text-sm leading-7 text-ink-3">{item.text}</p>
              </article>
            ))}
          </div>
        </div>}

        {visible("process") && <div className="mb-20 grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-violet-300">{rtl ? "منهجية التنفيذ" : "Delivery approach"}</p>
            <h3 className="text-2xl md:text-3xl font-semibold leading-tight text-ink-0">{c.processTitle}</h3>
            <p className="mt-5 text-sm leading-7 text-ink-3">{c.note}</p>
          </div>
          <ol className="grid grid-cols-1 sm:grid-cols-2 gap-x-8">
            {c.process.map((step) => (
              <li key={step.number} className="border-t border-white/10 py-5">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs text-mint-400">{step.number}</span>
                  <h4 className="font-semibold text-ink-0">{step.title}</h4>
                </div>
                <p className="mt-2 text-sm leading-7 text-ink-3">{step.text}</p>
              </li>
            ))}
          </ol>
        </div>}

        {visible("faq") && <div className="home-faq-preview mb-20 grid gap-9 lg:grid-cols-[0.72fr_1.28fr] lg:gap-16">
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-mint-300">{c.faqEyebrow}</p>
            <h3 className="text-2xl md:text-3xl font-semibold leading-tight text-ink-0">{c.faqTitle}</h3>
            <Link href={`/${lang}/faq`} className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-violet-300 hover:text-mint-300 transition-colors">
              {c.faqLink} <span aria-hidden="true">↗</span>
            </Link>
          </div>
          <div className="space-y-3">
            {c.questions.map((item, index) => (
              <details key={item.q} className="home-faq-item group rounded-2xl border border-white/10 bg-white/[0.02] px-5 py-4">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-ink-0 marker:hidden">
                  <span className="flex items-start gap-3"><span className="font-mono text-xs text-mint-300">0{index + 1}</span>{item.q}</span>
                  <span className="home-faq-plus text-xl font-normal text-ink-3 transition-transform duration-300" aria-hidden="true">+</span>
                </summary>
                <p className="mt-4 ps-7 text-sm leading-7 text-ink-3">{item.a}</p>
              </details>
            ))}
          </div>
        </div>}

        {visible("cta") && <div className="home-overview-cta mt-16 flex flex-col gap-6 rounded-3xl border border-violet-300/15 bg-gradient-to-br from-violet-500/[0.11] via-white/[0.025] to-mint-300/[0.06] p-7 md:flex-row md:items-center md:justify-between md:p-10">
          <div className="max-w-2xl">
            <h3 className="text-2xl md:text-3xl font-semibold text-ink-0">{c.ctaTitle}</h3>
            <p className="mt-3 text-sm md:text-base leading-7 text-ink-3">{c.ctaText}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href={`/${lang}/services`} className="btn-ghost">{c.services}</Link>
            <Link href={`/${lang}/contact`} className="btn-primary">{c.contact}</Link>
          </div>
        </div>}
      </div>
    </section>
  );
}
