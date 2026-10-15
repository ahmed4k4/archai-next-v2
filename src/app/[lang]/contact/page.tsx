import MarketingPage from "@/components/marketing/MarketingPage";
import { pageSeo } from "@/lib/seo";
import { marketingContent } from "@/lib/marketing-content";
import { getEditablePageCopy } from "@/lib/page-content";
import { isLocale } from "@/lib/i18n";
import { notFound } from "next/navigation";
import type { Locale } from "@/lib/types";
import { SITE_URL } from "@/lib/supabase";
import { jsonLd } from "@/lib/structured-data";
import { getSiteSettings } from "@/lib/data";

export async function generateMetadata({
  params,
}: {
  params: { lang: string };
}) {
  const lang = isLocale(params.lang) ? params.lang : "en";
  const c = await getEditablePageCopy(lang, "contact", marketingContent(lang, "contact"));
  return pageSeo(lang, "contact", c.seoTitle || `${c.title} ${c.accent}`, c.seoDescription || c.description);
}

export default async function Page({ params }: { params: { lang: string } }) {
  if (!isLocale(params.lang)) notFound();
  const lang = params.lang as Locale;
  const [c, settings] = await Promise.all([
    getEditablePageCopy(lang, "contact", marketingContent(lang, "contact")),
    getSiteSettings(),
  ]);
  const siteSettings = (settings || {}) as Record<string, unknown>;
  const contact = siteSettings.contact && typeof siteSettings.contact === "object" && !Array.isArray(siteSettings.contact)
    ? siteSettings.contact as Record<string, unknown>
    : {};
  const emailValue = [contact.email, contact.email_address].find((value) => typeof value === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()));
  const email = typeof emailValue === "string" ? emailValue.trim() : "";
  const phone = typeof contact.phone === "string" ? contact.phone.trim() : "";
  const phoneHref = phone.replace(/[^+0-9]/g, "");
  const addressValue = lang === "ar"
    ? (contact.address_ar ?? contact.address ?? contact.location_ar)
    : (contact.address_en ?? contact.address ?? contact.location_en);
  const address = typeof addressValue === "string" ? addressValue.trim() : "";
  const whatsappRaw = contact.whatsapp ?? contact.whatsapp_url;
  let whatsapp = "";
  if (typeof whatsappRaw === "string") {
    try {
      const parsed = new URL(whatsappRaw);
      if (parsed.protocol === "https:" && (parsed.hostname === "wa.me" || parsed.hostname.endsWith(".whatsapp.com") || parsed.hostname === "whatsapp.com")) whatsapp = parsed.toString();
    } catch {}
  }
  const contactDetails = [email, phone && phoneHref, address, whatsapp].some(Boolean) ? (
    <section className="wrap relative z-10 py-8" aria-labelledby="configured-contact-heading">
      <div className="rounded-3xl border border-violet-500/20 bg-[var(--bg-glass)] p-6 md:p-8 backdrop-blur-xl">
        <div className="section-kicker">{lang === "ar" ? "قنوات التواصل المعتمدة" : "CONFIGURED CONTACT CHANNELS"}</div>
        <h2 id="configured-contact-heading" className="mt-2 mb-6 text-2xl font-semibold text-ink-0">{lang === "ar" ? "تواصل مع فريق أركاي" : "Reach the Archai team"}</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {email ? <a className="rounded-2xl border border-violet-500/15 p-4 hover:border-violet-500/40 transition-colors" href={`mailto:${email}`}><span className="block text-xs text-ink-4">Email</span><span className="mt-2 block break-all text-sm text-ink-1">{email}</span></a> : null}
          {phone && phoneHref ? <a className="rounded-2xl border border-violet-500/15 p-4 hover:border-violet-500/40 transition-colors" href={`tel:${phoneHref}`} dir="ltr"><span className="block text-xs text-ink-4">{lang === "ar" ? "الهاتف" : "Phone"}</span><span className="mt-2 block text-sm text-ink-1">{phone}</span></a> : null}
          {address ? <div className="rounded-2xl border border-violet-500/15 p-4"><span className="block text-xs text-ink-4">{lang === "ar" ? "العنوان" : "Location"}</span><span className="mt-2 block text-sm leading-6 text-ink-1">{address}</span></div> : null}
          {whatsapp ? <a className="rounded-2xl border border-mint-500/20 p-4 hover:border-mint-500/40 transition-colors" href={whatsapp} target="_blank" rel="noopener noreferrer"><span className="block text-xs text-ink-4">WhatsApp</span><span className="mt-2 block text-sm text-mint-300">{lang === "ar" ? "ابدأ محادثة ↗" : "Start a conversation ↗"}</span></a> : null}
        </div>
      </div>
    </section>
  ) : null;

  const contactSchema = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: `${c.title} ${c.accent}`,
    description: c.description,
    url: `${SITE_URL}/${lang}/contact`,
    inLanguage: lang === "ar" ? "ar-EG" : "en-US",
    about: { "@id": `${SITE_URL}/#organization` },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(contactSchema) }}
      />
      <MarketingPage
        lang={lang}
        kind="contact"
        eyebrow={c.eyebrow}
        title={c.title}
        accent={c.accent}
        description={c.description}
        primary={c.primary || (lang === "ar" ? "ابدأ مشروعك" : "Start your project")}
        primaryHref={c.primaryHref || `/${lang}/contact`}
        secondary={c.secondary || (lang === "ar" ? "استكشف المشاريع" : "Explore projects")}
        secondaryHref={c.secondaryHref || `/${lang}/projects`}
        cards={c.cards}
        outroTitle={c.outroTitle}
        outroText={c.outroText}
        sections={c.sections as Record<string, unknown> | null}
        accentColor="mint"
        sectionExtra={contactDetails}
      />
    </>
  );
}