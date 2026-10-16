"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { pick, tr } from "@/lib/i18n";
import type { Locale, SiteSettings } from "@/lib/types";
import { viewportOnce } from "@/lib/motion";
import { resolveSiteNavigation } from "@/lib/site-navigation";

type FooterProps = { lang: Locale; cats: any[]; settings?: SiteSettings };

type SocialLink = { label: string; href: string };

function safeWebUrl(value: unknown): string | null {
  if (typeof value !== "string" || !value.trim()) return null;
  try {
    const url = new URL(value.trim());
    return url.protocol === "https:" || url.protocol === "http:" ? url.toString() : null;
  } catch {
    return null;
  }
}

function getSocialLinks(settings?: SiteSettings): SocialLink[] {
  const root = (settings ?? {}) as Record<string, unknown>;
  const social = root.social && typeof root.social === "object" && !Array.isArray(root.social)
    ? root.social as Record<string, unknown>
    : {};
  const candidates: { label: string; keys: string[] }[] = [
    { label: "in", keys: ["linkedin", "linkedin_url", "linkedIn"] },
    { label: "X", keys: ["x", "twitter", "twitter_url"] },
    { label: "GH", keys: ["github", "github_url"] },
  ];
  const links = candidates.flatMap(({ label, keys }) => {
    const value = keys.map((key) => social[key] ?? root[key]).find((item) => typeof item === "string");
    const href = safeWebUrl(value);
    return href ? [{ label, href }] : [];
  });
  return links.filter((link, index) => links.findIndex((item) => item.href === link.href) === index);
}

function getContactRecord(settings?: SiteSettings): Record<string, unknown> {
  const root = (settings ?? {}) as Record<string, unknown>;
  const nested = root.contact;
  return nested && typeof nested === "object" && !Array.isArray(nested)
    ? nested as Record<string, unknown>
    : {};
}

function getContactEmail(settings?: SiteSettings): string | null {
  const root = (settings ?? {}) as Record<string, unknown>;
  const contact = getContactRecord(settings);
  const value = [contact.email, contact.email_address, root.contact_email, root.company_email, root.email_address, root.email]
    .find((item) => typeof item === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(item.trim()));
  return typeof value === "string" ? value.trim() : null;
}

function safeLogoUrl(value: unknown): string {
  if (typeof value !== "string" || !value.trim()) return "/assets/logo.webp";
  const text = value.trim();
  const pathname = text.split(/[?#]/, 1)[0].toLowerCase();
  // The dashboard may still store the old 195 KB PNG path; serve the equivalent
  // optimized asset shipped with this deployment instead.
  if (pathname.endsWith("/assets/logo.png")) return "/assets/logo.webp";
  if (text.startsWith("/") && !text.startsWith("//")) return text;
  const url = safeWebUrl(text);
  if (url) {
    try {
      if (new URL(url).pathname.toLowerCase().endsWith("/assets/logo.png")) return "/assets/logo.webp";
    } catch {}
  }
  return url || "/assets/logo.webp";
}

export default function Footer({ lang, cats, settings }: FooterProps) {
  const T = tr(lang);
  const ar = lang === "ar";
  const socialLinks = getSocialLinks(settings);
  const contactEmail = getContactEmail(settings);
  const contact = getContactRecord(settings);
  const contactPhone = typeof contact.phone === "string" ? contact.phone.trim() : "";
  const phoneHref = contactPhone.replace(/[^+0-9]/g, "");
  const contactWhatsapp = safeWebUrl(contact.whatsapp ?? contact.whatsapp_url);
  const settingRoot = (settings ?? {}) as Record<string, unknown>;
  const footerDescription = pick(settingRoot as Record<string, any>, "footer_text", lang) || T("footerAbout");
  const footerHeadline = pick(settingRoot as Record<string, any>, "footer_headline", lang) || (ar ? "نصمم ونبني ما" : "We design and build what");
  const footerAccent = pick(settingRoot as Record<string, any>, "footer_accent", lang) || (ar ? "يستخدمه العالم." : "the world relies on.");
  const companyName = typeof settings?.company_name === "string" && settings.company_name.trim() ? settings.company_name.trim() : "ARCHAI";
  const taglineValue = (settings as Record<string, unknown> | undefined)?.[ar ? "brand_tagline_ar" : "brand_tagline_en"];
  const companyTagline = typeof taglineValue === "string" && taglineValue.trim() ? taglineValue.trim() : "INTEGRATED SYSTEMS";
  const nav = resolveSiteNavigation((settings as Record<string, unknown> | undefined)?.navigation);
  const logoUrl = safeLogoUrl(settings?.logo_url);

  return (
    <footer className="relative overflow-hidden mt-20">
      {/* Top border glow */}
      <div className="h-px bg-grad-signal opacity-60" />

      <div className="wrap relative z-10 py-16 lg:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-16">
          {/* Brand */}
          <div className="lg:col-span-2">
            <motion.div
              className="flex items-center gap-3 mb-6"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={viewportOnce}
              transition={{ duration: 0.6 }}
            >
              <div className="w-10 h-10 rounded-xl overflow-hidden">
                <img src={logoUrl} alt={companyName} className="w-full h-full object-contain" />
              </div>
              <div>
                <div className="font-mono text-xs font-bold tracking-[0.2em] text-ink-0">{companyName.toLocaleUpperCase(lang === "ar" ? "ar" : "en")}</div>
                <div className="font-mono text-[9px] tracking-[0.15em] text-ink-4">
                  {companyTagline}
                </div>
              </div>
            </motion.div>

            <motion.h3
              className="font-display text-2xl lg:text-3xl font-medium tracking-tight text-ink-0 mb-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={viewportOnce}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              {footerHeadline}
              <br />
              <span className="bg-grad-text-light dark:bg-grad-text bg-clip-text text-transparent">
                {footerAccent}
              </span>
            </motion.h3>

            <motion.p
              className="text-sm text-ink-3 leading-relaxed max-w-md"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={viewportOnce}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              {footerDescription}
            </motion.p>

            {/* Only show social profiles that are configured with valid http(s) URLs. */}
            {socialLinks.length > 0 && (
              <div className="flex gap-2 mt-6">
                {socialLinks.map(({ label, href }, i) => (
                  <motion.a
                    key={href}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label === "in" ? "LinkedIn" : label === "X" ? "X" : "GitHub"}
                    className="w-9 h-9 grid place-items-center rounded-lg border border-violet-500/20 bg-violet-500/5 text-ink-3 hover:text-violet-300 hover:border-violet-500/40 transition-colors font-mono text-xs"
                    whileHover={{ y: -3 }}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={viewportOnce}
                    transition={{ delay: 0.3 + i * 0.05 }}
                  >
                    {label}
                  </motion.a>
                ))}
              </div>
            )}
          </div>

          {/* Site links */}
          <div>
            <div className="font-mono text-[10px] uppercase tracking-widest text-violet-300 mb-4">
              {T("footerLinks")}
            </div>
            <ul className="space-y-2.5">
              {[
                { href: `/${lang}`, label: T("home") },
                ...nav.map((item) => ({
                  href: `/${lang}/${item.href}`,
                  label: lang === "ar" ? item.labelAr : item.labelEn,
                })),
              ].map((item, i) => (
                <motion.li
                  key={item.href}
                  initial={{ opacity: 0, x: ar ? 12 : -12 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={viewportOnce}
                  transition={{ delay: i * 0.04 }}
                >
                  <Link
                    href={item.href}
                    className="text-sm text-ink-3 hover:text-ink-0 transition-colors inline-flex items-center gap-1 group"
                  >
                    <span className="w-0 group-hover:w-3 h-px bg-mint-400 transition-all duration-300" />
                    {item.label}
                  </Link>
                </motion.li>
              ))}
            </ul>
          </div>

          {/* Categories / Contact */}
          <div>
            {cats.length > 0 && (
              <>
                <div className="font-mono text-[10px] uppercase tracking-widest text-mint-300 mb-4">
                  {T("categories")}
                </div>
                <ul className="space-y-2.5 mb-8">
                  {cats.slice(0, 4).map((c) => (
                    <li key={c.id}>
                      <Link
                        href={`/${lang}/categories/${c.slug}`}
                        className="text-sm text-ink-3 hover:text-ink-0 transition-colors inline-flex items-center gap-2"
                      >
                        <span className="text-violet-300">{c.icon || "◆"}</span>
                        {pick(c, "name", lang)}
                      </Link>
                    </li>
                  ))}
                </ul>
              </>
            )}

            <div className="font-mono text-[10px] uppercase tracking-widest text-violet-300 mb-4">
              {T("footerContact")}
            </div>
            {contactEmail ? (
              <a href={`mailto:${contactEmail}`} className="text-sm text-ink-3 hover:text-ink-0 transition-colors break-all">
                {contactEmail}
              </a>
            ) : (
              <Link href={`/${lang}/contact`} className="text-sm text-ink-3 hover:text-ink-0 transition-colors">
                {ar ? "نموذج التواصل" : "Contact form"}
              </Link>
            )}
            {contactPhone && phoneHref ? (
              <a href={`tel:${phoneHref}`} className="mt-2 block text-sm text-ink-3 transition-colors hover:text-ink-0" dir="ltr">{contactPhone}</a>
            ) : null}
            {contactWhatsapp ? (
              <a href={contactWhatsapp} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex text-sm text-mint-300 transition-colors hover:text-mint-200">
                {ar ? "تواصل عبر واتساب ↗" : "Message on WhatsApp ↗"}
              </a>
            ) : null}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-16 pt-6 border-t border-violet-500/15 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-ink-4 font-mono">
          <div>
            {T("footerRights").replace("{year}", String(new Date().getFullYear()))}
          </div>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-mint-400 animate-pulse" />
            {T("footerLocation")}
          </div>
        </div>
      </div>

      {/* Marquee strip */}
      <div className="border-t border-violet-500/15 py-4 overflow-hidden">
        <div className={`footer-marquee-track ${ar ? "footer-marquee-rtl" : "footer-marquee-ltr"}`}>
          {Array.from({ length: 12 }).map((_, i) => (
            <span
              key={i}
              aria-hidden={i >= 6 ? true : undefined}
              className="flex shrink-0 items-center gap-3 text-[10px] font-mono uppercase tracking-[0.3em] text-ink-4"
            >
              <span className="h-1 w-1 rounded-full bg-violet-400" />
              {ar ? "برمجيات · ذكاء اصطناعي · أنظمة مدمجة · إنترنت الأشياء" : "SOFTWARE · AI · EMBEDDED · IOT"}
            </span>
          ))}
        </div>
      </div>
    </footer>
  );
}