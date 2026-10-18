"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Save, RefreshCw, FileText, Search, Languages, Code2, CircleAlert, Plus, Trash2, ChevronDown } from "lucide-react";
import { supabaseBrowser } from "@/lib/supabase-browser";
import { useAdminI18n } from "@/components/admin/AdminI18n";

const PAGE_OPTIONS = [
  { key: "home", ar: "الرئيسية", en: "Homepage" },
  { key: "services", ar: "الخدمات", en: "Services" },
  { key: "industries", ar: "الصناعات والقطاعات", en: "Industries" },
  { key: "about", ar: "عن الشركة", en: "About" },
  { key: "process", ar: "منهجية العمل", en: "Process" },
  { key: "insights", ar: "المعرفة والرؤى", en: "Insights" },
  { key: "contact", ar: "التواصل", en: "Contact" },
  { key: "faq", ar: "الأسئلة الشائعة", en: "FAQ" },
  { key: "careers", ar: "الوظائف", en: "Careers" },
  { key: "case-studies", ar: "دراسات الحالة", en: "Case studies" },
  { key: "projects", ar: "أرشيف المشروعات", en: "Projects archive" },
] as const;

type ContentForm = {
  eyebrow: string;
  title: string;
  accent: string;
  description: string;
  primary_label: string;
  primary_href: string;
  secondary_label: string;
  secondary_href: string;
  outro_title: string;
  outro_text: string;
  seo_title: string;
  seo_description: string;
  is_published: boolean;
};

const EMPTY_FORM: ContentForm = {
  eyebrow: "", title: "", accent: "", description: "",
  primary_label: "", primary_href: "", secondary_label: "", secondary_href: "",
  outro_title: "", outro_text: "", seo_title: "", seo_description: "", is_published: true,
};

const MARKETING_SECTION_FIELDS = [
  { key: "cardsEyebrow", ar: "النص أعلى البطاقات", en: "Cards eyebrow" },
  { key: "cardsTitle", ar: "عنوان قسم البطاقات", en: "Cards section title" },
  { key: "cardsAccent", ar: "النص المميز لقسم البطاقات", en: "Cards section accent" },
  { key: "cardsDescription", ar: "وصف قسم البطاقات", en: "Cards section description", multiline: true },
  { key: "liveSystemsEyebrow", ar: "عنوان قسم الأنظمة", en: "Systems section eyebrow" },
  { key: "outroEyebrow", ar: "النص أعلى الخاتمة", en: "Closing section eyebrow" },
];

type HomeOverviewField = { key: string; ar: string; en: string; multiline?: boolean };
type HomeOverviewGroup = { key: string; ar: string; en: string; fields: HomeOverviewField[]; create: (index: number) => Record<string, string> };
const HOME_OVERVIEW_GROUPS: HomeOverviewGroup[] = [
  { key: "capabilities", ar: "القدرات والحلول", en: "Capabilities & solutions", fields: [
    { key: "number", ar: "الرقم", en: "Number" }, { key: "title", ar: "العنوان", en: "Title" }, { key: "text", ar: "الوصف", en: "Description", multiline: true },
  ], create: (i) => ({ number: String(i).padStart(2, "0"), title: "", text: "" }) },
  { key: "audiences", ar: "العملاء والقطاعات المستهدفة", en: "Target audiences", fields: [
    { key: "title", ar: "العنوان", en: "Title" }, { key: "text", ar: "الوصف", en: "Description", multiline: true },
  ], create: () => ({ title: "", text: "" }) },
  { key: "principles", ar: "مبادئ الشركة", en: "Company principles", fields: [
    { key: "title", ar: "العنوان", en: "Title" }, { key: "text", ar: "الوصف", en: "Description", multiline: true },
  ], create: () => ({ title: "", text: "" }) },
  { key: "process", ar: "مراحل العمل", en: "Work process", fields: [
    { key: "number", ar: "الرقم", en: "Number" }, { key: "title", ar: "العنوان", en: "Title" }, { key: "text", ar: "الوصف", en: "Description", multiline: true },
  ], create: (i) => ({ number: String(i).padStart(2, "0"), title: "", text: "" }) },
  { key: "questions", ar: "الأسئلة الشائعة بالرئيسية", en: "Homepage FAQs", fields: [
    { key: "q", ar: "السؤال", en: "Question", multiline: true }, { key: "a", ar: "الإجابة", en: "Answer", multiline: true },
  ], create: () => ({ q: "", a: "" }) },
];

const ABOUT_STATS_DEFAULTS: Record<"ar" | "en", Array<{ index: string; title: string; body: string }>> = {
  ar: [
    { index: "01", title: "6 مسارات خدمة أساسية", body: "تطوير الويب، أنظمة الأعمال، الذكاء الاصطناعي، الأنظمة المدمجة وإنترنت الأشياء، تطبيقات الموبايل، والدعم المستمر." },
    { index: "02", title: "لغتان، تجربة واحدة", body: "تجربة عربية وإنجليزية مع مراعاة اتجاه الكتابة وتنسيق الواجهة في كل لغة." },
    { index: "03", title: "من الواجهات إلى الأجهزة", body: "نجمع تطوير الويب والموبايل وتكامل الذكاء الاصطناعي والأنظمة المدمجة ضمن نطاق هندسي متكامل." },
    { index: "04", title: "ما بعد الإطلاق أيضًا", body: "يشمل نطاق العمل الصيانة وتحسين الأداء والمراجعات التقنية وتطوير المنتج على مراحل." },
  ],
  en: [
    { index: "01", title: "Six core service lines", body: "Web development, business systems, AI, embedded and IoT, mobile applications, and ongoing support." },
    { index: "02", title: "Two languages, one experience", body: "Arabic and English experiences designed around the right reading direction and layout for each language." },
    { index: "03", title: "From interfaces to devices", body: "Our technical scope spans web and mobile products, practical AI integrations, and embedded systems." },
    { index: "04", title: "Beyond launch", body: "The service scope includes maintenance, performance improvements, technical reviews, and iterative product development." },
  ],
};

const SECTION_TEXT_FIELDS: Record<string, Array<{ key: string; ar: string; en: string; multiline?: boolean }>> = {
  services: MARKETING_SECTION_FIELDS,
  industries: MARKETING_SECTION_FIELDS,
  about: MARKETING_SECTION_FIELDS,
  process: MARKETING_SECTION_FIELDS,
  insights: MARKETING_SECTION_FIELDS,
  contact: MARKETING_SECTION_FIELDS,
  faq: MARKETING_SECTION_FIELDS,
  careers: MARKETING_SECTION_FIELDS,
  projects: [
    { key: "catalogueEyebrow", ar: "النص أعلى أرشيف المشاريع", en: "Archive eyebrow" },
    { key: "catalogue", ar: "عنوان أرشيف المشاريع", en: "Archive title" },
    { key: "catalogueDescription", ar: "وصف أرشيف المشاريع", en: "Archive description", multiline: true },
    { key: "services", ar: "رابط/زر الخدمات", en: "Services CTA label" },
    { key: "contact", ar: "زر التواصل", en: "Contact CTA label" },
    { key: "unconfiguredTitle", ar: "عنوان غياب إعداد قاعدة البيانات", en: "Database setup title" },
    { key: "unconfiguredBody", ar: "رسالة إعداد قاعدة البيانات", en: "Database setup message", multiline: true },
    { key: "errorTitle", ar: "عنوان خطأ البيانات", en: "Data error title" },
    { key: "errorBody", ar: "رسالة خطأ البيانات", en: "Data error message", multiline: true },
    { key: "compatibilityTitle", ar: "عنوان وضع التوافق", en: "Compatibility mode title" },
    { key: "compatibilityBody", ar: "رسالة وضع التوافق", en: "Compatibility mode message", multiline: true },
    { key: "emptyTitle", ar: "عنوان عدم وجود مشاريع", en: "Empty archive title" },
    { key: "emptyBody", ar: "رسالة عدم وجود مشاريع", en: "Empty archive message", multiline: true },
  ],
  "case-studies": [
    { key: "list", ar: "عنوان قائمة دراسات الحالة", en: "Case studies list title" },
    { key: "listDescription", ar: "وصف قائمة دراسات الحالة", en: "Case studies list description", multiline: true },
    { key: "emptyTitle", ar: "عنوان عدم وجود دراسات حالة", en: "Empty case studies title" },
    { key: "emptyBody", ar: "رسالة عدم وجود دراسات حالة", en: "Empty case studies message", multiline: true },
    { key: "unavailableTitle", ar: "عنوان تعذر تحميل المشاريع", en: "Projects unavailable title" },
    { key: "unavailableBody", ar: "رسالة تعذر تحميل المشاريع", en: "Projects unavailable message", multiline: true },
    { key: "services", ar: "زر الخدمات", en: "Services CTA label" },
    { key: "contact", ar: "زر التواصل", en: "Contact CTA label" },
  ],
};

function safePath(value: string) {
  const text = value.trim();
  if (!text) return true;
  if (text.startsWith("#")) return /^#[A-Za-z][A-Za-z0-9_.:-]{0,120}$/.test(text);
  if (text.startsWith("/") && !text.startsWith("//") && !text.includes("\\") && !/^\/(?:%2f|%5c)/i.test(text)) return true;
  try {
    const parsed = new URL(text);
    return parsed.protocol === "https:" || parsed.protocol === "http:";
  } catch {
    return false;
  }
}

export default function PageContentEditor() {
  const { locale } = useAdminI18n();
  const ar = locale === "ar";
  const sb = useMemo(() => supabaseBrowser(), []);
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedPage = searchParams.get("page");
  const requestedLocale = searchParams.get("locale");
  const [pageKey, setPageKey] = useState(() => PAGE_OPTIONS.some((page) => page.key === requestedPage) ? requestedPage! : "home");
  const [contentLocale, setContentLocale] = useState<"ar" | "en">(() => requestedLocale === "en" || requestedLocale === "ar" ? requestedLocale : locale);
  const [form, setForm] = useState<ContentForm>(EMPTY_FORM);
  const [cardsJson, setCardsJson] = useState("[]");
  const [sectionsJson, setSectionsJson] = useState("{}");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState("");
  const [loadError, setLoadError] = useState("");

  const cardRows = useMemo<Record<string, unknown>[]>(() => {
    try {
      const parsed: unknown = JSON.parse(cardsJson);
      return Array.isArray(parsed)
        ? parsed.filter((item): item is Record<string, unknown> => Boolean(item && typeof item === "object" && !Array.isArray(item))).slice(0, 40)
        : [];
    } catch {
      return [];
    }
  }, [cardsJson]);

  const sectionObject = useMemo<Record<string, unknown>>(() => {
    try {
      const parsed: unknown = JSON.parse(sectionsJson);
      return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed as Record<string, unknown> : {};
    } catch {
      return {};
    }
  }, [sectionsJson]);
  const updateSection = (key: string, value: string) => setSectionsJson(JSON.stringify({ ...sectionObject, [key]: value }, null, 2));
  const writeCards = (next: Record<string, unknown>[]) => setCardsJson(JSON.stringify(next.slice(0, 40), null, 2));
  const updateCard = (index: number, key: string, value: unknown) => {
    const next = [...cardRows];
    next[index] = { ...next[index], [key]: value };
    writeCards(next);
  };
  const addCard = () => writeCards([...cardRows, { number: String(cardRows.length + 1).padStart(2, "0"), icon: "◇", title: "", body: "", tags: [] }]);
  const removeCard = (index: number) => writeCards(cardRows.filter((_, itemIndex) => itemIndex !== index));
  const homepageOverview = sectionObject.homeOverview && typeof sectionObject.homeOverview === "object" && !Array.isArray(sectionObject.homeOverview)
    ? sectionObject.homeOverview as Record<string, unknown>
    : {};
  const updateHomeOverviewItem = (groupKey: string, index: number, fieldKey: string, value: string) => {
    const current = Array.isArray(homepageOverview[groupKey]) ? homepageOverview[groupKey] as unknown[] : [];
    const next = current.map((item, itemIndex) => itemIndex === index && item && typeof item === "object" && !Array.isArray(item)
      ? { ...(item as Record<string, unknown>), [fieldKey]: value }
      : item);
    setSectionsJson(JSON.stringify({ ...sectionObject, homeOverview: { ...homepageOverview, [groupKey]: next } }, null, 2));
  };
  const addHomeOverviewItem = (groupKey: string) => {
    const group = HOME_OVERVIEW_GROUPS.find((item) => item.key === groupKey);
    if (!group) return;
    const current = Array.isArray(homepageOverview[groupKey]) ? homepageOverview[groupKey] as unknown[] : [];
    if (current.length >= 20) return;
    setSectionsJson(JSON.stringify({ ...sectionObject, homeOverview: { ...homepageOverview, [groupKey]: [...current, group.create(current.length + 1)] } }, null, 2));
  };
  const removeHomeOverviewItem = (groupKey: string, index: number) => {
    const current = Array.isArray(homepageOverview[groupKey]) ? homepageOverview[groupKey] as unknown[] : [];
    setSectionsJson(JSON.stringify({ ...sectionObject, homeOverview: { ...homepageOverview, [groupKey]: current.filter((_, itemIndex) => itemIndex !== index) } }, null, 2));
  };
  const aboutStats = Array.isArray(sectionObject.aboutStats)
    ? (sectionObject.aboutStats as unknown[]).filter((item): item is Record<string, unknown> => Boolean(item && typeof item === "object" && !Array.isArray(item))).slice(0, 8)
    : [];
  const updateAboutStat = (index: number, key: "index" | "title" | "body", value: string) => {
    const next = aboutStats.map((item, itemIndex) => itemIndex === index ? { ...item, [key]: value } : item);
    setSectionsJson(JSON.stringify({ ...sectionObject, aboutStats: next }, null, 2));
  };
  const addAboutStat = () => {
    if (aboutStats.length >= 8) return;
    setSectionsJson(JSON.stringify({ ...sectionObject, aboutStats: [...aboutStats, { index: String(aboutStats.length + 1).padStart(2, "0"), title: "", body: "" }] }, null, 2));
  };
  const removeAboutStat = (index: number) => {
    setSectionsJson(JSON.stringify({ ...sectionObject, aboutStats: aboutStats.filter((_, itemIndex) => itemIndex !== index) }, null, 2));
  };

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    try {
      const [rowResult, settingsResult] = await Promise.all([
        sb.from("site_page_content").select("*").eq("page_key", pageKey).eq("locale", contentLocale).maybeSingle(),
        sb.from("site_settings").select("*").eq("id", 1).maybeSingle(),
      ]);

      if (rowResult.error) {
        setLoadError(rowResult.error.message);
        toast.error(ar ? "تعذر تحميل سجل المحتوى. تأكد من تطبيق ترحيلة CMS في Supabase." : "Could not load this content row. Confirm the CMS migration has been applied in Supabase.");
      }
      if (settingsResult.error) {
        setLoadError((previous) => previous || settingsResult.error!.message);
      }

      const row = rowResult.data as Record<string, any> | null;
      const settings = settingsResult.data as Record<string, any> | null;
      const home = pageKey === "home";
      const localizedTitle = home ? settings?.[`home_title_${contentLocale}`] : row?.title;
      const localizedDescription = home ? settings?.[`home_desc_${contentLocale}`] : row?.description;

      setForm({
        eyebrow: row?.eyebrow || "",
        title: localizedTitle || row?.title || "",
        accent: row?.accent || "",
        description: localizedDescription || row?.description || "",
        primary_label: row?.primary_label || "",
        primary_href: row?.primary_href || (pageKey === "projects" ? "#project-catalogue" : pageKey === "case-studies" ? `/${contentLocale}/projects` : `/${contentLocale}/contact`),
        secondary_label: row?.secondary_label || "",
        secondary_href: row?.secondary_href || "",
        outro_title: row?.outro_title || "",
        outro_text: row?.outro_text || "",
        seo_title: row?.seo_title || "",
        seo_description: row?.seo_description || localizedDescription || row?.description || "",
        is_published: row?.is_published !== false,
      });
      setCardsJson(JSON.stringify(Array.isArray(row?.cards) ? row.cards : [], null, 2));
      const loadedSections = row?.sections && typeof row.sections === "object" && !Array.isArray(row.sections)
        ? { ...row.sections as Record<string, unknown> }
        : {};
      if (pageKey === "about" && !Array.isArray(loadedSections.aboutStats)) {
        loadedSections.aboutStats = ABOUT_STATS_DEFAULTS[contentLocale];
      }
      setSectionsJson(JSON.stringify(loadedSections, null, 2));
      setLastSaved(row?.updated_at || "");
    } catch (error) {
      const message = error instanceof Error ? error.message : (ar ? "تعذر تحميل المحتوى." : "Could not load page content.");
      setLoadError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [ar, contentLocale, pageKey, sb]);

  useEffect(() => { void load(); }, [load]);

  function update<K extends keyof ContentForm>(key: K, value: ContentForm[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function save(event: FormEvent) {
    event.preventDefault();
    let cards: unknown;
    let sections: unknown;
    try {
      cards = JSON.parse(cardsJson);
      if (!Array.isArray(cards)) throw new Error(ar ? "حقل البطاقات يجب أن يكون مصفوفة JSON." : "Cards must be a JSON array.");
      sections = JSON.parse(sectionsJson);
      if (!sections || Array.isArray(sections) || typeof sections !== "object") throw new Error(ar ? "الأقسام يجب أن تكون كائن JSON." : "Sections must be a JSON object.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : (ar ? "صيغة JSON غير صحيحة." : "Invalid JSON."));
      return;
    }
    if (!safePath(form.primary_href) || !safePath(form.secondary_href)) {
      toast.error(ar ? "روابط الأزرار يجب أن تكون مسارات داخلية أو روابط HTTP/HTTPS صحيحة." : "Button links must be internal paths or valid HTTP/HTTPS URLs.");
      return;
    }
    if (!form.seo_title.trim() || !form.seo_description.trim()) {
      toast.error(ar ? "أكمل عنوان SEO والوصف قبل الحفظ." : "Complete the SEO title and description before saving.");
      return;
    }

    setSaving(true);
    const toastId = toast.loading(ar ? "جارٍ حفظ المحتوى…" : "Saving page content…");
    try {
      if (pageKey === "home") {
        const patch = contentLocale === "ar"
          ? { home_title_ar: form.title, home_desc_ar: form.description }
          : { home_title_en: form.title, home_desc_en: form.description };
        const { data: updatedSettings, error } = await sb
          .from("site_settings")
          .update(patch)
          .eq("id", 1)
          .select("id")
          .maybeSingle();
        if (error) throw error;
        if (!updatedSettings) {
          throw new Error(ar
            ? "لم يتم تحديث إعدادات الرئيسية. تأكد من وجود سجل site_settings برقم 1 وصلاحيات التعديل."
            : "Homepage settings were not updated. Check the site_settings row with id 1 and update permissions.");
        }
      }

      const payload = {
        page_key: pageKey,
        locale: contentLocale,
        eyebrow: form.eyebrow.trim() || null,
        title: pageKey === "home" ? null : form.title.trim() || null,
        accent: form.accent.trim() || null,
        description: pageKey === "home" ? null : form.description.trim() || null,
        primary_label: form.primary_label.trim() || null,
        primary_href: form.primary_href.trim() || null,
        secondary_label: form.secondary_label.trim() || null,
        secondary_href: form.secondary_href.trim() || null,
        outro_title: form.outro_title.trim() || null,
        outro_text: form.outro_text.trim() || null,
        seo_title: form.seo_title.trim(),
        seo_description: form.seo_description.trim(),
        cards,
        sections,
        // Homepage availability is controlled by the site itself; do not let a copy-editor
        // accidentally unpublish the primary entry point of the company website.
        is_published: pageKey === "home" ? true : form.is_published,
        updated_at: new Date().toISOString(),
      };
      const { error } = await sb.from("site_page_content").upsert(payload, { onConflict: "page_key,locale" });
      if (error) throw error;

      const session = (await sb.auth.getSession()).data.session;
      const revalidateResponse = await fetch("/api/revalidate", {
        method: "POST",
        headers: { Authorization: `Bearer ${session?.access_token || ""}` },
      });
      if (!revalidateResponse.ok) {
        toast.warning(ar ? "تم الحفظ، لكن تعذّر تحديث الكاش تلقائيًا. أعد تحميل الموقع بعد دقيقة." : "Saved, but automatic cache refresh failed. Reload the site after a minute.", { id: toastId });
      } else {
        toast.success(ar ? "تم حفظ المحتوى وتحديث الصفحات." : "Content saved and pages revalidated.", { id: toastId });
      }
      setLastSaved(new Date().toISOString());
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : (ar ? "فشل حفظ المحتوى." : "Unable to save content."), { id: toastId });
    } finally {
      setSaving(false);
    }
  }

  const field = (key: keyof ContentForm, label: string, wide = false, rows = 0) => (
    <label className={wide ? "wide" : ""} key={key}>
      <span>{label}</span>
      {rows > 0 ? (
        <textarea rows={rows} value={String(form[key] ?? "")} onChange={(event) => update(key, event.target.value as never)} />
      ) : key === "is_published" ? (
        <span className="flex items-center gap-2">
          <input type="checkbox" checked={form.is_published} onChange={(event) => update("is_published", event.target.checked)} />
          {form.is_published ? (ar ? "منشور للعامة" : "Published publicly") : (ar ? "مسودة مخفية" : "Hidden draft")}
        </span>
      ) : (
        <input value={String(form[key] ?? "")} onChange={(event) => update(key, event.target.value as never)} />
      )}
    </label>
  );

  return (
    <div className="admin-dashboard">
      <div className="admin-page-head">
        <div>
          <span className="admin-kicker">CONTENT STUDIO / CMS</span>
          <h2>{ar ? "محتوى صفحات الموقع" : "Website content studio"}</h2>
          <p>{ar ? "عدّل النصوص والبطاقات والأقسام وSEO لكل صفحة ولغة من مكان واحد. المشروعات نفسها تظل مُدارة في قسم المشروعات." : "Edit each page's copy, cards, structured sections and SEO in one place. Project records remain managed in Projects."}</p>
        </div>
      </div>

      <motion.section className="admin-panel" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
        <div className="form-grid">
          <label>
            <span className="flex items-center gap-2"><FileText size={13} />{ar ? "الصفحة" : "Page"}</span>
            <select value={pageKey} onChange={(event) => setPageKey(event.target.value)}>
              {PAGE_OPTIONS.map((page) => <option key={page.key} value={page.key}>{ar ? page.ar : page.en}</option>)}
            </select>
          </label>
          <label>
            <span className="flex items-center gap-2"><Languages size={13} />{ar ? "لغة المحتوى" : "Content language"}</span>
            <select value={contentLocale} onChange={(event) => setContentLocale(event.target.value as "ar" | "en")}>
              <option value="ar">العربية</option>
              <option value="en">English</option>
            </select>
          </label>
        </div>
        {lastSaved ? <p className="text-xs text-ink-4">{ar ? "آخر تحديث:" : "Last update:"} {new Date(lastSaved).toLocaleString(contentLocale === "ar" ? "ar-EG" : "en-US")}</p> : null}
      </motion.section>

      {loadError ? (
        <div className="admin-panel flex items-start gap-3" role="alert">
          <CircleAlert size={18} className="mt-1 text-amber-400" />
          <div><strong>{ar ? "تعذر تحميل سجل CMS" : "CMS record unavailable"}</strong><p className="mt-1 text-sm text-ink-3">{loadError}</p><p className="mt-2 text-sm text-ink-3">{ar ? "طبّق الملف supabase/04_editorial_cms.sql في Supabase SQL Editor، ثم أعد التحميل." : "Apply supabase/04_editorial_cms.sql in the Supabase SQL Editor, then reload."}</p></div>
        </div>
      ) : null}

      {loading ? <div className="admin-loading">{ar ? "جارٍ تحميل المحتوى…" : "Loading content…"}</div> : (
        <form className="admin-dashboard" onSubmit={save}>
          <section className="admin-panel">
            <div className="admin-section-title"><div><span className="admin-kicker">01 / PAGE COPY</span><h3>{ar ? "المحتوى الأساسي" : "Core page copy"}</h3></div></div>
            <div className="form-grid">
              {field("eyebrow", ar ? "النص التمهيدي" : "Eyebrow")}
              {field("title", pageKey === "home" ? (ar ? "عنوان الهيرو" : "Hero title") : (ar ? "العنوان الرئيسي" : "Page title"))}
              {field("accent", ar ? "النص المميز" : "Accent line")}
              {field("description", ar ? "الوصف الرئيسي" : "Main description", true, 4)}
              {field("primary_label", ar ? "عنوان الزر الأساسي" : "Primary button label")}
              {field("primary_href", ar ? "رابط الزر الأساسي" : "Primary button URL")}
              {field("secondary_label", ar ? "عنوان الزر الثانوي" : "Secondary button label")}
              {field("secondary_href", ar ? "رابط الزر الثانوي" : "Secondary button URL")}
              {field("outro_title", ar ? "عنوان الخاتمة" : "Closing section title")}
              {field("outro_text", ar ? "نص الخاتمة" : "Closing section text", true, 3)}
            </div>
          </section>

          <section className="admin-panel">
            <div className="admin-section-title"><div><span className="admin-kicker">02 / SEARCH & SHARING</span><h3>{ar ? "إعدادات SEO" : "SEO metadata"}</h3></div><span className="admin-panel-badge"><Search size={12} /> SEO</span></div>
            <div className="form-grid">
              {field("seo_title", ar ? "عنوان محركات البحث" : "SEO title")}
              {field("seo_description", ar ? "وصف محركات البحث" : "SEO description", true, 3)}
            </div>
            {pageKey !== "home" ? (
              <div className="mt-3">{field("is_published", ar ? "حالة النشر" : "Publication status")}</div>
            ) : (
              <p className="mt-3 text-xs leading-6 text-ink-4">{ar ? "الصفحة الرئيسية تظل متاحة دائمًا. إخفاء نصوص CMS لا يعطّل الصفحة الأساسية." : "The homepage remains available. CMS copy publication does not disable the homepage route."}</p>
            )}
          </section>

          <section className="admin-panel">
            <div className="admin-section-title"><div><span className="admin-kicker">03 / CONTENT BUILDER</span><h3>{ar ? "محرر البطاقات والأقسام" : "Cards & page sections"}</h3></div><span className="admin-panel-badge"><FileText size={12} /> {cardRows.length} {ar ? "بطاقة" : "cards"}</span></div>
            <p className="mb-4 text-sm leading-7 text-ink-3">{ar ? "عدّل البطاقات من حقول واضحة بدل كتابة JSON. التغييرات لا تظهر للعامة إلا بعد الضغط على حفظ المحتوى. استخدم وضع المطور فقط عند تعديل مفاتيح الأقسام المتقدمة." : "Edit cards with normal fields instead of hand-writing JSON. Changes go live only after saving. Use developer mode only for advanced section keys."}</p>
            {(SECTION_TEXT_FIELDS[pageKey]?.length ?? 0) > 0 ? (
              <div className="form-grid mb-5 rounded-2xl border border-violet-500/15 bg-[var(--bg-1)]/35 p-4">
                {SECTION_TEXT_FIELDS[pageKey].map((item) => (
                  <label className={item.multiline ? "wide" : ""} key={item.key}>
                    <span>{ar ? item.ar : item.en}</span>
                    {item.multiline ? (
                      <textarea rows={3} value={typeof sectionObject[item.key] === "string" ? sectionObject[item.key] as string : ""} onChange={(event) => updateSection(item.key, event.target.value)} />
                    ) : (
                      <input value={typeof sectionObject[item.key] === "string" ? sectionObject[item.key] as string : ""} onChange={(event) => updateSection(item.key, event.target.value)} />
                    )}
                  </label>
                ))}
              </div>
            ) : null}
            {pageKey === "about" ? (
              <div className="mb-5 space-y-3 rounded-2xl border border-violet-500/15 bg-[var(--bg-1)]/35 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div><h4 className="font-semibold text-ink-1">{ar ? "نقاط القوة الرئيسية" : "Company highlights"}</h4><p className="mt-1 text-xs leading-6 text-ink-4">{ar ? "هذه البطاقات كانت ثابتة في القالب؛ أصبحت الآن قابلة للتعديل والحفظ لكل لغة." : "These highlights used to be hard-coded; they are now editable and saved per language."}</p></div>
                  <button type="button" className="admin-tool-button" onClick={addAboutStat} disabled={aboutStats.length >= 8}><Plus size={14} />{ar ? "إضافة بطاقة" : "Add highlight"}</button>
                </div>
                {aboutStats.length ? aboutStats.map((item, index) => (
                  <div key={`${String(item.index || index)}-${index}`} className="rounded-xl border border-violet-500/10 bg-[var(--bg-glass)] p-3">
                    <div className="mb-3 flex items-center justify-between gap-3"><strong className="text-xs text-ink-4">{ar ? `بطاقة ${index + 1}` : `Highlight ${index + 1}`}</strong><button type="button" className="admin-tool-button" onClick={() => removeAboutStat(index)}><Trash2 size={13} />{ar ? "حذف" : "Remove"}</button></div>
                    <div className="form-grid"><label><span>{ar ? "الرقم" : "Index"}<input maxLength={12} value={String(item.index ?? String(index + 1).padStart(2, "0"))} onChange={(event) => updateAboutStat(index, "index", event.target.value)} /></span></label><label className="wide"><span>{ar ? "العنوان" : "Title"}<input maxLength={180} value={String(item.title ?? "")} onChange={(event) => updateAboutStat(index, "title", event.target.value)} /></span></label><label className="wide"><span>{ar ? "الوصف" : "Description"}<textarea rows={3} maxLength={1600} value={String(item.body ?? "")} onChange={(event) => updateAboutStat(index, "body", event.target.value)} /></span></label></div>
                  </div>
                )) : <p className="text-xs text-ink-4">{ar ? "تم حذف كل البطاقات؛ لن يظهر قسم نقاط القوة في الموقع بعد الحفظ." : "All highlights are removed; this section will be hidden after saving."}</p>}
              </div>
            ) : null}
            {pageKey === "home" ? (
              <div className="mb-5 space-y-4">
                <div className="rounded-2xl border border-violet-500/15 bg-[var(--bg-1)]/35 p-4">
                  <h4 className="font-semibold text-ink-1">{ar ? "محتوى الرئيسية المنظم" : "Homepage content editor"}</h4>
                  <p className="mt-2 text-xs leading-6 text-ink-4">{ar ? "عدّل القوائم مباشرة من الحقول التالية. تغييرات كل لغة تحفظ في سجلها المستقل، ويمكنك إضافة أو حذف عناصر دون كتابة JSON." : "Edit the homepage lists directly. Each language is saved to its own CMS record, and items can be added or removed without editing JSON."}</p>
                </div>
                {HOME_OVERVIEW_GROUPS.map((group) => {
                  const rows = Array.isArray(homepageOverview[group.key])
                    ? (homepageOverview[group.key] as unknown[]).filter((item): item is Record<string, unknown> => Boolean(item && typeof item === "object" && !Array.isArray(item))).slice(0, 20)
                    : [];
                  return (
                    <div key={group.key} className="rounded-2xl border border-violet-500/15 bg-[var(--bg-1)]/40 p-4">
                      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                        <strong className="text-sm text-ink-1">{ar ? group.ar : group.en}</strong>
                        <button type="button" className="admin-tool-button" onClick={() => addHomeOverviewItem(group.key)} disabled={rows.length >= 20}><Plus size={14} />{ar ? "إضافة عنصر" : "Add item"}</button>
                      </div>
                      {rows.length ? <div className="space-y-3">{rows.map((item, index) => (
                        <div key={`${group.key}-${index}`} className="rounded-xl border border-violet-500/10 bg-[var(--bg-glass)] p-3">
                          <div className="mb-3 flex items-center justify-between gap-3"><span className="text-xs text-ink-4">{ar ? `عنصر ${index + 1}` : `Item ${index + 1}`}</span><button type="button" className="admin-tool-button" onClick={() => removeHomeOverviewItem(group.key, index)}><Trash2 size={13} />{ar ? "حذف" : "Remove"}</button></div>
                          <div className="form-grid">{group.fields.map((field) => (
                            <label key={field.key} className={field.multiline ? "wide" : ""}><span>{ar ? field.ar : field.en}{field.multiline ? <textarea rows={3} value={typeof item[field.key] === "string" ? item[field.key] as string : ""} onChange={(event) => updateHomeOverviewItem(group.key, index, field.key, event.target.value)} /> : <input value={typeof item[field.key] === "string" ? item[field.key] as string : ""} onChange={(event) => updateHomeOverviewItem(group.key, index, field.key, event.target.value)} />}</span></label>
                          ))}</div>
                        </div>
                      ))}</div> : <p className="text-xs text-ink-4">{ar ? "لا توجد عناصر بعد. أضف أول عنصر من الزر." : "No items yet. Add the first item above."}</p>}
                    </div>
                  );
                })}
              </div>
            ) : null}
            {!(["home", "projects", "case-studies"].includes(pageKey)) ? (
              <div className="mb-5 space-y-3">
                {cardRows.map((card, index) => (
                  <div key={index} className="rounded-2xl border border-violet-500/15 bg-[var(--bg-1)]/45 p-4">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <strong className="text-sm text-ink-1">{ar ? `البطاقة ${index + 1}` : `Card ${index + 1}`}</strong>
                      <button type="button" className="admin-tool-button" onClick={() => removeCard(index)} aria-label={ar ? `حذف البطاقة ${index + 1}` : `Remove card ${index + 1}`}><Trash2 size={14} />{ar ? "حذف" : "Remove"}</button>
                    </div>
                    <div className="form-grid">
                      <label><span>{ar ? "العنوان" : "Title"}<input value={typeof card.title === "string" ? card.title : ""} onChange={(event) => updateCard(index, "title", event.target.value)} /></span></label>
                      <label><span>{ar ? "الرقم" : "Number"}<input value={typeof card.number === "string" ? card.number : ""} onChange={(event) => updateCard(index, "number", event.target.value)} /></span></label>
                      <label><span>{ar ? "الرمز" : "Icon"}<input value={typeof card.icon === "string" ? card.icon : "◇"} maxLength={24} onChange={(event) => updateCard(index, "icon", event.target.value)} /></span></label>
                      <label className="wide"><span>{ar ? "الوصف" : "Description"}<textarea rows={3} value={typeof card.body === "string" ? card.body : ""} onChange={(event) => updateCard(index, "body", event.target.value)} /></span></label>
                      <label className="wide"><span>{ar ? "الوسوم (افصل بينها بفاصلة)" : "Tags (comma separated)"}<input value={Array.isArray(card.tags) ? card.tags.filter((tag): tag is string => typeof tag === "string").join(", ") : ""} onChange={(event) => updateCard(index, "tags", event.target.value.split(",").map((tag) => tag.trim()).filter(Boolean).slice(0, 12))} /></span></label>
                    </div>
                  </div>
                ))}
                <button type="button" className="admin-tool-button" onClick={addCard} disabled={cardRows.length >= 40}><Plus size={15} />{ar ? "إضافة بطاقة" : "Add card"}</button>
              </div>
            ) : (
              <p className="mb-4 rounded-xl border border-violet-500/15 p-4 text-sm leading-7 text-ink-3">{pageKey === "home" ? (ar ? "تظهر قوائم الرئيسية في المحرر المرئي أعلاه؛ استخدم وضع المطور فقط إذا كنت تعدّل إعدادات متقدمة مثل أسماء مشاهد 3D." : "Homepage lists are editable in the visual editor above; use developer mode only for advanced settings such as 3D scene names.") : (ar ? "الأرشيف ودراسات الحالة يستخدمان سجلات المشروعات من قسم المشروعات. عدّل نصوص القسم الخاصة بهما من حقولها أو من وضع المطور." : "Project archive and case studies use records from the Projects area. Their custom copy is available in the fields above and advanced mode.")}</p>
            )}
            <details className="rounded-xl border border-violet-500/15 p-4">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-semibold text-ink-1"><span className="flex items-center gap-2"><Code2 size={14} />{ar ? "وضع المطور — JSON متقدم" : "Developer mode — advanced JSON"}</span><ChevronDown size={15} /></summary>
              <p className="my-3 text-xs leading-6 text-ink-4">{ar ? "لا تحتاج هذه الحقول للتعديل اليومي. أي JSON غير صحيح سيمنع الحفظ مع إظهار رسالة خطأ." : "These fields are not needed for routine editing. Invalid JSON prevents saving and shows an error."}</p>
              <div className="form-grid">
                <label className="wide"><span>{ar ? "البطاقات (JSON)" : "Cards JSON"}<textarea rows={10} spellCheck={false} className="font-mono text-xs" value={cardsJson} onChange={(event) => setCardsJson(event.target.value)} /></span></label>
                <label className="wide"><span>{ar ? "الأقسام (JSON)" : "Sections JSON"}<textarea rows={14} spellCheck={false} className="font-mono text-xs" value={sectionsJson} onChange={(event) => setSectionsJson(event.target.value)} /></span></label>
              </div>
            </details>
          </section>

          <div className="form-actions">
            <button className="admin-tool-button" type="button" onClick={() => void load()} disabled={saving || loading}><RefreshCw size={14} />{ar ? "إعادة التحميل" : "Reload"}</button>
            <button className="admin-primary" disabled={saving || loading}><Save size={14} />{saving ? (ar ? "جارٍ الحفظ…" : "Saving…") : (ar ? "حفظ ونشر المحتوى" : "Save page content")}</button>
          </div>
        </form>
      )}
    </div>
  );
}
