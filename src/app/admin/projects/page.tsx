"use client";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { supabaseBrowser } from "../../../lib/supabase-browser";
import { useAdminI18n } from "../../../components/admin/AdminI18n";
type Category = { id: string; name_ar: string; name_en: string };
type Project = {
  id: string;
  slug: string;
  category_id: string | null;
  status: string;
  sort_order: number;
  title_ar: string;
  title_en: string;
  summary_ar: string;
  summary_en: string;
  description_ar: string | null;
  description_en: string | null;
  live_url: string | null;
  cover_image: string | null;
  featured: boolean;
  featured_sort_order: number;
  project_technologies: { technology: string }[];
  project_industries: { industry: string }[];
};
const blank = {
  slug: "",
  category_id: "",
  status: "draft",
  sort_order: 0,
  title_ar: "",
  title_en: "",
  summary_ar: "",
  summary_en: "",
  description_ar: "",
  description_en: "",
  live_url: "",
  cover_image: "",
  featured: false,
  featured_sort_order: 0,
  technologies: "",
  industries: "",
};
export default function ProjectsAdmin() {
  const { t, locale } = useAdminI18n();
  const sb = supabaseBrowser();
  const qs = useSearchParams();
  const [items, setItems] = useState<Project[]>([]);
  const [cats, setCats] = useState<Category[]>([]);
  const [form, setForm] = useState<any>(blank);
  const [editing, setEditing] = useState<string | null>(null);
  const [show, setShow] = useState(qs.get("new") === "1");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [featuredOnly, setFeaturedOnly] = useState(false);
  const [loading, setLoading] = useState(true);
  const handledEditQuery = useRef<string | null>(null);
  async function load() {
    setLoading(true);
    try {
      const [{ data: p, error: pe }, { data: c, error: ce }] = await Promise.all([
        sb.from("projects")
          .select("*,project_technologies(technology),project_industries(industry)")
          .order("sort_order")
          .order("created_at", { ascending: false }),
        sb.from("categories").select("id,name_ar,name_en").order("sort_order"),
      ]);
      if (pe || ce) setMsg((pe || ce)?.message || t("errorLoad"));
      setItems((p || []) as Project[]);
      setCats((c || []) as Category[]);
    } catch (error) {
      setMsg(error instanceof Error ? error.message : t("errorLoad"));
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    load();
  }, []);
  const catName = useMemo(
    () =>
      Object.fromEntries(
        cats.map((c) => [
          c.id,
          locale === "ar" ? c.name_ar || c.name_en : c.name_en || c.name_ar,
        ]),
      ),
    [cats, locale],
  );
  const filtered = useMemo(
    () =>
      items.filter((p) => {
        const q = query.toLowerCase().trim();
        const text = [
          p.title_ar,
          p.title_en,
          p.slug,
          p.live_url || "",
          p.summary_ar,
          p.summary_en,
        ]
          .join(" ")
          .toLowerCase();
        return (
          (!q || text.includes(q)) &&
          (statusFilter === "all" || p.status === statusFilter) &&
          (!featuredOnly || p.featured)
        );
      }),
    [items, query, statusFilter, featuredOnly],
  );
  function edit(p: Project) {
    setEditing(p.id);
    setForm({
      ...p,
      technologies: (p.project_technologies || [])
        .map((x) => x.technology)
        .join(", "),
      industries: (p.project_industries || [])
        .map((x) => x.industry)
        .join(", "),
    });
    setShow(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  useEffect(() => {
    const requestedId = qs.get("edit");
    if (!requestedId || loading || handledEditQuery.current === requestedId) return;
    const requestedProject = items.find((project) => project.id === requestedId || project.slug === requestedId);
    if (!requestedProject) return;
    handledEditQuery.current = requestedId;
    setEditing(requestedProject.id);
    setForm({
      ...requestedProject,
      technologies: (requestedProject.project_technologies || []).map((item) => item.technology).join(", "),
      industries: (requestedProject.project_industries || []).map((item) => item.industry).join(", "),
    });
    setShow(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [qs, loading, items]);
  function fresh() {
    setEditing(null);
    setForm({ ...blank });
    setShow(true);
  }
  function duplicate(p: Project) {
    setEditing(null);
    setForm({
      ...p,
      id: undefined,
      slug: `${p.slug}${t("duplicateSuffix")}`,
      status: "draft",
      title_ar: `${p.title_ar} (نسخة)`,
      title_en: `${p.title_en} (Copy)`,
      featured: false,
      project_technologies: undefined,
      project_industries: undefined,
      technologies: (p.project_technologies || [])
        .map((x) => x.technology)
        .join(", "),
      industries: (p.project_industries || [])
        .map((x) => x.industry)
        .join(", "),
    });
    setMsg(t("projectCopied"));
    setShow(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  async function revalidate() {
    const session = (await sb.auth.getSession()).data.session;
    return fetch("/api/revalidate", {
      method: "POST",
      headers: { Authorization: `Bearer ${session?.access_token || ""}` },
    });
  }
  async function save(e: any) {
    e.preventDefault();
    setBusy(true);
    setMsg("");
    try {
    const payload = {
      slug: form.slug.trim(),
      category_id: form.category_id || null,
      status: form.status,
      sort_order: Number(form.sort_order) || 0,
      title_ar: form.title_ar,
      title_en: form.title_en,
      summary_ar: form.summary_ar,
      summary_en: form.summary_en,
      description_ar: form.description_ar || null,
      description_en: form.description_en || null,
      live_url: form.live_url || null,
      cover_image: form.cover_image || null,
      featured: Boolean(form.featured),
      featured_sort_order: Number(form.featured_sort_order) || 0,
    };
    const r = editing
      ? await sb
          .from("projects")
          .update(payload)
          .eq("id", editing)
          .select("id")
          .single()
      : await sb.from("projects").insert(payload).select("id").single();
    if (r.error) {
      setMsg(r.error.message);
      setBusy(false);
      return;
    }
    const id = editing || r.data.id;
    const tech = form.technologies
      .split(",")
      .map((x: string) => x.trim())
      .filter(Boolean)
      .map((technology: string) => ({ project_id: id, technology }));
    const ind = form.industries
      .split(",")
      .map((x: string) => x.trim())
      .filter(Boolean)
      .map((industry: string) => ({ project_id: id, industry }));
    const cleanup = await Promise.all([
      sb.from("project_technologies").delete().eq("project_id", id),
      sb.from("project_industries").delete().eq("project_id", id),
    ]);
    const cleanupError = cleanup.find((x) => x.error)?.error;
    if (cleanupError) {
      setMsg(`Project saved, but related data failed: ${cleanupError.message}`);
      setBusy(false);
      await load();
      return;
    }
    const childWrites = await Promise.all([
      tech.length
        ? sb.from("project_technologies").insert(tech)
        : Promise.resolve({ error: null }),
      ind.length
        ? sb.from("project_industries").insert(ind)
        : Promise.resolve({ error: null }),
    ]);
    const childError = childWrites.find((x) => x.error)?.error;
    if (childError) {
      setMsg(`Project saved, but related data failed: ${childError.message}`);
      setBusy(false);
      await load();
      return;
    }
    const cache = await revalidate();
    setMsg(
      cache.ok
        ? locale === "ar"
          ? "تم حفظ المشروع وتحديث الموقع."
          : "Project saved and website refreshed."
        : locale === "ar"
          ? "تم الحفظ، لكن تعذر تحديث الكاش تلقائيًا."
          : "Saved, but automatic cache refresh failed.",
    );
    setBusy(false);
    setShow(false);
    setEditing(null);
    await load();
    } catch (error) {
      setMsg(error instanceof Error ? error.message : (locale === "ar" ? "تعذر حفظ المشروع." : "Could not save project."));
    } finally {
      setBusy(false);
    }
  }
  async function remove(id: string) {
    if (!confirm(t("confirmDelete"))) return;
    try {
      const { error } = await sb.from("projects").delete().eq("id", id);
      if (error) {
        setMsg(error.message);
        return;
      }
      await revalidate();
      setMsg(locale === "ar" ? "تم حذف المشروع." : "Project deleted.");
      await load();
    } catch (error) {
      setMsg(error instanceof Error ? error.message : (locale === "ar" ? "تعذر حذف المشروع." : "Could not delete project."));
    }
  }
  async function toggle(p: Project) {
    const next = p.status === "published" ? "draft" : "published";
    try {
      const { error } = await sb.from("projects").update({ status: next }).eq("id", p.id);
      if (error) setMsg(error.message);
      else {
        await revalidate();
        setMsg(locale === "ar" ? "تم تحديث حالة النشر." : "Publishing status updated.");
        await load();
      }
    } catch (error) {
      setMsg(error instanceof Error ? error.message : (locale === "ar" ? "تعذر تحديث حالة النشر." : "Could not update publishing status."));
    }
  }
  function exportCsv() {
    const headers = [
      "title_ar",
      "title_en",
      "slug",
      "status",
      "category",
      "featured",
      "live_url",
      "summary_ar",
      "summary_en",
    ];
    const rows = filtered.map((p) => [
      p.title_ar,
      p.title_en,
      p.slug,
      p.status,
      catName[p.category_id || ""] || "",
      p.featured,
      p.live_url || "",
      p.summary_ar,
      p.summary_en,
    ]);
    const csv = [headers, ...rows]
      .map((row) =>
        row.map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`).join(","),
      )
      .join("\r\n");
    const blob = new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "archai-projects.csv";
    a.click();
    URL.revokeObjectURL(url);
  }
  return (
    <>
      <div className="admin-page-head">
        <div>
          <span className="admin-kicker">CONTENT / PROJECTS</span>
          <h2>{t("projects")}</h2>
          <p>{t("projectDesc")}</p>
        </div>
        <div className="admin-head-actions">
          <button className="admin-secondary" onClick={exportCsv}>
            ↓ {t("export")}
          </button>
          <button className="admin-primary" onClick={fresh}>
            ＋ {t("newProject")}
          </button>
        </div>
      </div>
      {msg && <div className="admin-notice">{msg}</div>}
      {show && (
        <form className="admin-panel project-form" onSubmit={save}>
          <div className="form-head">
            <div>
              <span className="admin-kicker">
                {editing ? "EDIT PROJECT" : "PROJECT EDITOR"}
              </span>
              <h3>
                {editing
                  ? locale === "ar"
                    ? "تعديل المشروع"
                    : "Edit project"
                  : locale === "ar"
                    ? "إضافة مشروع"
                    : "Add project"}
              </h3>
            </div>
            <button
              type="button"
              className="admin-ghost"
              onClick={() => setShow(false)}
            >
              {t("close")} ×
            </button>
          </div>
          <div className="form-grid">
            <label>
              {locale === "ar" ? "العنوان بالعربية" : "Title in Arabic"}
              <input
                required
                value={form.title_ar}
                onChange={(e) => setForm({ ...form, title_ar: e.target.value })}
              />
            </label>
            <label>
              {locale === "ar" ? "العنوان بالإنجليزية" : "Title in English"}
              <input
                required
                value={form.title_en}
                onChange={(e) => setForm({ ...form, title_en: e.target.value })}
              />
            </label>
            <label>
              Slug
              <input
                required
                pattern="[a-z0-9]+(-[a-z0-9]+)*"
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
              />
            </label>
            <label>
              {t("category")}
              <select
                value={form.category_id}
                onChange={(e) =>
                  setForm({ ...form, category_id: e.target.value })
                }
              >
                <option value="">—</option>
                {cats.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name_ar} / {c.name_en}
                  </option>
                ))}
              </select>
            </label>
            <label>
              {t("status")}
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </label>
            <label>
              {t("order")}
              <input
                type="number"
                value={form.sort_order}
                onChange={(e) =>
                  setForm({ ...form, sort_order: e.target.value })
                }
              />
            </label>
            <label className="wide">
              ملخص عربي
              <textarea
                required
                value={form.summary_ar}
                onChange={(e) =>
                  setForm({ ...form, summary_ar: e.target.value })
                }
              />
            </label>
            <label className="wide">
              Summary English
              <textarea
                required
                value={form.summary_en}
                onChange={(e) =>
                  setForm({ ...form, summary_en: e.target.value })
                }
              />
            </label>
            <label className="wide">
              الوصف عربي
              <textarea
                value={form.description_ar}
                onChange={(e) =>
                  setForm({ ...form, description_ar: e.target.value })
                }
              />
            </label>
            <label className="wide">
              Description English
              <textarea
                value={form.description_en}
                onChange={(e) =>
                  setForm({ ...form, description_en: e.target.value })
                }
              />
            </label>
            <label>
              {locale === "ar" ? "رابط المشروع" : "Live project URL"}
              <input
                type="url"
                value={form.live_url}
                onChange={(e) => setForm({ ...form, live_url: e.target.value })}
              />
            </label>
            <label>
              {locale === "ar" ? "رابط صورة الغلاف" : "Cover image URL"}
              <input
                type="url"
                value={form.cover_image}
                onChange={(e) =>
                  setForm({ ...form, cover_image: e.target.value })
                }
              />
            </label>
            <label className="wide">
              {locale === "ar" ? "التقنيات" : "Technologies"}
              <input
                placeholder="Next.js, Supabase, Tailwind"
                value={form.technologies}
                onChange={(e) =>
                  setForm({ ...form, technologies: e.target.value })
                }
              />
            </label>
            <label className="wide">
              {locale === "ar" ? "مجالات الاستخدام" : "Industries"}
              <input
                placeholder="SaaS, E-commerce"
                value={form.industries}
                onChange={(e) =>
                  setForm({ ...form, industries: e.target.value })
                }
              />
            </label>
            <label className="check">
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(e) =>
                  setForm({ ...form, featured: e.target.checked })
                }
              />{" "}
              {locale === "ar" ? "مشروع مميز" : "Featured project"}
            </label>
          </div>
          <div className="form-actions">
            <button className="admin-primary" disabled={busy}>
              {busy ? (locale === "ar" ? "جاري الحفظ…" : "Saving…") : t("save")}
            </button>
            <button
              type="button"
              className="admin-ghost"
              onClick={() => setShow(false)}
            >
              {t("cancel")}
            </button>
          </div>
        </form>
      )}
      <div className="admin-panel project-list-panel">
        <div className="project-toolbar">
          <label className="admin-search">
            <span>⌕</span>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("search")}
            />
            <kbd>⌘ K</kbd>
          </label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            aria-label={t("status")}
          >
            <option value="all">{t("allStatuses")}</option>
            <option value="published">{t("published")}</option>
            <option value="draft">{t("draft")}</option>
            <option value="archived">{t("archived")}</option>
          </select>
          <label className="featured-filter">
            <input
              type="checkbox"
              checked={featuredOnly}
              onChange={(e) => setFeaturedOnly(e.target.checked)}
            />
            {t("featuredProjects")}
          </label>
          <span className="result-count">
            {filtered.length} / {items.length}
          </span>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>{t("project")}</th>
                <th>{t("category")}</th>
                <th>{t("status")}</th>
                <th>{t("link")}</th>
                <th>{t("actions")}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id}>
                  <td>
                    <div className="project-cell">
                      <span className="project-cell-icon">
                        {p.featured ? "✦" : "◫"}
                      </span>
                      <div>
                        <strong>
                          {locale === "ar"
                            ? p.title_ar || p.title_en
                            : p.title_en || p.title_ar}
                        </strong>
                        <small>
                          {p.title_en} · {p.slug}
                        </small>
                      </div>
                    </div>
                  </td>
                  <td>{p.category_id ? catName[p.category_id] : "—"}</td>
                  <td>
                    <span className={`status ${p.status}`}>{p.status}</span>
                    {p.featured && <span className="featured-pill">✦</span>}
                  </td>
                  <td>
                    {p.live_url ? (
                      <a href={p.live_url} target="_blank" rel="noreferrer">
                        {t("open")} ↗
                      </a>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="actions">
                    <Link
                      href={`/admin/projects/${p.id}/media`}
                      className="px-2 py-1 rounded-md border border-violet-500/30 bg-violet-500/10 text-violet-300 hover:bg-violet-500/20 transition-colors text-[10px] font-mono"
                      title={locale === "ar" ? "إدارة الصور" : "Manage images"}
                    >
                      📷 {locale === "ar" ? "صور" : "Media"}
                    </Link>
                    <button onClick={() => edit(p)}>{t("edit")}</button>
                    <button onClick={() => duplicate(p)} title={t("duplicate")}>
                      ⧉
                    </button>
                    <button onClick={() => toggle(p)}>
                      {p.status === "published" ? t("hide") : t("publish")}
                    </button>
                    <button className="danger" onClick={() => remove(p.id)}>
                      {t("delete")}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {loading ? (
            <div className="empty">{t("loading")}</div>
          ) : !filtered.length ? (
            <div className="empty">
              {items.length ? t("noResults") : t("noProjects")}
            </div>
          ) : null}
        </div>
      </div>
    </>
  );
}
