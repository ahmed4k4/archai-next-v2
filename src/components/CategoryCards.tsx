import Link from "next/link";
import type { CSSProperties } from "react";
import { pick, tr } from "../lib/i18n";

type CategoryCardsProps = { cats: any[]; projects: any[]; lang: "ar" | "en" };

export default function CategoryCards({ cats, projects, lang }: CategoryCardsProps) {
  const T = tr(lang);
  const count = (id) => projects.filter((p) => p.category_id === id).length;
  const items = cats.map((c) => ({ c, n: count(c.id) })).filter((x) => x.n > 0);
  if (!items.length) return null;
  return (
    <div className="catgrid stagger">
      {items.map(({ c, n }, i) => (
        <Link key={c.id} href={`/${lang}/categories/${c.slug}`} className="catcard" style={{ "--i": i } as CSSProperties}>
          <span className="catcard-ic">{c.icon || "◆"}</span>
          <span className="catcard-name">{pick(c, "name", lang)}</span>
          <span className="catcard-desc">{pick(c, "description", lang)}</span>
          <span className="catcard-foot">
            <b>{n}</b> {T("projectsWord")} <i aria-hidden="true">{lang === "ar" ? "←" : "→"}</i>
          </span>
        </Link>
      ))}
    </div>
  );
}
