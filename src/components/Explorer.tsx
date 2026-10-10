"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import ProjectCard from "./ProjectCard";
import { pick, tr } from "../lib/i18n";

/* search + filters. Home: grouped by category (limited per category). Category page: flat grid. */
type ExplorerProps = { cats: any[]; projects: any[]; lang: "ar" | "en"; fixedCat?: boolean; limit?: number };

export default function Explorer({ cats, projects, lang, fixedCat = false, limit = 6 }: ExplorerProps) {
  const T = tr(lang);
  const [q, setQ] = useState("");
  const [cf, setCf] = useState("");
  const [tf, setTf] = useState("");

  const techs = useMemo(
    () => [...new Set(projects.flatMap((p) => p.project_technologies.map((x) => x.technology)))].sort(),
    [projects]
  );

  const list = useMemo(() => {
    const s = q.toLowerCase().trim();
    return projects.filter(
      (p) =>
        (!cf || p.category_id === cf) &&
        (!tf || p.project_technologies.some((x) => x.technology === tf)) &&
        (!s ||
          [
            p.title_en, p.title_ar, p.summary_en, p.summary_ar,
            p.categories?.name_en, p.categories?.name_ar,
            ...p.project_technologies.map((x) => x.technology),
            ...p.project_industries.map((x) => x.industry),
          ]
            .join(" ")
            .toLowerCase()
            .includes(s))
    );
  }, [projects, q, cf, tf]);

  const filtering = Boolean(q || cf || tf);
  const grid = (arr) => (
    <div className="grid stagger">
      {arr.map((p) => (
        <ProjectCard key={p.id} p={p} lang={lang} />
      ))}
    </div>
  );

  return (
    <>
      <div className="bar reveal" id="list">
        <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder={T("search")} aria-label={T("search")} />
        {!fixedCat ? (
          <select value={cf} onChange={(e) => setCf(e.target.value)} aria-label={T("cat")}>
            <option value="">{T("all")}</option>
            {cats.map((c) => (
              <option key={c.id} value={c.id}>
                {pick(c, "name", lang)}
              </option>
            ))}
          </select>
        ) : null}
        <select value={tf} onChange={(e) => setTf(e.target.value)} aria-label={T("allT")}>
          <option value="">{T("allT")}</option>
          {techs.map((x) => (
            <option key={x}>{x}</option>
          ))}
        </select>
      </div>

      {!list.length ? (
        <div className="empty">{T("none")}</div>
      ) : fixedCat ? (
        grid(list)
      ) : (
        <>
          {cats.map((c) => {
            const all = list.filter((p) => p.category_id === c.id);
            if (!all.length) return null;
            const shown = filtering ? all : all.slice(0, limit);
            return (
              <div key={c.id}>
                <h2 className="st reveal sechead">
                  <Link href={`/${lang}/categories/${c.slug}`}>
                    {c.icon ? <span className="ic">{c.icon}</span> : null}
                    {pick(c, "name", lang)}
                  </Link>
                  <Link className="more" href={`/${lang}/categories/${c.slug}`}>
                    {T("viewAll")} ({all.length}) →
                  </Link>
                </h2>
                {grid(shown)}
              </div>
            );
          })}
          {list.some((p) => !p.category_id) ? (
            <>
              <h2 className="st reveal">{T("other")}</h2>
              {grid(list.filter((p) => !p.category_id))}
            </>
          ) : null}
        </>
      )}
    </>
  );
}
