import { notFound } from "next/navigation";
import { MotionConfig } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ScrollProgress from "@/components/motion/ScrollProgress";
import CursorGlow from "@/components/motion/CursorGlow";
import SmoothMotion from "@/components/motion/SmoothMotion";
import GalaxyBackground from "@/components/visuals/GalaxyBackground";
import RouteTransition from "@/components/motion/RouteTransition";
import LocaleSync from "@/components/LocaleSync";
import { getHome } from "@/lib/data";
import { LOCALES, isLocale, pick } from "@/lib/i18n";
import type { Locale } from "@/lib/types";
import { SITE_URL } from "@/lib/supabase";
import {
  organizationSchema,
  websiteSchema,
  jsonLd,
} from "@/lib/structured-data";

export const revalidate = 60;

export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

export async function generateMetadata({
  params,
}: {
  params: { lang: string };
}) {
  const { lang } = params;
  const { settings } = await getHome();

  const configuredTitle = typeof settings.site_title === "string" ? settings.site_title.trim() : "";
  const title = configuredTitle ||
    (lang === "ar"
      ? "الحلول البرمجية والذكاء الاصطناعي"
      : "Software, AI & Digital Product Engineering");
  const configuredBrand = typeof settings.company_name === "string" ? settings.company_name.trim() : "";
  const brand = configuredBrand || (lang === "ar" ? "أركاي للحلول البرمجية" : "Archai Solutions");

  const description =
    pick(settings, "home_desc", lang as Locale) ||
    (lang === "ar"
      ? "أركاي للحلول البرمجية: نبني المنتجات الرقمية ومنصات الويب وحلول الذكاء الاصطناعي والأنظمة المدمجة وإنترنت الأشياء."
      : "Archai Solutions designs and builds digital products, web platforms, AI-powered workflows, and embedded/IoT systems.");

  const localizedTitle = `${title} | ${brand}`;

  const canonical = `${SITE_URL}/${lang}`;
  const configuredImage = typeof settings.default_seo_image === "string" ? settings.default_seo_image.trim() : "";
  const defaultImage = configuredImage
    ? configuredImage.startsWith("/") && !configuredImage.startsWith("//")
      ? `${SITE_URL}${configuredImage}`
      : /^https:\/\//i.test(configuredImage)
        ? configuredImage
        : `${SITE_URL}/${lang}/opengraph-image`
    : `${SITE_URL}/${lang}/opengraph-image`;
  const keywords =
    lang === "ar"
      ? [
          "أركاي",
          "تطوير برمجيات",
          "تطبيقات ويب",
          "ذكاء اصطناعي",
          "أنظمة مدمجة",
          "إنترنت الأشياء",
          "شركة برمجة مصر",
        ]
      : [
          "Archai Solutions",
          "software development company",
          "web development",
          "AI integration",
          "digital product engineering",
          "embedded systems",
          "IoT solutions",
        ];

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: localizedTitle,
      template: `%s | ${brand}`,
    },
    description,
    keywords,
    applicationName: brand,
    category: "technology",
    authors: [{ name: brand, url: SITE_URL }],
    creator: brand,
    publisher: brand,
    icons: {
      icon: [
        { url: "/icon.svg", type: "image/svg+xml" },
        { url: "/favicon.ico", sizes: "any" },
      ],
      apple: "/apple-icon.png",
    },
    alternates: {
      canonical,
      languages: {
        ar: `${SITE_URL}/ar`,
        en: `${SITE_URL}/en`,
        "x-default": `${SITE_URL}/en`,
      },
    },
    openGraph: {
      title: localizedTitle,
      description,
      url: canonical,
      siteName: brand,
      type: "website",
      locale: lang === "ar" ? "ar_EG" : "en_US",
      alternateLocale: lang === "ar" ? "en_US" : "ar_EG",
      images: [
        {
          url: defaultImage,
          width: 1200,
          height: 630,
          alt: localizedTitle,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: localizedTitle,
      description,
      images: [defaultImage],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
    verification: {
      google: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION,
    },
  };
}

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { lang: string };
}) {
  const { lang } = params;
  if (!isLocale(lang)) notFound();
  const { cats, projects, settings } = await getHome();
  const withProjects = cats.filter((c) =>
    projects.some((p) => String(p.category_id ?? "") === String(c.id))
  );

  return (
    <>
      <GalaxyBackground />
      <div className="site-layer">
      {/* ============================================================
          Structured data — Organization + Website
          ============================================================ */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(organizationSchema(lang, settings)) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(websiteSchema(lang, settings)) }}
      />

      {/* ============================================================
          Global layers — each page renders its own WebGL Backdrop.
          ============================================================ */}
      <MotionConfig reducedMotion="user">
      <SmoothMotion>
        <LocaleSync lang={lang} />
        <ScrollProgress />
        <CursorGlow />

        <Header lang={lang} cats={withProjects} settings={settings} />

        <div id="site-content" className="relative pt-[76px]"><RouteTransition>{children}</RouteTransition></div>

        <Footer lang={lang} cats={withProjects} settings={settings} />
      </SmoothMotion>
      </MotionConfig>
      </div>
    </>
  );
}