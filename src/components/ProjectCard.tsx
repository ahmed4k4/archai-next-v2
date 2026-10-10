import Link from "next/link";
import { pick, tr, safeUrl } from "../lib/i18n";

type ProjectCardProps = { p: any; lang: "ar" | "en" };

export default function ProjectCard({ p, lang }: ProjectCardProps) {
  const T = tr(lang);
  const title = pick(p, "title", lang);
  const cover = p.cover_thumb || p.cover_image;
  const href = `/${lang}/projects/${p.id}`;
  return (
    <article className="card">
      <Link className="im" href={href} data-hint={T("details")} aria-label={`${T("details")} — ${title}`}>
        {cover ? <img src={cover} alt={title} loading="lazy" decoding="async" /> : null}
      </Link>
      <div className="b">
        <div>
          <span className="badge c">{pick(p.categories, "name", lang) || T("other")}</span>
          {p.featured ? <span className="badge">★ {T("feat")}</span> : null}
        </div>
        <h3>{title}</h3>
        <p>{pick(p, "summary", lang)}</p>
        <div className="tags">
          {p.project_technologies.slice(0, 3).map((x) => (
            <span key={x.technology}>{x.technology}</span>
          ))}
        </div>
        <div className="row">
          {p.live_url ? (
            <a className="btn p" target="_blank" rel="noopener noreferrer" href={safeUrl(p.live_url)}>
              {T("visit")} ↗
            </a>
          ) : null}
          <Link className="btn" href={href}>
            {T("details")}
          </Link>
        </div>
      </div>
    </article>
  );
}
