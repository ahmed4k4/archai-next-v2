"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import ProjectCard from "./ProjectCard";
import { pick, tr } from "@/lib/i18n";
import type { Locale } from "@/lib/types";

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

  const techs = useMemo(
    () =>
      [...new Set(projects.flatMap((p) => p.project_technologies.map((x: any) => x.technology)))].sort(),
    [projects]
  );

  const list = useMemo(() => {
    const s = q.toLowerCase().trim();
    return projects.filter(
      (p) =>
        (!cf || p.category_id === cf) &&
        (!tf || p.project_technologies.some((x: any) => x.technology === tf)) &&
        (!s ||
          [
            p.title_en,
            p.title_ar,
            p.summary_en,
            p.summary_ar,
            p.categories?.name_en,
            p.categories?.name_ar,
            ...p.project_technologies.map((x: any) => x.technology),
            ...p.project_industries.map((x: any) => x.industry),
          ]
            .join(" ")
            .toLowerCase()
            .includes(s))
    );
  }, [projects, q, cf, tf]);

  const filtering = Boolean(q || cf || tf);

  const grid = (arr: any[]) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {arr.map((p) => (
        <ProjectCard key={p.id} p={p} lang={lang} />
      ))}
    </div>
  );

  return (
    <>
      {/* Filter bar */}
      <motion.div
        className="sticky top-20 z-30 mb-8 p-3 rounded-2xl glass flex flex-wrap gap-2 items-center"
        initial={{ opacity: 0, y: -10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        id="list"
      >
        <label className="flex-1 min-w-[200px] flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.03] border border-violet-500/20 focus-within:border-violet-500/50 transition-colors">
          <Search size={16} className="text-ink-4 shrink-0" />
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={T("search")}
            aria-label={T("search")}
            className="flex-1 bg-transparent border-0 outline-0 text-ink-0 placeholder:text-ink-4 text-sm"
          />
        </label>

        {!fixedCat && (
          <select
            value={cf}
            onChange={(e) => setCf(e.target.value)}
            aria-label={T("cat")}
            className="px-3 py-2 rounded-xl bg-white/[0.03] border border-violet-500/20 text-ink-1 text-sm focus:border-violet-500/50 outline-none"
          >
            <option value="">{T("all")}</option>
            {cats.map((c) => (
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
          className="px-3 py-2 rounded-xl bg-white/[0.03] border border-violet-500/20 text-ink-1 text-sm focus:border-violet-500/50 outline-none"
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
            className="px-3 py-2 rounded-xl text-xs text-ink-3 hover:text-ink-0 border border-violet-500/20 hover:border-violet-500/50 transition-colors"
          >
            {ar ? "مسح" : "Clear"} ×
          </button>
        )}

        <span className="text-[10px] font-mono text-ink-4 ml-auto">
          {list.length} / {projects.length}
        </span>
      </motion.div>

      {/* Grid */}
      {!list.length ? (
        <div className="p-16 text-center rounded-3xl border border-dashed border-violet-500/20 text-ink-3">
          {T("none")}
        </div>
      ) : fixedCat ? (
        grid(list)
      ) : (
        <>
          {cats.map((c) => {
            const all = list.filter((p) => p.category_id === c.id);
            if (!all.length) return null;
            const shown = filtering ? all : all.slice(0, limit);
            return (
              <div key={c.id} className="mb-16">
                <motion.h2
                  className="flex items-baseline justify-between gap-4 mb-6 flex-wrap"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                >
                  <Link
                    href={`/${lang}/categories/${c.slug}`}
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
                    className="text-sm text-mint-300 hover:underline flex items-center gap-1"
                  >
                    {T("viewAll")} ({all.length}) ↗
                  </Link>
                </motion.h2>
                {grid(shown)}
              </div>
            );
          })}

          {list.some((p) => !p.category_id) && (
            <>
              <h2 className="font-display text-3xl font-medium text-ink-0 mb-6">
                {T("other")}
              </h2>
              {grid(list.filter((p) => !p.category_id))}
            </>
          )}
        </>
      )}
    </>
  );
}