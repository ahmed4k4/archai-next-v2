import Link from "next/link";
import { pageSeo } from "../../../lib/seo";
import type { Locale } from "../../../lib/types";
import { isLocale } from "../../../lib/i18n";
import { notFound } from "next/navigation";
const copy = {
  "ar": {
    "eyebrow": "الأسئلة الشائعة",
    "title": "إجابات واضحة",
    "accent": "قبل أن نبدأ",
    "description": "معلومات تساعدك على فهم طريقة العمل، نطاق المشاريع، والتعاون مع Archai.",
    "cards": [
      {
        "number": "01",
        "icon": "◈",
        "title": "ما أنواع المشاريع التي تنفذونها؟",
        "body": "نحدد الأهداف والمستخدمين والقيود أولًا",
        "tags": [
          "GUIDANCE",
          "DELIVERY"
        ]
      },
      {
        "number": "02",
        "icon": "✳",
        "title": "كيف يبدأ المشروع؟",
        "body": "نقسم العمل إلى مراحل ومخرجات واضحة",
        "tags": [
          "GUIDANCE",
          "DELIVERY"
        ]
      },
      {
        "number": "03",
        "icon": "⌘",
        "title": "كيف تتم متابعة التقدم؟",
        "body": "نتفق على نقاط مراجعة وتواصل منتظمة",
        "tags": [
          "GUIDANCE",
          "DELIVERY"
        ]
      },
      {
        "number": "04",
        "icon": "↗",
        "title": "هل يمكن تطوير مشروع قائم؟",
        "body": "نراجع البنية الحالية قبل اقتراح التعديلات",
        "tags": [
          "GUIDANCE",
          "DELIVERY"
        ]
      }
    ],
    "outroTitle": "لم تجد إجابتك؟",
    "outroText": "أرسل سؤالك من صفحة التواصل وسنساعدك في تحديد الخطوة المناسبة.",
    "primary": "تواصل معنا",
    "secondary": "استكشف الخدمات"
  },
  "en": {
    "eyebrow": "FREQUENTLY ASKED QUESTIONS",
    "title": "Clear answers",
    "accent": "before we begin",
    "description": "Helpful context on our delivery approach, project scope and how to work with Archai.",
    "cards": [
      {
        "number": "01",
        "icon": "◈",
        "title": "What kinds of projects do you build?",
        "body": "We clarify goals, users and constraints first",
        "tags": [
          "GUIDANCE",
          "DELIVERY"
        ]
      },
      {
        "number": "02",
        "icon": "✳",
        "title": "How does a project start?",
        "body": "Work is divided into clear phases and deliverables",
        "tags": [
          "GUIDANCE",
          "DELIVERY"
        ]
      },
      {
        "number": "03",
        "icon": "⌘",
        "title": "How is progress tracked?",
        "body": "We agree on regular reviews and communication",
        "tags": [
          "GUIDANCE",
          "DELIVERY"
        ]
      },
      {
        "number": "04",
        "icon": "↗",
        "title": "Can you improve an existing product?",
        "body": "We assess the current architecture before proposing changes",
        "tags": [
          "GUIDANCE",
          "DELIVERY"
        ]
      }
    ],
    "outroTitle": "Still have a question?",
    "outroText": "Send your question through the contact page and we will help identify the right next step.",
    "primary": "Talk to our team",
    "secondary": "Explore services"
  }
} as const;
export async function generateMetadata({ params }: { params: { lang: string } }) { const lang = isLocale(params.lang) ? params.lang : "en"; const c = copy[lang]; return pageSeo(lang, "faq", `${c.title} ${c.accent}`, c.description); }
export default function Page({ params }: { params: { lang: string } }) { const lang = params.lang as Locale; if (!isLocale(lang)) notFound(); const c = copy[lang]; const faqSchema = { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: c.cards.map((card) => ({ "@type": "Question", name: card.title, acceptedAnswer: { "@type": "Answer", text: card.body } })) }; return <main className={`marketing-page marketing-faq`} lang={lang} dir={lang === "ar" ? "rtl" : "ltr"}><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema).replace(/</g, "\\u003c") }} /><section className="marketing-hero"><div className="marketing-hero-grid"/><div className="marketing-hero-copy"><span className="marketing-eyebrow"><i/> {c.eyebrow}</span><h1>{c.title}<br/><em>{c.accent}</em></h1><p>{c.description}</p><div className="marketing-actions"><Link className="marketing-primary" href={`/${lang}/contact`}>{c.primary} <span>↗</span></Link><Link className="marketing-secondary" href={`/${lang}/services`}>{c.secondary} <span>↗</span></Link></div><div className="marketing-proof"><span><b>01</b>{lang === "ar" ? "وضوح في الرؤية" : "Clarity first"}</span><span><b>02</b>{lang === "ar" ? "تنفيذ منظم" : "Structured delivery"}</span><span><b>03</b>{lang === "ar" ? "جودة مستمرة" : "Quality always"}</span></div></div><div className="marketing-visual" aria-hidden="true"><div className="visual-halo"/><div className="visual-orbit orbit-one"/><div className="visual-orbit orbit-two"/><div className="visual-orbit orbit-three"/><div className="visual-core"><div className="core-inner">A<span>✦</span></div></div><div className="visual-chip chip-one"><i>⌘</i><span>ARCHAI</span></div><div className="visual-chip chip-two"><i>◈</i><span>AI / SYSTEMS</span></div><div className="visual-chip chip-three"><i>⌁</i><span>ENGINEERING</span></div><div className="visual-label">ARCHAI / FAQ <b>● ONLINE</b></div></div><div className="marketing-index">ARCHAI — INTEGRATED SYSTEMS <span>/FAQ</span></div></section><section className="marketing-cards-section"><div className="marketing-section-heading"><div><span className="marketing-eyebrow">{lang === "ar" ? "منهجنا" : "OUR APPROACH"}</span><h2>{lang === "ar" ? "هندسة مدروسة.\nنتائج قابلة للنمو." : "Thoughtful engineering.\nRoom to grow."}</h2></div><p>{c.description}</p></div><div className="marketing-cards">{c.cards.map((card,i)=><article className="marketing-card" key={card.number} style={{animationDelay:`${i*90}ms`}}><div className="marketing-card-top"><span>{card.number}</span><i>{card.icon}</i></div><h3>{card.title}</h3><p>{card.body}</p><div className="marketing-tags">{card.tags.map(tag=><span key={tag}>{tag}</span>)}</div><div className="marketing-card-line"/></article>)}</div></section><section className="marketing-cta"><div className="cta-orb"/><span className="marketing-eyebrow">{lang === "ar" ? "الخطوة التالية" : "NEXT STEP"}</span><h2>{c.outroTitle}</h2><p>{c.outroText}</p><Link className="marketing-primary" href={`/${lang}/contact`}>{c.primary} <span>↗</span></Link></section></main>; }
