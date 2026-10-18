"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import ProjectCard from "./ProjectCard";
import { pick, tr } from "@/lib/i18n";
import type { Locale } from "@/lib/types";

const technologiesOf = (project: any): any[] =>
  Array.isArray(project?.project_technologies) ? project.project_technologies : [];
const industriesOf = (project: any): any[] =>
  Array.isArray(project?.project_industries) ? project.project_industries : [];

type ExplorerProps = {
  cats: any[];
  projects: any[];
  lang: Locale;
  fixedCat?: boolean;
  limit?: number;
};

export default function Explorer({
  cats,
  projects,
  lang,
  fixedCat = false,
  limit = 6,
}: ExplorerProps) {
  const T = tr(lang);
  const ar = lang === "ar";
  const [q, setQ] = useState("");
  const [cf, setCf] = useState("");
  const [tf, setTf] = useState("");
  const safeProjects = Array.isArray(projects) ? projects : [];
  const safeCategories = Array.isArray(cats) ? cats : [];

  // Normalize relational fields at the presentation boundary as well as in the data layer.
  // A partially migrated Supabase schema must never take down the public portfolio.
  const techs = useMemo(
    () => [...new Set(safeProjects.flatMap((p) => technologiesOf(p).map((x: any) => x?.technology).filter(Boolean)))].sort(),
    [safeProjects]
  );

  const list = useMemo(() => {
    const s = q.toLowerCase().trim();
    return safeProjects.filter(
      (p) =>
        (!cf || String(p.category_id ?? "") === String(cf)) &&
        (!tf || technologiesOf(p).some((x: any) => x?.technology === tf)) &&
        (!s ||
          [
            p.title_en,
            p.title_ar,
            p.summary_en,
            p.summary_ar,
            p.categories?.name_en,
            p.categories?.name_ar,
            ...technologiesOf(p).map((x: any) => x?.technology),
            ...industriesOf(p).map((x: any) => x?.industry),
          ].filter(Boolean)
            .join(" ")
            .toLowerCase()
            .includes(s))
    );
  }, [safeProjects, q, cf, tf]);

  const filtering = Boolean(q || cf || tf);

  const grid = (arr: any[]) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {arr.map((p, index) => (
        <ProjectCard key={String(p.id || p.slug || `project-${index}`)} p={p} lang={lang} index={index} />
      ))}
    </div>
  );

  return (
    <>
      {/* Filter bar */}
      <div
        className="explorer-filterbar sticky top-20 z-30 mb-8 p-3 sm:p-4 rounded-2xl glass flex flex-col sm:flex-row gap-2 sm:gap-3 items-stretch sm:items-center"
        id="list"
      >
        <label className="explorer-search w-full min-w-0 sm:flex-1 sm:min-w-[200px] flex items-center gap-2 px-3 py-3 sm:py-2 rounded-xl">
          <Search size={16} className="text-ink-4 shrink-0" />
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={T("search")}
            aria-label={T("search")}
            className="explorer-search-input flex-1 min-w-0 bg-transparent border-0 outline-0 text-ink-0 placeholder:text-ink-4 text-sm"
          />
        </label>

        {!fixedCat && (
          <select
            value={cf}
            onChange={(e) => setCf(e.target.value)}
            aria-label={T("cat")}
            className="explorer-select w-full sm:w-auto min-w-0 max-w-full px-3 py-3 sm:py-2 rounded-xl text-ink-1 text-sm outline-none"
          >
            <option value="">{T("all")}</option>
            {safeCategories.map((c) => (
              <option key={c.id} value={c.id}>
                {pick(c, "name", lang)}
              </option>
            ))}
          </select>
        )}

        <select
          value={tf}
          onChange={(e) => setTf(e.target.value)}
          aria-label={T("allT")}
          className="explorer-select w-full sm:w-auto min-w-0 max-w-full px-3 py-3 sm:py-2 rounded-xl text-ink-1 text-sm outline-none"
        >
          <option value="">{T("allT")}</option>
          {techs.map((x) => (
            <option key={x}>{x}</option>
          ))}
        </select>

        {filtering && (
          <button
            onClick={() => {
              setQ("");
              setCf("");
              setTf("");
            }}
            className="explorer-clear min-h-11 px-3 py-2 rounded-xl text-xs transition-colors"
          >
            {ar ? "مسح" : "Clear"} ×
          </button>
        )}

        <span aria-live="polite" className="self-end sm:self-auto text-[10px] font-mono text-ink-4 sm:ml-auto">
          {list.length} / {safeProjects.length}
        </span>
      </div>

      {/* Grid */}
      {!list.length ? (
        <div className="p-16 text-center rounded-3xl border border-dashed border-violet-500/20 text-ink-3">
          {T("none")}
        </div>
      ) : fixedCat ? (
        grid(list)
      ) : (
        <>
          {safeCategories.map((c) => {
            const all = list.filter((p) => String(p.category_id ?? "") === String(c.id));
            if (!all.length) return null;
            const shown = filtering ? all : all.slice(0, limit);
            return (
              <div key={c.id} className="mb-16">
                <h2 className="explorer-category-heading flex items-baseline justify-between gap-4 mb-6 flex-wrap">
                  <Link
                    href={`/${lang}/categories/${c.slug}`}
                    prefetch={true}
                    className="font-display text-3xl font-medium text-ink-0 hover:text-violet-300 transition-colors flex items-center gap-3"
                  >
                    {c.icon && (
                      <span className="w-10 h-10 grid place-items-center rounded-xl bg-violet-500/10 border border-violet-500/30 text-lg">
                        {c.icon}
                      </span>
                    )}
                    {pick(c, "name", lang)}
                  </Link>
                  <Link
                    href={`/${lang}/categories/${c.slug}`}
                    prefetch={true}
                    className="text-sm text-mint-300 hover:underline flex items-center gap-1"
                  >
                    {T("viewAll")} ({all.length}) ↗
                  </Link>
                </h2>
                {grid(shown)}
              </div>
            );
          })}

          {list.some((project) => !safeCategories.some((category) => String(category.id) === String(project.category_id ?? ""))) && (
            <>
              <h2 className="font-display text-3xl font-medium text-ink-0 mb-6">
                {T("other")}
              </h2>
              {grid(list.filter((project) => !safeCategories.some((category) => String(category.id) === String(project.category_id ?? ""))))}
            </>
          )}
        </>
      )}
    </>
  );
}