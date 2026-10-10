import Link from "next/link";
import { pageSeo } from "../../../lib/seo";
import type { Locale } from "../../../lib/types";
import { isLocale } from "../../../lib/i18n";
import { notFound } from "next/navigation";
const copy = {
  "ar": {
    "eyebrow": "دراسات الحالة",
    "title": "من الفكرة إلى",
    "accent": "أثر ملموس",
    "description": "نماذج توضح كيف تتحول التحديات إلى منتجات رقمية وأنظمة مترابطة قابلة للتوسع.",
    "cards": [
      {
        "number": "01",
        "icon": "◈",
        "title": "منصات الأعمال",
        "body": "تحليل المشكلة وسياق الاستخدام",
        "tags": [
          "ARCHAI",
          "ENGINEERING"
        ]
      },
      {
        "number": "02",
        "icon": "✳",
        "title": "تجارب التجارة الرقمية",
        "body": "تصميم تجربة واضحة وتدفق عمل عملي",
        "tags": [
          "ARCHAI",
          "ENGINEERING"
        ]
      },
      {
        "number": "03",
        "icon": "⌘",
        "title": "أنظمة الإدارة والتشغيل",
        "body": "هندسة قابلة للتوسع مع اختبار الجودة",
        "tags": [
          "ARCHAI",
          "ENGINEERING"
        ]
      },
      {
        "number": "04",
        "icon": "↗",
        "title": "حلول IoT والأنظمة المدمجة",
        "body": "قياس النتائج والتحسين المستمر",
        "tags": [
          "ARCHAI",
          "ENGINEERING"
        ]
      }
    ],
    "outroTitle": "كل مشروع له قصة هندسية",
    "outroText": "استكشف المشاريع المنشورة وتواصل معنا لمناقشة تحديك القادم.",
    "primary": "تواصل معنا",
    "secondary": "استكشف الخدمات"
  },
  "en": {
    "eyebrow": "CASE STUDIES",
    "title": "From concept to",
    "accent": "measurable impact",
    "description": "Examples of how complex challenges become useful, connected and scalable digital products.",
    "cards": [
      {
        "number": "01",
        "icon": "◈",
        "title": "Business platforms",
        "body": "Understand the problem and user context",
        "tags": [
          "ARCHAI",
          "ENGINEERING"
        ]
      },
      {
        "number": "02",
        "icon": "✳",
        "title": "Digital commerce experiences",
        "body": "Design a clear experience and practical workflow",
        "tags": [
          "ARCHAI",
          "ENGINEERING"
        ]
      },
      {
        "number": "03",
        "icon": "⌘",
        "title": "Operations and management systems",
        "body": "Build scalable architecture and validate quality",
        "tags": [
          "ARCHAI",
          "ENGINEERING"
        ]
      },
      {
        "number": "04",
        "icon": "↗",
        "title": "IoT and embedded solutions",
        "body": "Measure outcomes and continuously improve",
        "tags": [
          "ARCHAI",
          "ENGINEERING"
        ]
      }
    ],
    "outroTitle": "Every project has an engineering story",
    "outroText": "Explore published work and talk to us about your next challenge.",
    "primary": "Talk to our team",
    "secondary": "Explore services"
  }
} as const;
export async function generateMetadata({ params }: { params: { lang: string } }) { const lang = isLocale(params.lang) ? params.lang : "en"; const c = copy[lang]; return pageSeo(lang, "case-studies", `${c.title} ${c.accent}`, c.description); }
export default function Page({ params }: { params: { lang: string } }) { const lang = params.lang as Locale; if (!isLocale(lang)) notFound(); const c = copy[lang]; return <main className={`marketing-page marketing-case-studies`} lang={lang} dir={lang === "ar" ? "rtl" : "ltr"}><section className="marketing-hero"><div className="marketing-hero-grid"/><div className="marketing-hero-copy"><span className="marketing-eyebrow"><i/> {c.eyebrow}</span><h1>{c.title}<br/><em>{c.accent}</em></h1><p>{c.description}</p><div className="marketing-actions"><Link className="marketing-primary" href={`/${lang}/contact`}>{c.primary} <span>↗</span></Link><Link className="marketing-secondary" href={`/${lang}/services`}>{c.secondary} <span>↗</span></Link></div><div className="marketing-proof"><span><b>01</b>{lang === "ar" ? "وضوح في الرؤية" : "Clarity first"}</span><span><b>02</b>{lang === "ar" ? "تنفيذ منظم" : "Structured delivery"}</span><span><b>03</b>{lang === "ar" ? "جودة مستمرة" : "Quality always"}</span></div></div><div className="marketing-visual" aria-hidden="true"><div className="visual-halo"/><div className="visual-orbit orbit-one"/><div className="visual-orbit orbit-two"/><div className="visual-orbit orbit-three"/><div className="visual-core"><div className="core-inner">A<span>✦</span></div></div><div className="visual-chip chip-one"><i>⌘</i><span>ARCHAI</span></div><div className="visual-chip chip-two"><i>◈</i><span>AI / SYSTEMS</span></div><div className="visual-chip chip-three"><i>⌁</i><span>ENGINEERING</span></div><div className="visual-label">ARCHAI / CASE-STUDIES <b>● ONLINE</b></div></div><div className="marketing-index">ARCHAI — INTEGRATED SYSTEMS <span>/CASE-STUDIES</span></div></section><section className="marketing-cards-section"><div className="marketing-section-heading"><div><span className="marketing-eyebrow">{lang === "ar" ? "منهجنا" : "OUR APPROACH"}</span><h2>{lang === "ar" ? "هندسة مدروسة.\nنتائج قابلة للنمو." : "Thoughtful engineering.\nRoom to grow."}</h2></div><p>{c.description}</p></div><div className="marketing-cards">{c.cards.map((card,i)=><article className="marketing-card" key={card.number} style={{animationDelay:`${i*90}ms`}}><div className="marketing-card-top"><span>{card.number}</span><i>{card.icon}</i></div><h3>{card.title}</h3><p>{card.body}</p><div className="marketing-tags">{card.tags.map(tag=><span key={tag}>{tag}</span>)}</div><div className="marketing-card-line"/></article>)}</div></section><section className="marketing-cta"><div className="cta-orb"/><span className="marketing-eyebrow">{lang === "ar" ? "الخطوة التالية" : "NEXT STEP"}</span><h2>{c.outroTitle}</h2><p>{c.outroText}</p><Link className="marketing-primary" href={`/${lang}/contact`}>{c.primary} <span>↗</span></Link></section></main>; }
