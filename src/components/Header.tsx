"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { pick, tr } from "../lib/i18n";

type HeaderProps = { lang: "ar" | "en"; cats: any[] };

export default function Header({ lang, cats }: HeaderProps) {
  const T = tr(lang);
  const pathname = usePathname() || `/${lang}`;
  const other = lang === "ar" ? "en" : "ar";
  const alt = pathname.replace(/^\/(ar|en)/, "/" + other);
  const toggleTheme = () => {
    const h = document.documentElement;
    const v = h.dataset.theme === "dark" ? "light" : "dark";
    h.dataset.theme = v;
    try { localStorage.theme = v; } catch {}
  };
  return (
    <header className="top">
      <div className="wrap nav">
        <Link href={`/${lang}`} aria-label="Archai home">
          <img src="/assets/logo.png" alt="Archai" />
        </Link>
        <span className="sp" />
        {cats.length ? (
          <details className="catmenu" key={pathname}>
            <summary className="btn">{T("categories")} <i aria-hidden="true">▾</i></summary>
            <div className="catmenu-pop">
              {cats.map((c) => (
                <Link key={c.id} href={`/${lang}/categories/${c.slug}`}>
                  <span>{c.icon || "◆"}</span>
                  {pick(c, "name", lang)}
                </Link>
              ))}
            </div>
          </details>
        ) : null}
        <Link className="btn" href={`/${lang}#list`}>{T("projects")}</Link>
        <Link
          className="btn"
          id="lang"
          href={alt}
          hrefLang={other}
          aria-label={T("lang")}
          onClick={() => { document.cookie = `lang=${other};path=/;max-age=31536000`; }}
        >
          {other === "en" ? "EN" : "ع"}
        </Link>
        <button className="btn" id="theme" type="button" aria-label={T("theme")} onClick={toggleTheme}>◐</button>
      </div>
    </header>
  );
}
