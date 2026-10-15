"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Save, RefreshCw, FileText, Search, Languages, Eye, EyeOff, Code2, CircleAlert } from "lucide-react";
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

function safePath(value: string) {
  const text = value.trim();
  if (!text) return true;
  if (text.startsWith("/") && !text.startsWith("//")) return true;
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
  const [pageKey, setPageKey] = useState("home");
  const [contentLocale, setContentLocale] = useState<"ar" | "en">(locale);
  const [form, setForm] = useState<ContentForm>(EMPTY_FORM);
  const [cardsJson, setCardsJson] = useState("[]");
  const [sectionsJson, setSectionsJson] = useState("{}");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState("");
  const [loadError, setLoadError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError("");
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
      primary_href: row?.primary_href || `/${contentLocale}/contact`,
      secondary_label: row?.secondary_label || "",
      secondary_href: row?.secondary_href || "",
      outro_title: row?.outro_title || "",
      outro_text: row?.outro_text || "",
      seo_title: row?.seo_title || "",
      seo_description: row?.seo_description || localizedDescription || row?.description || "",
      is_published: row?.is_published !== false,
    });
    setCardsJson(JSON.stringify(Array.isArray(row?.cards) ? row.cards : [], null, 2));
    setSectionsJson(JSON.stringify(row?.sections && typeof row.sections === "object" ? row.sections : {}, null, 2));
    setLastSaved(row?.updated_at || "");
    setLoading(false);
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
        const { error } = await sb.from("site_settings").update(patch).eq("id", 1);
        if (error) throw error;
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
        is_published: form.is_published,
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
            <div className="mt-3">{field("is_published", ar ? "حالة النشر" : "Publication status")}</div>
          </section>

          <section className="admin-panel">
            <div className="admin-section-title"><div><span className="admin-kicker">03 / STRUCTURED CONTENT</span><h3>{ar ? "البطاقات والأقسام المتقدمة" : "Cards & advanced sections"}</h3></div><span className="admin-panel-badge"><Code2 size={12} /> JSON</span></div>
            <p className="mb-4 text-sm leading-7 text-ink-3">{ar ? "تُستخدم البطاقات للنصوص المتكررة مثل خدمات الصفحة والأسئلة الشائعة. تُستخدم الأقسام لتعديل التفاصيل المتقدمة مثل محتوى الصفحة الرئيسية، مجالات التركيز، التقنيات وإعدادات الأقسام. حافظ على صيغة JSON الصحيحة." : "Cards manage repeated items such as service cards and FAQs. Sections manage advanced content such as homepage overview, focus areas, technologies and section settings. Keep valid JSON."}</p>
            <div className="form-grid">
              <label className="wide"><span>{ar ? "البطاقات (مصفوفة JSON)" : "Cards (JSON array)"}<textarea rows={12} spellCheck={false} className="font-mono text-xs" value={cardsJson} onChange={(event) => setCardsJson(event.target.value)} /></span></label>
              <label className="wide"><span>{ar ? "الأقسام المتقدمة (كائن JSON)" : "Advanced sections (JSON object)"}<textarea rows={18} spellCheck={false} className="font-mono text-xs" value={sectionsJson} onChange={(event) => setSectionsJson(event.target.value)} /></span></label>
            </div>
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
