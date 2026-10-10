import { notFound } from "next/navigation";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import Reveal from "../../components/Reveal";
import Tracker from "../../components/Tracker";
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
  const title = settings.site_title || "Archai — Projects";
  const description =
    pick(settings, "home_desc", lang) ||
    "Archai Integrated Systems — engineered software, embedded, and mobile projects.";
  return {
    metadataBase: new URL(SITE_URL),
    title: { default: title, template: "%s — Archai" },
    description,
    icons: { icon: "/assets/logo.png" },
    openGraph: { title, description, type: "website", images: settings.default_seo_image ? [settings.default_seo_image] : undefined },
    twitter: { card: "summary_large_image" },
    alternates: { languages: { ar: "/ar", en: "/en" } },
  };
}

export default async function RootLayout({ children, params }) {
  const { lang } = params;
  if (!isLocale(lang)) notFound();
  const { cats, projects } = await getHome();
  const withProjects = cats.filter((c) => projects.some((p) => p.category_id === c.id));
  return (
    <>
      <div className="ambient-layer" aria-hidden="true">
        <div className="ambient-shape ambient-shape-1" />
        <div className="ambient-shape ambient-shape-2" />
        <div className="ambient-shape ambient-shape-3" />
        <div className="ambient-shape ambient-shape-4" />
      </div>
      <Header lang={lang} cats={withProjects} />
      {children}
      <Footer lang={lang} cats={withProjects} />
      <Reveal />
      <Tracker />
    </>
  );
}

