import Link from "next/link";
import { pick, tr } from "../lib/i18n";

type FooterProps = { lang: "ar" | "en"; cats: any[] };

export default function Footer({ lang, cats }: FooterProps) {
  const T = tr(lang);
  return (
    <footer className="premium">
      <div className="wrap">
        <div className="footer-grid">
          <div className="footer-brand">
            <h3>Archai Integrated Systems</h3>
            <p>{T("footerAbout")}</p>
          </div>
          <div className="footer-col">
            <h4>{T("footerLinks")}</h4>
            <Link href={`/${lang}`}>{T("home")}</Link>
            <Link href={`/${lang}#list`}>{T("projects")}</Link>
            <Link href={`/${lang}#sl`}>{T("featT")}</Link>
          </div>
          {cats.length ? (
            <div className="footer-col">
              <h4>{T("categories")}</h4>
              {cats.slice(0, 6).map((c) => (
                <Link key={c.id} href={`/${lang}/categories/${c.slug}`}>{pick(c, "name", lang)}</Link>
              ))}
            </div>
          ) : null}
          <div className="footer-col">
            <h4>{T("footerContact")}</h4>
            <a href="mailto:info@archai.com">info@archai.com</a>
          </div>
        </div>
        <div className="footer-bottom">
          <div>{T("footerRights").replace("{year}", String(new Date().getFullYear()))}</div>
          <div>{T("footerLocation")}</div>
        </div>
      </div>
    </footer>
  );
}
