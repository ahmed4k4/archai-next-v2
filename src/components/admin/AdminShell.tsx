"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabaseBrowser } from "../../lib/supabase-browser";

const nav = [
  ["/admin", "Overview", "نظرة عامة"],
  ["/admin/projects", "Projects", "المشاريع"],
  ["/admin/categories", "Categories", "الأقسام"],
  ["/admin/analytics", "Analytics", "الإحصائيات"],
  ["/admin/settings", "Settings", "الإعدادات"],
];

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const sb = supabaseBrowser();
  const [ready, setReady] = useState(false);
  const [email, setEmail] = useState("");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let mounted = true;
    sb.auth.getSession().then(async ({ data }) => {
      if (!mounted) return;
      if (!data.session) {
        if (pathname !== "/admin/login") router.replace("/admin/login");
        setReady(true);
        return;
      }
      const { data: profile, error: profileError } = await sb.rpc("get_my_profile");
      if (profileError || profile?.role !== "admin") {
        await sb.auth.signOut();
        router.replace("/admin/login?denied=1");
        return;
      }
      setEmail(data.session.user.email || profile?.name || "Admin");
      setReady(true);
    });
    return () => { mounted = false; };
  }, [pathname, router, sb]);

  if (pathname === "/admin/login") return <>{children}</>;
  if (!ready) return <div className="admin-loading">Loading Archai Admin…</div>;

  return (
    <div className="admin-app" dir="rtl">
      <aside className={open ? "admin-sidebar open" : "admin-sidebar"}>
        <div className="admin-brand"><img src="/assets/logo.png" alt="Archai" /><div><strong>ARCHAI</strong><span>PROJECTS CONTROL</span></div></div>
        <nav>{nav.map(([href, en, ar]) => <Link key={href} href={href} className={pathname === href || (href !== "/admin" && pathname.startsWith(href)) ? "active" : ""} onClick={() => setOpen(false)}><span>{ar}</span><small>{en}</small></Link>)}</nav>
        <button className="admin-logout" onClick={async () => { await sb.auth.signOut(); router.replace("/admin/login"); }}>تسجيل الخروج</button>
      </aside>
      {open && <button className="admin-overlay" aria-label="close" onClick={() => setOpen(false)} />}
      <section className="admin-main">
        <header className="admin-topbar"><button className="admin-menu" onClick={() => setOpen(v => !v)}>☰</button><div><span>ADMIN CONSOLE</span><h1>Archai Showcase</h1></div><div className="admin-user">{email}</div></header>
        <main className="admin-content">{children}</main>
      </section>
    </div>
  );
}
