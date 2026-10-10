"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Save, Building2, Home, Image as ImageIcon } from "lucide-react";
import { supabaseBrowser } from "@/lib/supabase-browser";
import { useAdminI18n } from "@/components/admin/AdminI18n";

export default function Settings() {
  const { t, locale } = useAdminI18n();
  const sb = supabaseBrowser();
  const ar = locale === "ar";

  const [f, setF] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    sb.from("site_settings")
      .select("*")
      .eq("id", 1)
      .maybeSingle()
      .then(({ data, error }) => {
        setF(data || {});
        if (error) toast.error(error.message);
        setLoading(false);
      });
  }, [sb]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const toastId = toast.loading(ar ? "جارٍ الحفظ…" : "Saving…");

    const { error } = await sb
      .from("site_settings")
      .update({
        company_name: f.company_name,
        site_title: f.site_title,
        home_title_en: f.home_title_en,
        home_title_ar: f.home_title_ar,
        home_desc_en: f.home_desc_en,
        home_desc_ar: f.home_desc_ar,
        default_seo_image: f.default_seo_image,
        featured_limit: Number(f.featured_limit) || 6,
        projects_per_category: Number(f.projects_per_category) || 6,
      })
      .eq("id", 1);

    if (error) {
      toast.error(error.message, { id: toastId });
      setSaving(false);
      return;
    }

    const session = (await sb.auth.getSession()).data.session;
    await fetch("/api/revalidate", {
      method: "POST",
      headers: { Authorization: `Bearer ${session?.access_token || ""}` },
    });

    toast.success(t("lastUpdated"), { id: toastId });
    setSaving(false);
  }

  const field = (
    key: string,
    label: string,
    icon?: any,
    wide = false,
    textarea = false
  ) => {
    const Icon = icon;
    return (
      <label className={wide ? "wide" : ""} key={key}>
        <span className="flex items-center gap-2">
          {Icon && <Icon size={12} />}
          {label}
        </span>
        {textarea ? (
          <textarea
            value={f[key] || ""}
            onChange={(e) => setF({ ...f, [key]: e.target.value })}
            rows={4}
          />
        ) : (
          <input
            value={f[key] || ""}
            onChange={(e) => setF({ ...f, [key]: e.target.value })}
          />
        )}
      </label>
    );
  };

  if (loading) {
    return <div className="admin-loading">{t("loading")}</div>;
  }

  return (
    <form className="admin-dashboard" onSubmit={save}>
      <div className="admin-page-head">
        <div>
          <span className="admin-kicker">SYSTEM / BRAND SETTINGS</span>
          <h2>{t("settings")}</h2>
          <p>{t("settingsDesc")}</p>
        </div>
      </div>

      {/* ============================================================
          BRAND
          ============================================================ */}
      <motion.section
        className="admin-panel"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="admin-section-title">
          <div>
            <span className="admin-kicker">01 / BRAND</span>
            <h3>{ar ? "هوية الموقع" : "Website identity"}</h3>
          </div>
        </div>
        <div className="form-grid">
          {field("company_name", t("companyName"), Building2)}
          {field("site_title", t("siteTitle"))}
        </div>
      </motion.section>

      {/* ============================================================
          HOMEPAGE
          ============================================================ */}
      <motion.section
        className="admin-panel"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <div className="admin-section-title">
          <div>
            <span className="admin-kicker">02 / HOMEPAGE</span>
            <h3>{ar ? "محتوى الصفحة الرئيسية" : "Homepage content"}</h3>
          </div>
        </div>
        <div className="form-grid">
          {field("home_title_ar", t("homeTitleAr"), Home)}
          {field("home_title_en", t("homeTitleEn"), Home)}
          {field("home_desc_ar", t("homeDescAr"), null, true, true)}
          {field("home_desc_en", t("homeDescEn"), null, true, true)}
        </div>
      </motion.section>

      {/* ============================================================
          MEDIA & LIMITS
          ============================================================ */}
      <motion.section
        className="admin-panel"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <div className="admin-section-title">
          <div>
            <span className="admin-kicker">03 / MEDIA & LIMITS</span>
            <h3>{ar ? "الصور والحدود" : "Media & limits"}</h3>
          </div>
        </div>
        <div className="form-grid">
          {field("default_seo_image", ar ? "صورة SEO الافتراضية" : "Default SEO image", ImageIcon, true)}
          <label>
            {ar ? "عدد المشاريع المميزة" : "Featured projects limit"}
            <input
              type="number"
              min="1"
              max="24"
              value={f.featured_limit ?? 6}
              onChange={(e) => setF({ ...f, featured_limit: e.target.value })}
            />
          </label>
          <label>
            {ar ? "مشاريع لكل قسم" : "Projects per category"}
            <input
              type="number"
              min="1"
              max="50"
              value={f.projects_per_category ?? 6}
              onChange={(e) =>
                setF({ ...f, projects_per_category: e.target.value })
              }
            />
          </label>
        </div>
      </motion.section>

      <div className="form-actions">
        <button className="admin-primary" disabled={saving}>
          <Save size={14} />
          {saving
            ? ar
              ? "جارٍ الحفظ…"
              : "Saving…"
            : t("saveSettings")}
        </button>
      </div>
    </form>
  );
}