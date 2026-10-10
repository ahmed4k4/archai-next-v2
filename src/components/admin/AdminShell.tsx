"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabaseBrowser } from "../../lib/supabase-browser";
import { AdminLocale, AdminLocaleProvider } from "./AdminI18n";

const nav = [
  ["/admin", "overview"], ["/admin/projects", "projects"], ["/admin/categories", "categories"],
  ["/admin/analytics", "analytics"], ["/admin/settings", "settings"], ["/admin/tools", "tools"], ["/admin/seo", "seo"],
] as const;
const labels: Record<AdminLocale, Record<string, string>> = {
  ar: { overview:"نظرة عامة",projects:"المشاريع",categories:"الأقسام",analytics:"الإحصائيات",settings:"الإعدادات",tools:"أدوات الموقع",seo:"فحص المحتوى وSEO",logout:"تسجيل الخروج",console:"لوحة الإدارة",light:"الوضع الفاتح",dark:"الوضع الداكن",language:"English" },
  en: { overview:"Overview",projects:"Projects",categories:"Categories",analytics:"Analytics",settings:"Settings",tools:"Site tools",seo:"Content & SEO audit",logout:"Sign out",console:"ADMIN CONSOLE",light:"Light mode",dark:"Dark mode",language:"العربية" }
};
export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname(); const router = useRouter(); const sb = supabaseBrowser();
  const [ready, setReady] = useState(false); const [email, setEmail] = useState(""); const [open, setOpen] = useState(false);
  const [locale, setLocale] = useState<AdminLocale>("ar"); const [theme, setTheme] = useState("dark"); const [commandOpen, setCommandOpen] = useState(false); const [commandQuery, setCommandQuery] = useState("");
  useEffect(() => {
    try { const l = localStorage.getItem("archai-admin-locale"); if (l === "en" || l === "ar") setLocale(l); const th = localStorage.getItem("theme") || "dark"; setTheme(th); document.documentElement.dataset.theme = th; } catch {}
  }, []);
  useEffect(() => {
    let mounted = true;
    sb.auth.getSession().then(async ({ data }) => {
      if (!mounted) return;
      if (!data.session) { if (pathname !== "/admin/login") router.replace("/admin/login"); setReady(true); return; }
      const { data: profile, error: profileError } = await sb.rpc("get_my_profile");
      if (profileError || profile?.role !== "admin") { await sb.auth.signOut(); router.replace("/admin/login?denied=1"); return; }
      setEmail(data.session.user.email || profile?.name || "Admin"); setReady(true);
    });
    return () => { mounted = false; };
  }, [pathname, router, sb]);
  useEffect(() => { const onKey = (event: KeyboardEvent) => { if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") { event.preventDefault(); setCommandOpen(v => !v); setCommandQuery(""); } if (event.key === "Escape") setCommandOpen(false); }; window.addEventListener("keydown", onKey); return () => window.removeEventListener("keydown", onKey); }, []);
  function changeLocale(next: AdminLocale) { setLocale(next); try { localStorage.setItem("archai-admin-locale", next); } catch {} }
  function changeTheme() { const next = theme === "dark" ? "light" : "dark"; setTheme(next); document.documentElement.dataset.theme = next; try { localStorage.setItem("theme", next); } catch {} }
  if (pathname === "/admin/login") return <>{children}</>;
  if (!ready) return <div className="admin-loading">{locale === "ar" ? "جارٍ تحميل لوحة التحكم…" : "Loading admin workspace…"}</div>;
  const L = labels[locale];
  return <AdminLocaleProvider locale={locale}>
    <div className={`admin-app admin-${locale}`} dir={locale === "ar" ? "rtl" : "ltr"} lang={locale}>
      <aside className={open ? "admin-sidebar open" : "admin-sidebar"}>
        <Link href="/admin" className="admin-brand"><img src="/assets/logo.png" alt="Archai" /><div><strong>ARCHAI</strong><span>PROJECTS CONTROL</span></div></Link>
        <nav>{nav.map(([href, key]) => <Link key={href} href={href} className={pathname === href || (href !== "/admin" && pathname.startsWith(href)) ? "active" : ""} onClick={() => setOpen(false)}><span>{L[key]}</span><small>{key.toUpperCase()}</small></Link>)}</nav>
        <div className="admin-sidebar-foot"><span className="admin-online-dot" />{locale === "ar" ? "النظام متصل" : "SYSTEM ONLINE"}</div>
        <button className="admin-logout" onClick={async () => { await sb.auth.signOut(); router.replace("/admin/login"); }}>{L.logout} ↗</button>
      </aside>
      {open && <button className="admin-overlay" aria-label="close" onClick={() => setOpen(false)} />}
      <section className="admin-main">
        <header className="admin-topbar"><button className="admin-menu" onClick={() => setOpen(v => !v)} aria-label="Menu">☰</button><div className="admin-top-title"><span>{L.console}</span><h1>Archai <em>{locale === "ar" ? "مساحة الإدارة" : "Workspace"}</em></h1></div><div className="admin-top-actions"><button className="admin-tool-button admin-command-trigger" onClick={() => { setCommandOpen(true); setCommandQuery(""); }} aria-label="Command menu">⌕ <span>Ctrl K</span></button><button className="admin-tool-button" onClick={() => changeLocale(locale === "ar" ? "en" : "ar")} aria-label={L.language}>{L.language}</button><button className="admin-tool-button theme-switch" onClick={changeTheme} aria-label={theme === "dark" ? L.light : L.dark}>{theme === "dark" ? "☼" : "☾"}<span>{theme === "dark" ? L.light : L.dark}</span></button><div className="admin-user"><i>{(email[0] || "A").toUpperCase()}</i><span>{email}</span></div></div></header>
        <main className="admin-content">{children}</main>
        {commandOpen && <div className="admin-command-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) setCommandOpen(false); }}><section className="admin-command-dialog" role="dialog" aria-modal="true" aria-label={locale === "ar" ? "التنقل السريع" : "Quick navigation"}><div className="admin-command-search"><span>⌕</span><input autoFocus value={commandQuery} onChange={e => setCommandQuery(e.target.value)} placeholder={locale === "ar" ? "ابحث عن صفحة أو إجراء..." : "Search pages and actions..."} /><kbd>ESC</kbd></div><div className="admin-command-list">{nav.filter(([href,key]) => { const label = L[key] || key; return `${label} ${href} ${key}`.toLowerCase().includes(commandQuery.toLowerCase()); }).map(([href,key]) => <Link href={href} key={href} onClick={() => setCommandOpen(false)}><span className="admin-command-icon">{key === "overview" ? "⌂" : key === "projects" ? "◫" : key === "categories" ? "▦" : key === "analytics" ? "⌁" : key === "settings" ? "⚙" : key === "seo" ? "✳" : "✧"}</span><span>{L[key]}</span><kbd>↵</kbd></Link>)}{!nav.some(([href,key]) => `${L[key] || key} ${href} ${key}`.toLowerCase().includes(commandQuery.toLowerCase())) && <p>{locale === "ar" ? "لا توجد نتائج مطابقة" : "No matching pages"}</p>}</div><footer>{locale === "ar" ? "تنقل سريع داخل مساحة الإدارة" : "Quick navigation across your workspace"}<span>ARCHAI COMMAND</span></footer></section></div>}
      </section>
    </div>
  </AdminLocaleProvider>;
}
