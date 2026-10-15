"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Save, Building2, Home, Image as ImageIcon, Globe2, Mail, PanelTop, Eye, EyeOff, ArrowUp, ArrowDown, CheckCircle2 } from "lucide-react";
import { supabaseBrowser } from "@/lib/supabase-browser";
import { useAdminI18n } from "@/components/admin/AdminI18n";
import { DEFAULT_SITE_NAVIGATION, type SiteNavigationItem } from "@/lib/site-navigation";

const SECTION_OPTIONS = [
  { key: "hero", ar: "الهيرو الرئيسي", en: "Hero" },
  { key: "overview", ar: "نظرة عامة عن الشركة", en: "Company overview" },
  { key: "capabilities", ar: "القدرات والخدمات", en: "Capabilities" },
  { key: "audience", ar: "القطاعات المستهدفة", en: "Target audiences" },
  { key: "principles", ar: "مبادئ العمل", en: "Principles" },
  { key: "process", ar: "مراحل العمل", en: "Process" },
  { key: "faq", ar: "الأسئلة الشائعة في الرئيسية", en: "Homepage FAQ" },
  { key: "cta", ar: "دعوة التواصل", en: "Contact CTA" },
  { key: "projectsCta", ar: "رابط أرشيف المشروعات", en: "Projects archive CTA" },
  { key: "technology", ar: "مجموعة التقنيات", en: "Technology stack" },
  { key: "focus", ar: "مجالات التركيز", en: "Engineering focus" },
] as const;

type JsonObject = Record<string, unknown>;
type NavigationDraft = SiteNavigationItem & { enabled: boolean };
type ContactFields = { email: string; phone: string; whatsapp: string; address_ar: string; address_en: string };
type SocialFields = { linkedin: string; x: string; github: string };

const EMPTY_CONTACT: ContactFields = { email: "", phone: "", whatsapp: "", address_ar: "", address_en: "" };
const EMPTY_SOCIAL: SocialFields = { linkedin: "", x: "", github: "" };

function objectOrEmpty(value: unknown): JsonObject {
  return value && typeof value === "object" && !Array.isArray(value) ? value as JsonObject : {};
}

function textValue(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeNavigation(value: unknown): NavigationDraft[] {
  const input = Array.isArray(value) && value.length ? value : DEFAULT_SITE_NAVIGATION;
  const allowed = new Set(DEFAULT_SITE_NAVIGATION.map((item) => item.href));
  const seen = new Set<string>();
  const normalized = input.flatMap((entry): NavigationDraft[] => {
    if (!entry || typeof entry !== "object" || Array.isArray(entry)) return [];
    const row = entry as Record<string, unknown>;
    const href = textValue(row.href).replace(/^\/+|\/+$/g, "");
    if (!allowed.has(href) || seen.has(href)) return [];
    seen.add(href);
    const fallback = DEFAULT_SITE_NAVIGATION.find((item) => item.href === href)!;
    return [{
      href,
      labelAr: textValue(row.labelAr) || fallback.labelAr,
      labelEn: textValue(row.labelEn) || fallback.labelEn,
      enabled: row.enabled !== false,
    }];
  });
  return normalized.length ? normalized : DEFAULT_SITE_NAVIGATION.map((item) => ({ ...item, enabled: true }));
}

function validateWebUrl(value: string, label: string, ar: boolean, httpsOnly = true): string {
  const clean = value.trim();
  if (!clean) return "";
  try {
    const url = new URL(clean);
    const allowed = httpsOnly ? url.protocol === "https:" : (url.protocol === "https:" || url.protocol === "http:");
    if (!allowed) throw new Error();
    return url.toString();
  } catch {
    throw new Error(ar ? `رابط «${label}» يجب أن يكون HTTPS صالحًا.` : `“${label}” must be a valid HTTPS URL.`);
  }
}

export default function Settings() {
  const { t, locale } = useAdminI18n();
  const sb = useMemo(() => supabaseBrowser(), []);
  const ar = locale === "ar";
  const [f, setF] = useState<Record<string, any>>({});
  const [contactFields, setContactFields] = useState<ContactFields>(EMPTY_CONTACT);
  const [socialFields, setSocialFields] = useState<SocialFields>(EMPTY_SOCIAL);
  const [navigationDraft, setNavigationDraft] = useState<NavigationDraft[]>(() => normalizeNavigation(DEFAULT_SITE_NAVIGATION));
  const [visibility, setVisibility] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await sb.from("site_settings").select("*").eq("id", 1).maybeSingle();
    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }
    const row = (data || {}) as Record<string, any>;
    setF(row);
    const contact = objectOrEmpty(row.contact);
    const social = objectOrEmpty(row.social);
    setContactFields({
      email: textValue(contact.email ?? contact.email_address),
      phone: textValue(contact.phone),
      whatsapp: textValue(contact.whatsapp ?? contact.whatsapp_url),
      address_ar: textValue(contact.address_ar ?? contact.location_ar ?? contact.address),
      address_en: textValue(contact.address_en ?? contact.location_en ?? contact.address),
    });
    setSocialFields({
      linkedin: textValue(social.linkedin ?? social.linkedin_url ?? social.linkedIn),
      x: textValue(social.x ?? social.twitter ?? social.twitter_url),
      github: textValue(social.github ?? social.github_url),
    });
    setNavigationDraft(normalizeNavigation(row.navigation));
    setVisibility({
      hero: true, overview: true, capabilities: true, audience: true, principles: true,
      process: true, faq: true, cta: true, projectsCta: true, technology: true, focus: true,
      ...objectOrEmpty(row.section_visibility),
    } as Record<string, boolean>);
    setLoading(false);
  }, [sb]);

  useEffect(() => { void load(); }, [load]);

  async function save(e: FormEvent) {
    e.preventDefault();
    const email = contactFields.email.trim();
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error(ar ? "أدخل بريدًا إلكترونيًا صحيحًا." : "Enter a valid email address.");
      return;
    }
    let whatsapp = "";
    try {
      whatsapp = validateWebUrl(contactFields.whatsapp, ar ? "واتساب" : "WhatsApp", ar);
      if (whatsapp) {
        const host = new URL(whatsapp).hostname.toLowerCase();
        if (!(host === "wa.me" || host === "whatsapp.com" || host.endsWith(".whatsapp.com"))) {
          toast.error(ar ? "رابط واتساب يجب أن يستخدم wa.me أو نطاق WhatsApp الرسمي." : "WhatsApp must use wa.me or an official WhatsApp domain.");
          return;
        }
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : (ar ? "رابط واتساب غير صالح." : "Invalid WhatsApp URL."));
      return;
    }

    let social: JsonObject;
    try {
      social = {
        ...objectOrEmpty(f.social),
      };
      const socialKeys: Array<[keyof SocialFields, string, string[]]> = [
        ["linkedin", "linkedin", ["linkedin_url", "linkedIn"]],
        ["x", "x", ["twitter", "twitter_url"]],
        ["github", "github", ["github_url"]],
      ];
      for (const [fieldKey, canonical, aliases] of socialKeys) {
        const value = validateWebUrl(socialFields[fieldKey], canonical, ar);
        for (const alias of aliases) delete social[alias];
        if (value) social[canonical] = value;
        else delete social[canonical];
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : (ar ? "تحقق من روابط الشبكات الاجتماعية." : "Check the social profile URLs."));
      return;
    }

    if (!navigationDraft.some((item) => item.enabled)) {
      toast.error(ar ? "يجب إبقاء رابط واحد على الأقل مفعّلًا في القائمة." : "At least one navigation item must remain enabled.");
      return;
    }
    const navigation = navigationDraft.map((item) => ({ ...item }));
    const contact: JsonObject = { ...objectOrEmpty(f.contact) };
    // Clean legacy aliases before writing the dashboard-managed canonical fields.
    ["email_address", "contact_email", "company_email", "whatsapp_url", "phone_number", "location_ar", "location_en", "address"].forEach((key) => delete contact[key]);
    const contactPairs: Array<[keyof ContactFields, string]> = [
      ["email", "email"], ["phone", "phone"], ["whatsapp", "whatsapp"],
      ["address_ar", "address_ar"], ["address_en", "address_en"],
    ];
    for (const [fieldKey, dbKey] of contactPairs) {
      const value = fieldKey === "whatsapp" ? whatsapp : contactFields[fieldKey].trim();
      if (value) contact[dbKey] = value;
      else delete contact[dbKey];
    }

    const years = Math.max(0, Math.min(100, Number(f.years_experience) || 0));
    const featuredLimit = Math.max(1, Math.min(24, Number(f.featured_limit) || 6));
    const projectsPerCategory = Math.max(1, Math.min(50, Number(f.projects_per_category) || 6));
    const image = String(f.default_seo_image || "").trim();
    if (image && !(image.startsWith("/") && !image.startsWith("//")) && !/^https:\/\//i.test(image)) {
      toast.error(ar ? "صورة SEO يجب أن تكون مسارًا داخليًا أو رابط HTTPS." : "The SEO image must be a local path or an HTTPS URL.");
      return;
    }
    const logo = String(f.logo_url || "").trim();
    if (logo && !(logo.startsWith("/") && !logo.startsWith("//")) && !/^https:\/\//i.test(logo)) {
      toast.error(ar ? "الشعار يجب أن يكون مسارًا داخليًا أو رابط HTTPS." : "The logo must be a local path or an HTTPS URL.");
      return;
    }

    setSaving(true);
    const toastId = toast.loading(ar ? "جارٍ حفظ إعدادات الموقع…" : "Saving website settings…");
    const { error } = await sb.from("site_settings").update({
      company_name: String(f.company_name || "").trim() || null,
      brand_tagline_ar: String(f.brand_tagline_ar || "").trim() || null,
      brand_tagline_en: String(f.brand_tagline_en || "").trim() || null,
      navigation,
      logo_url: logo || null,
      site_title: String(f.site_title || "").trim() || null,
      home_title_en: String(f.home_title_en || "").trim() || null,
      home_title_ar: String(f.home_title_ar || "").trim() || null,
      home_desc_en: String(f.home_desc_en || "").trim() || null,
      home_desc_ar: String(f.home_desc_ar || "").trim() || null,
      default_seo_image: image || null,
      contact,
      social,
      footer_text_en: String(f.footer_text_en || "").trim() || null,
      footer_text_ar: String(f.footer_text_ar || "").trim() || null,
      footer_headline_en: String(f.footer_headline_en || "").trim() || null,
      footer_headline_ar: String(f.footer_headline_ar || "").trim() || null,
      footer_accent_en: String(f.footer_accent_en || "").trim() || null,
      footer_accent_ar: String(f.footer_accent_ar || "").trim() || null,
      years_experience: years,
      section_visibility: visibility,
      featured_limit: featuredLimit,
      projects_per_category: projectsPerCategory,
      updated_at: new Date().toISOString(),
    }).eq("id", 1);

    if (error) {
      toast.error(`${ar ? "تعذر حفظ الإعدادات" : "Could not save settings"}: ${error.message}`, { id: toastId });
      setSaving(false);
      return;
    }

    const session = (await sb.auth.getSession()).data.session;
    const response = await fetch("/api/revalidate", {
      method: "POST",
      headers: { Authorization: `Bearer ${session?.access_token || ""}` },
    }).catch(() => null);

    if (!response?.ok) {
      toast.warning(ar ? "تم الحفظ، لكن تعذّر تحديث الكاش تلقائيًا." : "Settings saved, but automatic cache revalidation failed.", { id: toastId });
    } else {
      toast.success(t("lastUpdated"), { id: toastId });
    }
    setSaving(false);
  }

  const field = (key: string, label: string, icon?: any, wide = false, textarea = false) => {
    const Icon = icon;
    return (
      <label className={wide ? "wide" : ""} key={key}>
        <span className="flex items-center gap-2">{Icon && <Icon size={12} />}{label}</span>
        {textarea ? (
          <textarea rows={4} value={f[key] || ""} onChange={(e) => setF((current) => ({ ...current, [key]: e.target.value }))} />
        ) : (
          <input value={f[key] || ""} onChange={(e) => setF((current) => ({ ...current, [key]: e.target.value }))} />
        )}
      </label>
    );
  };

  if (loading) return <div className="admin-loading">{t("loading")}</div>;

  return (
    <form className="admin-dashboard space-y-5" onSubmit={save}>
      <div className="admin-page-head">
        <div>
          <span className="admin-kicker">SYSTEM / CONTENT CONTROL</span>
          <h2>{t("settings")}</h2>
          <p>{ar ? "إدارة هوية الشركة وبيانات التواصل وSEO وتكوين أقسام الرئيسية من مكان واحد." : "Manage brand identity, contact details, SEO, and homepage sections from one place."}</p>
        </div>
        <span className="admin-panel-badge"><CheckCircle2 size={12} /> {ar ? "البيانات من Supabase" : "Supabase-backed"}</span>
      </div>

      <motion.section className="admin-panel" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
        <div className="admin-section-title"><div><span className="admin-kicker">01 / BRAND</span><h3>{ar ? "هوية الموقع" : "Website identity"}</h3></div></div>
        <div className="form-grid">
          {field("company_name", t("companyName"), Building2)}
          {field("brand_tagline_ar", ar ? "الشعار النصي بالعربية" : "Brand tagline (Arabic)")}
          {field("brand_tagline_en", ar ? "الشعار النصي بالإنجليزية" : "Brand tagline (English)")}
          {field("site_title", t("siteTitle"))}
          {field("logo_url", ar ? "رابط الشعار (مسار داخلي أو HTTPS)" : "Logo URL (local path or HTTPS)", ImageIcon, true)}
          <label>
            <span>{ar ? "سنوات الخبرة المعتمدة (اتركها 0 لإخفائها)" : "Approved years of experience (0 hides it)"}</span>
            <input type="number" min="0" max="100" value={f.years_experience ?? 0} onChange={(e) => setF((current) => ({ ...current, years_experience: e.target.value }))} />
          </label>
        </div>
      </motion.section>

      <motion.section className="admin-panel" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.04 }}>
        <div className="admin-section-title"><div><span className="admin-kicker">02 / HOMEPAGE</span><h3>{ar ? "محتوى الصفحة الرئيسية" : "Homepage content"}</h3></div><PanelTop size={17} className="text-violet-300" /></div>
        <div className="form-grid">
          {field("home_title_ar", t("homeTitleAr"), Home)}
          {field("home_title_en", t("homeTitleEn"), Home)}
          {field("home_desc_ar", t("homeDescAr"), null, true, true)}
          {field("home_desc_en", t("homeDescEn"), null, true, true)}
        </div>
      </motion.section>

      <motion.section className="admin-panel" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.08 }}>
        <div className="admin-section-title"><div><span className="admin-kicker">03 / CONTACT & SOCIAL</span><h3>{ar ? "التواصل والشبكات الاجتماعية" : "Contact & social links"}</h3></div><Mail size={17} className="text-mint-300" /></div>
        <div className="form-grid">
          <label><span>{ar ? "البريد الإلكتروني" : "Email address"}<input type="email" autoComplete="email" value={contactFields.email} onChange={(e) => setContactFields((current) => ({ ...current, email: e.target.value }))} placeholder="hello@example.com" /></span></label>
          <label><span>{ar ? "رقم الهاتف" : "Phone number"}<input type="tel" autoComplete="tel" value={contactFields.phone} onChange={(e) => setContactFields((current) => ({ ...current, phone: e.target.value }))} placeholder="+20…" /></span></label>
          <label><span>WhatsApp URL<input type="url" value={contactFields.whatsapp} onChange={(e) => setContactFields((current) => ({ ...current, whatsapp: e.target.value }))} placeholder="https://wa.me/…" /></span></label>
          <label><span>{ar ? "العنوان بالعربية" : "Address (Arabic)"}<input value={contactFields.address_ar} onChange={(e) => setContactFields((current) => ({ ...current, address_ar: e.target.value }))} /></span></label>
          <label><span>{ar ? "العنوان بالإنجليزية" : "Address (English)"}<input value={contactFields.address_en} onChange={(e) => setContactFields((current) => ({ ...current, address_en: e.target.value }))} /></span></label>
          <label><span>LinkedIn URL<input type="url" value={socialFields.linkedin} onChange={(e) => setSocialFields((current) => ({ ...current, linkedin: e.target.value }))} placeholder="https://www.linkedin.com/company/…" /></span></label>
          <label><span>X / Twitter URL<input type="url" value={socialFields.x} onChange={(e) => setSocialFields((current) => ({ ...current, x: e.target.value }))} placeholder="https://x.com/…" /></span></label>
          <label><span>GitHub URL<input type="url" value={socialFields.github} onChange={(e) => setSocialFields((current) => ({ ...current, github: e.target.value }))} placeholder="https://github.com/…" /></span></label>
          {field("footer_headline_ar", ar ? "عنوان الفوتر بالعربية" : "Footer headline (Arabic)")}
          {field("footer_accent_ar", ar ? "السطر المميز بالعربية" : "Footer accent (Arabic)")}
          {field("footer_headline_en", ar ? "عنوان الفوتر بالإنجليزية" : "Footer headline (English)")}
          {field("footer_accent_en", ar ? "السطر المميز بالإنجليزية" : "Footer accent (English)")}
          {field("footer_text_ar", ar ? "وصف الفوتر بالعربية" : "Footer description (Arabic)", null, true, true)}
          {field("footer_text_en", ar ? "وصف الفوتر بالإنجليزية" : "Footer description (English)", null, true, true)}
        </div>
      </motion.section>

      <motion.section className="admin-panel" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.1 }}>
        <div className="admin-section-title"><div><span className="admin-kicker">04 / NAVIGATION</span><h3>{ar ? "روابط القائمة الرئيسية" : "Main navigation"}</h3></div><PanelTop size={17} className="text-violet-300" /></div>
        <p className="mb-4 text-sm leading-7 text-ink-3">{ar ? "عدّل أسماء الروابط، رتّبها بالسهمين، أو أخفِ رابطًا دون حذف إعداداته. لا يمكن إدخال روابط خارجية في القائمة الرئيسية." : "Edit link labels, reorder with the arrows, or hide a route without deleting its settings. External URLs cannot be added to the primary navigation."}</p>
        <div className="space-y-3">
          {navigationDraft.map((item, index) => (
            <div key={item.href} className={`grid grid-cols-1 gap-3 rounded-2xl border p-4 md:grid-cols-[minmax(0,0.7fr)_minmax(0,1fr)_minmax(0,1fr)_auto] md:items-end ${item.enabled ? "border-violet-500/20 bg-[var(--ad-panel-2)]" : "border-white/5 bg-black/10 opacity-70"}`}>
              <div><span className="mb-2 block text-[10px] font-mono uppercase tracking-widest text-ink-4">{item.href}</span><label className="flex items-center gap-2 text-sm text-ink-2"><input type="checkbox" checked={item.enabled} onChange={(e) => setNavigationDraft((current) => current.map((entry, i) => i === index ? { ...entry, enabled: e.target.checked } : entry))} />{ar ? "ظاهر في الموقع" : "Visible on site"}</label></div>
              <label><span>{ar ? "العنوان بالعربية" : "Arabic label"}<input value={item.labelAr} maxLength={80} onChange={(e) => setNavigationDraft((current) => current.map((entry, i) => i === index ? { ...entry, labelAr: e.target.value } : entry))} /></span></label>
              <label><span>{ar ? "العنوان بالإنجليزية" : "English label"}<input value={item.labelEn} maxLength={80} onChange={(e) => setNavigationDraft((current) => current.map((entry, i) => i === index ? { ...entry, labelEn: e.target.value } : entry))} /></span></label>
              <div className="flex gap-2 md:pb-1">
                <button type="button" className="admin-tool-button !px-3" aria-label={ar ? "تحريك لأعلى" : "Move up"} disabled={index === 0} onClick={() => setNavigationDraft((current) => { const next = [...current]; [next[index - 1], next[index]] = [next[index], next[index - 1]]; return next; })}><ArrowUp size={14} /></button>
                <button type="button" className="admin-tool-button !px-3" aria-label={ar ? "تحريك لأسفل" : "Move down"} disabled={index === navigationDraft.length - 1} onClick={() => setNavigationDraft((current) => { const next = [...current]; [next[index + 1], next[index]] = [next[index], next[index + 1]]; return next; })}><ArrowDown size={14} /></button>
                {item.enabled ? <Eye size={15} className="mt-3 text-mint-300" /> : <EyeOff size={15} className="mt-3 text-ink-4" />}
              </div>
            </div>
          ))}
        </div>
      </motion.section>

      <motion.section className="admin-panel" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.14 }}>
        <div className="admin-section-title"><div><span className="admin-kicker">05 / SEO & MEDIA</span><h3>{ar ? "الظهور في محركات البحث" : "Search & sharing"}</h3></div><Globe2 size={17} className="text-violet-300" /></div>
        <div className="form-grid">
          {field("default_seo_image", ar ? "صورة SEO الافتراضية" : "Default SEO image", ImageIcon, true)}
          <label><span>{ar ? "عدد المشروعات المميزة" : "Featured project limit"}<input type="number" min="1" max="24" value={f.featured_limit ?? 6} onChange={(e) => setF((current) => ({ ...current, featured_limit: e.target.value }))} /></span></label>
          <label><span>{ar ? "عدد المشروعات لكل تصنيف" : "Projects per category"}<input type="number" min="1" max="50" value={f.projects_per_category ?? 6} onChange={(e) => setF((current) => ({ ...current, projects_per_category: e.target.value }))} /></span></label>
        </div>
      </motion.section>

      <motion.section className="admin-panel" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.18 }}>
        <div className="admin-section-title"><div><span className="admin-kicker">06 / HOMEPAGE CONTROL</span><h3>{ar ? "التحكم في أقسام الرئيسية" : "Homepage section visibility"}</h3></div><Eye size={17} className="text-mint-300" /></div>
        <p className="mb-4 text-sm leading-7 text-ink-3">{ar ? "أخفِ أو أظهر أي قسم في الرئيسية. بيانات القسم تظل محفوظة ويمكن إظهاره مرة أخرى في أي وقت." : "Show or hide homepage sections without deleting their content. Hidden section data remains saved and can be restored at any time."}</p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {SECTION_OPTIONS.map((section) => (
            <label key={section.key} className="flex min-h-12 cursor-pointer items-center justify-between gap-3 rounded-xl border border-violet-500/15 bg-[var(--ad-panel-2)] px-4 py-3 transition-colors hover:border-violet-500/35">
              <span className="text-sm text-ink-1">{ar ? section.ar : section.en}</span>
              <input type="checkbox" checked={visibility[section.key] !== false} onChange={(e) => setVisibility((current) => ({ ...current, [section.key]: e.target.checked }))} />
            </label>
          ))}
        </div>
      </motion.section>

      <div className="form-actions">
        <button className="admin-tool-button" type="button" onClick={() => void load()} disabled={saving}><span>{ar ? "إعادة تحميل من قاعدة البيانات" : "Reload from database"}</span></button>
        <button className="admin-primary" disabled={saving}><Save size={14} />{saving ? (ar ? "جارٍ الحفظ…" : "Saving…") : t("saveSettings")}</button>
      </div>
    </form>
  );
}
