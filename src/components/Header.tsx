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
        <nav className="company-nav" aria-label={T("company")}>
          <Link href={`/${lang}/services`}>{T("services")}</Link>
          <Link href={`/${lang}/industries`}>{T("industries")}</Link>
          <Link href={`/${lang}#list`}>{T("projects")}</Link>
          <details className="company-menu"><summary>{T("company")} <i>▾</i></summary><div className="company-menu-pop"><Link href={`/${lang}/services`}>{T("services")}</Link><Link href={`/${lang}/industries`}>{T("industries")}</Link><Link href={`/${lang}/about`}>{T("about")}</Link><Link href={`/${lang}/process`}>{T("process")}</Link><Link href={`/${lang}/insights`}>{T("insights")}</Link><Link href={`/${lang}/case-studies`}>{lang === "ar" ? "دراسات الحالة" : "Case studies"}</Link><Link href={`/${lang}/careers`}>{lang === "ar" ? "الوظائف" : "Careers"}</Link><Link href={`/${lang}/faq`}>{lang === "ar" ? "الأسئلة الشائعة" : "FAQ"}</Link><Link href={`/${lang}/contact`}>{T("contact")}</Link></div></details>
        </nav>
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
