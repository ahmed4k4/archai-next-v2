import { notFound } from "next/navigation";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import Reveal from "../../components/Reveal";
import Tracker from "../../components/Tracker";
import { MotionDirector } from "../../components/MotionDirector";
import { getHome } from "../../lib/data";
import { LOCALES, isLocale, dirOf, pick } from "../../lib/i18n";
import { SITE_URL } from "../../lib/supabase";

export const revalidate = 60;

export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }) {
  const { lang } = params;
  const { settings } = await getHome();
  const title = settings.site_title || (lang === "ar" ? "الحلول البرمجية والذكاء الاصطناعي" : "Software, AI & Digital Product Engineering");
  const description = pick(settings, "home_desc", lang) || (lang === "ar"
    ? "أركاي للحلول البرمجية: نبني المنتجات الرقمية ومنصات الويب وحلول الذكاء الاصطناعي والأنظمة المدمجة وإنترنت الأشياء."
    : "Archai Solutions designs and builds digital products, web platforms, AI-powered workflows, and embedded/IoT systems.");
  const localizedTitle = lang === "ar"
    ? `${title} | أركاي للحلول البرمجية`
    : `${title} | Archai Solutions`;
  const canonical = `${SITE_URL}/${lang}`;
  return {
    metadataBase: new URL(SITE_URL),
    title: { default: localizedTitle, template: "%s | Archai Solutions" },
    description,
    applicationName: "Archai Solutions",
    category: "technology",
    icons: { icon: "/icon.svg" },
    alternates: { canonical, languages: { ar: `${SITE_URL}/ar`, en: `${SITE_URL}/en`, "x-default": `${SITE_URL}/en` } },
    openGraph: {
      title: localizedTitle, description, url: canonical, siteName: "Archai Solutions",
      type: "website", locale: lang === "ar" ? "ar_EG" : "en_US",
      images: settings.default_seo_image ? [{ url: settings.default_seo_image, alt: lang === "ar" ? "أركاي للحلول البرمجية" : "Archai Solutions" }] : [{ url: `${SITE_URL}/opengraph-image`, width: 1200, height: 630, alt: lang === "ar" ? "أركاي للحلول البرمجية" : "Archai Solutions" }],
    },
    twitter: { card: "summary_large_image", title: localizedTitle, description, images: [`${SITE_URL}/opengraph-image`] },
    robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 } },
  };
}

export default async function RootLayout({ children, params }) {
  const { lang } = params;
  if (!isLocale(lang)) notFound();
  const { cats, projects } = await getHome();
  const withProjects = cats.filter((c) => projects.some((p) => p.category_id === c.id));
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Archai Solutions",
    url: SITE_URL,
    logo: `${SITE_URL}/assets/logo.png`,
    description: lang === "ar"
      ? "أركاي للحلول البرمجية: تطوير المنتجات الرقمية ومنصات الويب وتكامل الذكاء الاصطناعي والأنظمة المدمجة وإنترنت الأشياء."
      : "Archai Solutions builds digital products, web platforms, AI integrations, embedded systems, and IoT solutions.",
    knowsAbout: ["Software Development", "Web Applications", "AI Integration", "Embedded Systems", "Internet of Things", "Digital Product Engineering"],
  };
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Archai Solutions",
    url: `${SITE_URL}/${lang}`,
    inLanguage: lang === "ar" ? "ar" : "en",
    publisher: { "@type": "Organization", name: "Archai Solutions", url: SITE_URL },
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema).replace(/</g, "\\u003c") }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema).replace(/</g, "\\u003c") }} />
      <div className="ambient-layer" aria-hidden="true">
        <div className="ambient-shape ambient-shape-1" />
        <div className="ambient-shape ambient-shape-2" />
        <div className="ambient-shape ambient-shape-3" />
        <div className="ambient-shape ambient-shape-4" />
        <div className="ambient-shape ambient-shape-5" />
        <div className="ambient-shape ambient-shape-6" />
        <div className="ambient-shape ambient-shape-7" />
        <div className="ambient-prism ambient-prism-a" />
        <div className="ambient-prism ambient-prism-b" />
        <div className="ambient-ring ambient-ring-a" />
      </div>
      <Header lang={lang} cats={withProjects} />
      {children}
      <Footer lang={lang} cats={withProjects} />
      <Reveal />
      <Tracker />
      <MotionDirector />
    </>
  );
}

