import { heroHtml } from "./heroHtml";
import HeroParticles from "./HeroParticles";
import Hero3DPortal from "./Hero3DPortal";
import { tr, pick } from "../lib/i18n";

const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => "&#" + c.charCodeAt(0) + ";");

type HeroProps = { lang: "ar" | "en"; settings: Record<string, any>; count: number };

export default function Hero({ lang, settings, count }: HeroProps) {
  const T = tr(lang);
  const html = heroHtml({
    T,
    esc,
    titleAr: settings.home_title_ar || tr("ar")("heroT"),
    titleEn: settings.home_title_en || tr("en")("heroT"),
    desc: pick(settings, "home_desc", lang) || T("heroDesc"),
    count,
  });
  return (
    <>
      <div dangerouslySetInnerHTML={{ __html: html }} />
      <HeroParticles />
      <Hero3DPortal />
    </>
  );
}
