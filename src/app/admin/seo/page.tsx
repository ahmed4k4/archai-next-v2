"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Download, ExternalLink } from "lucide-react";
import { supabaseBrowser } from "@/lib/supabase-browser";
import { useAdminI18n } from "@/components/admin/AdminI18n";

type Row = Record<string, any>;
type Audit = {
  id: string;
  kind: "project" | "page";
  name: string;
  slug: string;
  reviewHref: string;
  issues: string[];
  score: number;
  status: string;
};

const first = (row: Row, keys: string[]): string => {
  for (const k of keys) {
    const v = row?.[k];
    if (typeof v === "string" && v.trim()) return v.trim();
  }
  return "";
};

export default function SeoAuditPage() {
  const { locale } = useAdminI18n();
  const ar = locale === "ar";
  const sb = supabaseBrowser();

  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    let live = true;
    (async () => {
      const [projectResult, pageResult, settingsResult] = await Promise.all([
        sb.from("projects").select("id,slug,status,title_en,title_ar,summary_en,summary_ar,cover_image,featured_image,hero_image"),
        sb.from("site_page_content").select("page_key,locale,title,description,seo_title,seo_description,is_published,updated_at"),
        sb.from("site_settings").select("home_title_ar,home_title_en,home_desc_ar,home_desc_en").eq("id", 1).maybeSingle(),
      ]);
      if (!live) return;
      const errors = [projectResult.error, pageResult.error, settingsResult.error].filter(Boolean);
      setError(errors.map((item) => item?.message).filter(Boolean).join(" · "));
      const settings = (settingsResult.data || {}) as Row;
      const projectRows = (projectResult.data || []).map((row) => ({ ...row, audit_kind: "project" }));
      const pageRows = (pageResult.data || []).map((row) => ({
        ...row,
        audit_kind: "page",
        home_title_ar: settings.home_title_ar,
        home_title_en: settings.home_title_en,
        home_desc_ar: settings.home_desc_ar,
        home_desc_en: settings.home_desc_en,
      }));
      setRows([...pageRows, ...projectRows]);
      setLoading(false);
    })();
    return () => { live = false; };
  }, [sb]);

  const audits = useMemo<Audit[]>(() => rows.map((r, i) => {
    const isPage = r.audit_kind === "page";
    const pageLocale = r.locale === "en" ? "en" : "ar";
    const pageKey = String(r.page_key || "");
    const title = isPage
      ? first(r, [pageKey === "home" ? `home_title_${pageLocale}` : "title", "title", "eyebrow"]) || pageKey
      : first(r, ar ? ["title_ar", "title_en", "slug"] : ["title_en", "title_ar", "slug"]) || `Project ${i + 1}`;
    const slug = isPage
      ? `${pageLocale}${pageKey === "home" ? "" : `/${pageKey}`}`
      : first(r, ["slug", "id"]) || String(i + 1);
    const issues: string[] = [];

    if (isPage) {
      const visibleTitle = first(r, [pageKey === "home" ? `home_title_${pageLocale}` : "title"]);
      const visibleDescription = first(r, [pageKey === "home" ? `home_desc_${pageLocale}` : "description"]);
      const seoTitle = first(r, ["seo_title"]);
      const seoDescription = first(r, ["seo_description"]);
      if (!visibleTitle) issues.push(ar ? "عنوان الصفحة ناقص" : "Missing page title");
      if (!visibleDescription) issues.push(ar ? "وصف الصفحة ناقص" : "Missing page description");
      if (!seoTitle) issues.push(ar ? "عنوان SEO ناقص" : "Missing SEO title");
      else if (seoTitle.length < 25 || seoTitle.length > 65) issues.push(ar ? "راجع طول عنوان SEO" : "Review SEO title length");
      if (!seoDescription) issues.push(ar ? "وصف SEO ناقص" : "Missing SEO description");
      else if (seoDescription.length < 70 || seoDescription.length > 175) issues.push(ar ? "راجع طول وصف SEO" : "Review SEO description length");
      if (r.is_published === false) issues.push(ar ? "الصفحة غير منشورة" : "Page is unpublished");
      return {
        id: `page-${pageKey}-${pageLocale}`,
        kind: "page",
        name: `${title} · ${pageLocale.toUpperCase()}`,
        slug,
        reviewHref: `/admin/content?page=${encodeURIComponent(pageKey)}&locale=${pageLocale}`,
        issues,
        score: Math.max(0, 100 - issues.length * 16),
        status: r.is_published === false ? "draft" : "published",
      };
    }

    const titleEn = first(r, ["title_en", "name_en"]);
    const titleAr = first(r, ["title_ar", "name_ar"]);
    const descEn = first(r, ["summary_en", "description_en", "short_description_en"]);
    const descAr = first(r, ["summary_ar", "description_ar"]);
    const image = first(r, ["cover_image", "image_url", "thumbnail", "hero_image"]);
    if (!titleEn) issues.push(ar ? "عنوان إنجليزي ناقص" : "Missing EN title");
    if (!titleAr) issues.push(ar ? "عنوان عربي ناقص" : "Missing AR title");
    if (!descEn) issues.push(ar ? "وصف إنجليزي ناقص" : "Missing EN summary");
    if (!descAr) issues.push(ar ? "وصف عربي ناقص" : "Missing AR summary");
    if (!image) issues.push(ar ? "صورة غلاف ناقصة" : "Missing cover image");
    const status = String(r.status || "draft");
    return {
      id: String(r.id || slug),
      kind: "project",
      name: title,
      slug,
      reviewHref: `/admin/projects?edit=${encodeURIComponent(String(r.id || slug))}`,
      issues,
      score: Math.max(0, 100 - issues.length * 20),
      status,
    };
  }), [rows, ar]);

  const shown = audits.filter(
    (a) =>
      filter === "all" ||
      (filter === "issues" && a.issues.length > 0) ||
      (filter === "ready" && a.issues.length === 0)
  );

  const totalIssues = audits.reduce((n, a) => n + a.issues.length, 0);
  const avgScore = Math.round(
    audits.reduce((n, a) => n + a.score, 0) / Math.max(1, audits.length)
  );
  const complete = audits.filter((a) => a.issues.length === 0).length;

  const exportCsv = () => {
    const data = [
      ["Type", "Page / Project", "Slug", "Score", "Status", "Issues"],
      ...shown.map((a) => [
        a.kind,
        a.name,
        a.slug,
        String(a.score),
        a.status,
        a.issues.join("; "),
      ]),
    ];
    const csv =
      "\uFEFF" +
      data
        .map((row) =>
          row.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")
        )
        .join("\r\n");
    const url = URL.createObjectURL(
      new Blob([csv], { type: "text/csv;charset=utf-8;" })
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = "archai-content-audit.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="admin-dashboard">
      <div className="admin-page-head">
        <div>
          <span className="admin-kicker">ARCHAI / CONTENT INTELLIGENCE</span>
          <h2>{ar ? "فحص جودة المحتوى وSEO" : "Content quality & SEO audit"}</h2>
          <p>
            {ar
              ? "راجع بيانات SEO لكل صفحة عربية وإنجليزية، بالإضافة إلى عناوين ووصف وصور المشروعات. الفحص لا يغيّر أي بيانات."
              : "Review SEO metadata for every Arabic/English CMS page alongside project titles, summaries and cover images. This audit never changes data."}
          </p>
        </div>
        <div className="admin-head-actions">
          <button className="admin-secondary" onClick={exportCsv}>
            <Download size={14} />
            {ar ? "تصدير CSV" : "Export CSV"}
          </button>
          <Link className="admin-primary" href="/admin/projects">
            {ar ? "إدارة المشاريع" : "Manage projects"} ↗
          </Link>
        </div>
      </div>

      {error && (
        <div className="admin-notice">
          {ar ? "تعذر قراءة بعض بيانات التدقيق: " : "Could not read some audit data: "}
          {error}
        </div>
      )}

      {/* Stat grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          {
            label: ar ? "صفحات ومشروعات" : "Pages & projects",
            value: audits.length,
            icon: "◫",
            color: "text-violet-300",
          },
          {
            label: ar ? "ملاحظات المحتوى" : "Content issues",
            value: totalIssues,
            icon: "⌁",
            color: "text-amber-400",
          },
          {
            label: ar ? "جاهز مبدئيًا" : "Content complete",
            value: complete,
            icon: "✓",
            color: "text-mint-300",
          },
          {
            label: ar ? "متوسط الاكتمال" : "Avg completeness",
            value: `${avgScore}%`,
            icon: "◌",
            color: "text-blue-300",
          },
        ].map((c, i) => (
          <motion.div
            key={c.label}
            className="admin-panel"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-ink-3">{c.label}</span>
              <span className={`text-lg ${c.color}`}>{c.icon}</span>
            </div>
            <div className="font-display text-3xl font-medium text-ink-0">
              {loading ? "—" : c.value}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Audit list */}
      <section className="admin-panel">
        <div className="admin-section-title">
          <div>
            <span className="admin-kicker">AUDIT RESULTS</span>
            <h3>{ar ? "نتائج مراجعة المحتوى" : "Content audit results"}</h3>
          </div>
          <select
            className="admin-filter-select"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">{ar ? "كل الصفحات والمشروعات" : "All records"}</option>
            <option value="issues">
              {ar ? "تحتاج مراجعة" : "Needs review"}
            </option>
            <option value="ready">
              {ar ? "مكتملة الحقول" : "Ready"}
            </option>
          </select>
        </div>

        {loading ? (
          <p className="admin-muted-note">
            {ar ? "جارٍ فحص البيانات…" : "Reviewing project data…"}
          </p>
        ) : shown.length === 0 ? (
          <div className="admin-notice">
            {ar ? "لا توجد نتائج لهذا الفلتر." : "No results for this filter."}
          </div>
        ) : (
          <div className="space-y-2">
            {shown.map((a, i) => (
              <motion.article
                key={a.id}
                className="flex items-center gap-4 p-4 rounded-xl border border-violet-500/15 bg-[var(--ad-panel-2)]"
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
              >
                <div
                  className={`w-14 h-14 grid place-items-center rounded-2xl font-bold text-lg shrink-0 ${
                    a.score >= 80
                      ? "bg-mint-500/15 text-mint-300"
                      : a.score >= 50
                      ? "bg-amber-500/15 text-amber-400"
                      : "bg-rose-500/15 text-rose-400"
                  }`}
                >
                  {a.score}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-ink-0 truncate">
                    {a.name}
                  </div>
                  <div className="text-[10px] font-mono text-ink-4 mt-0.5">
                    /{a.slug}
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {a.issues.length === 0 ? (
                      <span className="text-[10px] px-2 py-0.5 rounded bg-mint-500/10 text-mint-300 border border-mint-500/20">
                        ✓ {ar ? "الحقول مكتملة" : "Fields complete"}
                      </span>
                    ) : (
                      a.issues.map((issue) => (
                        <span
                          key={issue}
                          className="text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20"
                        >
                          ! {issue}
                        </span>
                      ))
                    )}
                  </div>
                </div>
                <Link
                  href={a.reviewHref}
                  className="admin-secondary text-xs shrink-0"
                >
                  <ExternalLink size={12} />
                  {ar ? (a.kind === "page" ? "تعديل الصفحة" : "مراجعة المشروع") : (a.kind === "page" ? "Edit page" : "Review project")}
                </Link>
              </motion.article>
            ))}
          </div>
        )}
      </section>

      <div className="admin-notice mt-4">
        {ar
          ? "الفحص يراجع اكتمال حقول المحتوى وبيانات SEO المسجلة فقط؛ لا يقيس Core Web Vitals ولا يؤكد الفهرسة الفعلية أو صلاحية الروابط الخارجية."
          : "This checks stored content and SEO metadata only; it does not measure Core Web Vitals, confirm Google indexing, or validate external links."}
      </div>
    </div>
  );
}