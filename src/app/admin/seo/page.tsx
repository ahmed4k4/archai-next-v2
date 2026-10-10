"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Download, ExternalLink, Search } from "lucide-react";
import { supabaseBrowser } from "@/lib/supabase-browser";
import { useAdminI18n } from "@/components/admin/AdminI18n";

type Row = Record<string, any>;
type Audit = {
  id: string;
  name: string;
  slug: string;
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
      const { data, error } = await sb.from("projects").select("*");
      if (!live) return;
      if (error) {
        setError(error.message);
        setRows([]);
      } else setRows(data || []);
      setLoading(false);
    })();
    return () => {
      live = false;
    };
  }, [sb]);

  const audits = useMemo<Audit[]>(
    () =>
      rows.map((r, i) => {
        const name =
          first(r, ["title_en", "name_en", "title", "name", "slug"]) ||
          `Project ${i + 1}`;
        const slug = first(r, ["slug", "id"]) || String(i + 1);
        const issues: string[] = [];

        const titleEn = first(r, ["title_en", "name_en"]);
        const titleAr = first(r, ["title_ar", "name_ar"]);
        const descEn = first(r, [
          "summary_en",
          "description_en",
          "short_description_en",
        ]);
        const descAr = first(r, ["summary_ar", "description_ar"]);
        const image = first(r, [
          "cover_image",
          "image_url",
          "thumbnail",
          "hero_image",
        ]);

        if (!titleEn) issues.push(ar ? "عنوان إنجليزي ناقص" : "Missing EN title");
        if (!titleAr) issues.push(ar ? "عنوان عربي ناقص" : "Missing AR title");
        if (!descEn) issues.push(ar ? "وصف إنجليزي ناقص" : "Missing EN summary");
        if (!descAr) issues.push(ar ? "وصف عربي ناقص" : "Missing AR summary");
        if (!image) issues.push(ar ? "صورة غلاف ناقصة" : "Missing cover image");

        const status = String(r.status || (r.published ? "published" : "draft"));

        return {
          id: String(r.id || slug),
          name,
          slug,
          issues,
          score: Math.max(0, 100 - issues.length * 20),
          status,
        };
      }),
    [rows, ar]
  );

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
      ["Project", "Slug", "Score", "Status", "Issues"],
      ...shown.map((a) => [
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
              ? "مراجعة سريعة لاكتمال بيانات المشاريع قبل نشرها. الفحص لا يغيّر أي بيانات."
              : "A safe review of project content completeness before publishing. This audit never changes your data."}
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
          {ar ? "تعذر قراءة جدول المشاريع: " : "Could not read projects table: "}
          {error}
        </div>
      )}

      {/* Stat grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          {
            label: ar ? "مشاريع تمت مراجعتها" : "Projects reviewed",
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
            <option value="all">{ar ? "كل المشاريع" : "All projects"}</option>
            <option value="issues">
              {ar ? "تحتاج مراجعة" : "Needs review"}
            </option>
            <option value="ready">
              {ar ? "مكتملة الحقول" : "Complete fields"}
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
                  href={`/admin/projects/${a.id}/media`}
                  className="admin-secondary text-xs shrink-0"
                >
                  <ExternalLink size={12} />
                  {ar ? "مراجعة" : "Review"}
                </Link>
              </motion.article>
            ))}
          </div>
        )}
      </section>

      <div className="admin-notice mt-4">
        {ar
          ? "ملاحظة: يعتمد الفحص على أسماء الحقول المتاحة في سجل المشروع. لا يتحقق من سرعة الصفحة أو فهرسة Google أو صحة الروابط الخارجية."
          : "Note: this audit checks available project fields only. It does not test page speed, Google indexing or external link validity."}
      </div>
    </div>
  );
}