import Link from "next/link";
import { pageSeo } from "../../../lib/seo";
import type { Locale } from "../../../lib/types";
import { isLocale } from "../../../lib/i18n";
import { notFound } from "next/navigation";
const copy = {
  "ar": {
    "eyebrow": "الوظائف",
    "title": "ابنِ ما",
    "accent": "سيستخدمه العالم",
    "description": "نبحث عن أشخاص يحبون حل المشكلات، والتعلم المستمر، وتحمل مسؤولية المنتج من الفكرة إلى الإطلاق.",
    "cards": [
      {
        "number": "01",
        "icon": "◈",
        "title": "هندسة البرمجيات",
        "body": "تفكير عملي وحل المشكلات",
        "tags": [
          "CAREER",
          "TEAM"
        ]
      },
      {
        "number": "02",
        "icon": "✳",
        "title": "تصميم UI/UX",
        "body": "تواصل واضح والعمل بروح الفريق",
        "tags": [
          "CAREER",
          "TEAM"
        ]
      },
      {
        "number": "03",
        "icon": "⌘",
        "title": "الذكاء الاصطناعي والأتمتة",
        "body": "اهتمام بالجودة وتجربة المستخدم",
        "tags": [
          "CAREER",
          "TEAM"
        ]
      },
      {
        "number": "04",
        "icon": "↗",
        "title": "الأنظمة المدمجة وIoT",
        "body": "فضول تقني وتعلم مستمر",
        "tags": [
          "CAREER",
          "TEAM"
        ]
      }
    ],
    "outroTitle": "خلينا نتعرف عليك",
    "outroText": "أرسل نبذة عن خبرتك ومجالات اهتمامك وروابط أعمالك من خلال صفحة التواصل.",
    "primary": "تواصل معنا",
    "secondary": "استكشف الخدمات"
  },
  "en": {
    "eyebrow": "CAREERS",
    "title": "Build what",
    "accent": "people rely on",
    "description": "We value people who enjoy solving real problems, learning continuously and owning products from idea to launch.",
    "cards": [
      {
        "number": "01",
        "icon": "◈",
        "title": "Software engineering",
        "body": "Practical problem-solving",
        "tags": [
          "CAREER",
          "TEAM"
        ]
      },
      {
        "number": "02",
        "icon": "✳",
        "title": "UI/UX design",
        "body": "Clear communication and collaboration",
        "tags": [
          "CAREER",
          "TEAM"
        ]
      },
      {
        "number": "03",
        "icon": "⌘",
        "title": "AI and automation",
        "body": "Care for quality and user experience",
        "tags": [
          "CAREER",
          "TEAM"
        ]
      },
      {
        "number": "04",
        "icon": "↗",
        "title": "Embedded systems and IoT",
        "body": "Technical curiosity and continuous learning",
        "tags": [
          "CAREER",
          "TEAM"
        ]
      }
    ],
    "outroTitle": "Let’s meet you",
    "outroText": "Share your background, interests and work samples through our contact page.",
    "primary": "Talk to our team",
    "secondary": "Explore services"
  }
} as const;
export async function generateMetadata({ params }: { params: { lang: string } }) { const lang = isLocale(params.lang) ? params.lang : "en"; const c = copy[lang]; return pageSeo(lang, "careers", `${c.title} ${c.accent}`, c.description); }
export default function Page({ params }: { params: { lang: string } }) { const lang = params.lang as Locale; if (!isLocale(lang)) notFound(); const c = copy[lang]; return <main className={`marketing-page marketing-careers`} lang={lang} dir={lang === "ar" ? "rtl" : "ltr"}><section className="marketing-hero"><div className="marketing-hero-grid"/><div className="marketing-hero-copy"><span className="marketing-eyebrow"><i/> {c.eyebrow}</span><h1>{c.title}<br/><em>{c.accent}</em></h1><p>{c.description}</p><div className="marketing-actions"><Link className="marketing-primary" href={`/${lang}/contact`}>{c.primary} <span>↗</span></Link><Link className="marketing-secondary" href={`/${lang}/services`}>{c.secondary} <span>↗</span></Link></div><div className="marketing-proof"><span><b>01</b>{lang === "ar" ? "وضوح في الرؤية" : "Clarity first"}</span><span><b>02</b>{lang === "ar" ? "تنفيذ منظم" : "Structured delivery"}</span><span><b>03</b>{lang === "ar" ? "جودة مستمرة" : "Quality always"}</span></div></div><div className="marketing-visual" aria-hidden="true"><div className="visual-halo"/><div className="visual-orbit orbit-one"/><div className="visual-orbit orbit-two"/><div className="visual-orbit orbit-three"/><div className="visual-core"><div className="core-inner">A<span>✦</span></div></div><div className="visual-chip chip-one"><i>⌘</i><span>ARCHAI</span></div><div className="visual-chip chip-two"><i>◈</i><span>AI / SYSTEMS</span></div><div className="visual-chip chip-three"><i>⌁</i><span>ENGINEERING</span></div><div className="visual-label">ARCHAI / CAREERS <b>● ONLINE</b></div></div><div className="marketing-index">ARCHAI — INTEGRATED SYSTEMS <span>/CAREERS</span></div></section><section className="marketing-cards-section"><div className="marketing-section-heading"><div><span className="marketing-eyebrow">{lang === "ar" ? "منهجنا" : "OUR APPROACH"}</span><h2>{lang === "ar" ? "هندسة مدروسة.\nنتائج قابلة للنمو." : "Thoughtful engineering.\nRoom to grow."}</h2></div><p>{c.description}</p></div><div className="marketing-cards">{c.cards.map((card,i)=><article className="marketing-card" key={card.number} style={{animationDelay:`${i*90}ms`}}><div className="marketing-card-top"><span>{card.number}</span><i>{card.icon}</i></div><h3>{card.title}</h3><p>{card.body}</p><div className="marketing-tags">{card.tags.map(tag=><span key={tag}>{tag}</span>)}</div><div className="marketing-card-line"/></article>)}</div></section><section className="marketing-cta"><div className="cta-orb"/><span className="marketing-eyebrow">{lang === "ar" ? "الخطوة التالية" : "NEXT STEP"}</span><h2>{c.outroTitle}</h2><p>{c.outroText}</p><Link className="marketing-primary" href={`/${lang}/contact`}>{c.primary} <span>↗</span></Link></section></main>; }
