"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Plus, X } from "lucide-react";
import { supabaseBrowser } from "@/lib/supabase-browser";
import { useAdminI18n } from "@/components/admin/AdminI18n";

type C = {
  id: string;
  slug: string;
  name_ar: string;
  name_en: string;
  description_ar: string | null;
  description_en: string | null;
  sort_order: number;
  active: boolean;
};

const empty = {
  slug: "",
  name_ar: "",
  name_en: "",
  description_ar: "",
  description_en: "",
  sort_order: 0,
  active: true,
};

export default function CategoriesAdmin() {
  const { t, locale } = useAdminI18n();
  const sb = supabaseBrowser();
  const ar = locale === "ar";

  const [items, setItems] = useState<C[]>([]);
  const [form, setForm] = useState<any>(empty);
  const [edit, setEdit] = useState<string | null>(null);
  const [show, setShow] = useState(false);
  const [msg, setMsg] = useState("");

  async function refreshPublic() {
    try {
      const session = (await sb.auth.getSession()).data.session;
      const response = await fetch("/api/revalidate", {
        method: "POST",
        headers: { Authorization: `Bearer ${session?.access_token || ""}` },
      });
      if (!response.ok) setMsg(ar ? "تم حفظ القسم، لكن لم يتم تحديث الكاش تلقائيًا." : "Category saved, but automatic cache revalidation failed.");
    } catch {
      setMsg(ar ? "تم حفظ القسم، لكن لم يتم تحديث الكاش تلقائيًا." : "Category saved, but automatic cache revalidation failed.");
    }
  }

  async function load() {
    try {
      const { data, error } = await sb
        .from("categories")
        .select("*")
        .order("sort_order");
      if (error) {
        setMsg(error.message);
        return;
      }
      setItems(data || []);
    } catch (error) {
      setMsg(error instanceof Error ? error.message : (ar ? "تعذر تحميل الأقسام." : "Could not load categories."));
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    try {
      const payload = { ...form, sort_order: Number(form.sort_order) || 0 };
      const r = edit
        ? await sb.from("categories").update(payload).eq("id", edit)
        : await sb.from("categories").insert(payload);
      if (r.error) {
        setMsg(r.error.message);
        return;
      }
      setMsg(ar ? "تم الحفظ." : "Saved.");
      setShow(false);
      setEdit(null);
      setForm(empty);
      await refreshPublic();
      await load();
    } catch (error) {
      setMsg(error instanceof Error ? error.message : (ar ? "تعذر حفظ القسم." : "Could not save category."));
    }
  }

  async function del(id: string) {
    if (!confirm(ar ? "حذف القسم؟" : "Delete this category?")) return;
    try {
      const r = await sb.from("categories").delete().eq("id", id);
      if (r.error) setMsg(r.error.message);
      else {
        setMsg(ar ? "تم حذف القسم." : "Category deleted.");
        await refreshPublic();
        await load();
      }
    } catch (error) {
      setMsg(error instanceof Error ? error.message : (ar ? "تعذر حذف القسم." : "Could not delete category."));
    }
  }

  return (
    <div className="admin-dashboard">
      <div className="admin-page-head">
        <div>
          <span className="admin-kicker">CONTENT / CATEGORIES</span>
          <h2>{t("categories")}</h2>
          <p>{t("categoryDesc")}</p>
        </div>
        <button
          className="admin-primary"
          onClick={() => {
            setEdit(null);
            setForm(empty);
            setShow(true);
          }}
        >
          <Plus size={14} />
          {ar ? "قسم جديد" : "New category"}
        </button>
      </div>

      {msg && <div className="admin-success">{msg}</div>}

      {show && (
        <motion.form
          className="admin-panel project-form"
          onSubmit={save}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="form-head">
            <h3>
              {edit
                ? ar
                  ? "تعديل القسم"
                  : "Edit category"
                : ar
                ? "قسم جديد"
                : "New category"}
            </h3>
            <button
              type="button"
              className="admin-ghost"
              onClick={() => setShow(false)}
            >
              <X size={14} />
              {t("close")}
            </button>
          </div>

          <div className="form-grid">
            <label>
              {ar ? "الاسم عربي" : "Name in Arabic"}
              <input
                required
                value={form.name_ar}
                onChange={(e) => setForm({ ...form, name_ar: e.target.value })}
              />
            </label>
            <label>
              {ar ? "الاسم بالإنجليزية" : "Name in English"}
              <input
                required
                value={form.name_en}
                onChange={(e) => setForm({ ...form, name_en: e.target.value })}
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
              {t("order")}
              <input
                type="number"
                value={form.sort_order}
                onChange={(e) => setForm({ ...form, sort_order: e.target.value })}
              />
            </label>
            <label className="wide">
              {ar ? "وصف عربي" : "Description in Arabic"}
              <textarea
                value={form.description_ar || ""}
                onChange={(e) =>
                  setForm({ ...form, description_ar: e.target.value })
                }
              />
            </label>
            <label className="wide">
              {ar ? "وصف بالإنجليزية" : "Description in English"}
              <textarea
                value={form.description_en || ""}
                onChange={(e) =>
                  setForm({ ...form, description_en: e.target.value })
                }
              />
            </label>
            <label className="check">
              <input
                type="checkbox"
                checked={form.active}
                onChange={(e) => setForm({ ...form, active: e.target.checked })}
              />
              {t("active")}
            </label>
          </div>

          <button className="admin-primary">{t("save")}</button>
        </motion.form>
      )}

      <div className="admin-panel">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>{t("category")}</th>
                <th>Slug</th>
                <th>{t("status")}</th>
                <th>{t("order")}</th>
                <th>{t("actions")}</th>
              </tr>
            </thead>
            <tbody>
              {items.map((c) => (
                <tr key={c.id}>
                  <td>
                    <strong>{c.name_ar}</strong>
                    <small>{c.name_en}</small>
                  </td>
                  <td>{c.slug}</td>
                  <td>
                    <span
                      className={`status ${c.active ? "published" : "draft"}`}
                    >
                      {c.active ? t("active") : t("inactive")}
                    </span>
                  </td>
                  <td>{c.sort_order}</td>
                  <td className="actions">
                    <button
                      onClick={() => {
                        setEdit(c.id);
                        setForm(c);
                        setShow(true);
                      }}
                    >
                      {t("edit")}
                    </button>
                    <button className="danger" onClick={() => del(c.id)}>
                      {t("delete")}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}