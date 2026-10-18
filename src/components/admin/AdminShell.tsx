"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  LayoutDashboard,
  FolderKanban,
  FileText,
  Sparkles,
  BarChart3,
  Settings,
  Wrench,
  Search,
  LogOut,
  Menu,
  Sun,
  Moon,
  Languages,
  ChevronRight,
  PanelLeft,
  type LucideIcon,
} from "lucide-react";
import { motion, AnimatePresence, MotionConfig, useReducedMotion } from "framer-motion";
import { supabaseBrowser } from "@/lib/supabase-browser";
import { AdminLocale, AdminLocaleProvider } from "./AdminI18n";

type NavEntry = { href: string; key: string; icon: LucideIcon; kb: string };
type NavSection = { id: string; labelAr: string; labelEn: string; items: NavEntry[] };

const NAV_SECTIONS: NavSection[] = [
  {
    id: "main",
    labelAr: "الرئيسية",
    labelEn: "MAIN",
    items: [
      { href: "/admin", key: "overview", icon: LayoutDashboard, kb: "G" },
      { href: "/admin/analytics", key: "analytics", icon: BarChart3, kb: "A" },
    ],
  },
  {
    id: "content",
    labelAr: "المحتوى",
    labelEn: "CONTENT",
    items: [
      { href: "/admin/projects", key: "projects", icon: FolderKanban, kb: "P" },
      { href: "/admin/content", key: "contentPages", icon: FileText, kb: "M" },
      { href: "/admin/categories", key: "categories", icon: Sparkles, kb: "C" },
      { href: "/admin/seo", key: "seo", icon: Search, kb: "S" },
    ],
  },
  {
    id: "system",
    labelAr: "النظام",
    labelEn: "SYSTEM",
    items: [
      { href: "/admin/tools", key: "tools", icon: Wrench, kb: "T" },
      { href: "/admin/settings", key: "settings", icon: Settings, kb: "," },
    ],
  },
];

const nav: NavEntry[] = NAV_SECTIONS.flatMap((s) => s.items);

const labels: Record<AdminLocale, Record<string, string>> = {
  ar: {
    overview: "نظرة عامة",
    projects: "المشاريع",
    contentPages: "محتوى الصفحات",
    categories: "الأقسام",
    analytics: "الإحصائيات",
    settings: "الإعدادات",
    tools: "أدوات الموقع",
    seo: "فحص المحتوى وSEO",
    logout: "تسجيل الخروج",
    console: "لوحة الإدارة",
    light: "فاتح",
    dark: "داكن",
    language: "EN",
  },
  en: {
    overview: "Overview",
    projects: "Projects",
    contentPages: "Page content",
    categories: "Categories",
    analytics: "Analytics",
    settings: "Settings",
    tools: "Site tools",
    seo: "Content & SEO audit",
    logout: "Sign out",
    console: "ADMIN CONSOLE",
    light: "Light",
    dark: "Dark",
    language: "ع",
  },
};

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const sb = supabaseBrowser();

  const [ready, setReady] = useState(false);
  const [email, setEmail] = useState("");
  const [open, setOpen] = useState(false);
  const [locale, setLocale] = useState<AdminLocale>("ar");
  const [theme, setTheme] = useState("dark");
  const [commandOpen, setCommandOpen] = useState(false);
  const [commandQuery, setCommandQuery] = useState("");
  const [collapsed, setCollapsed] = useState(false);
  const pathnameRef = useRef(pathname);
  const validatedUserId = useRef<string | null>(null);

  useEffect(() => { pathnameRef.current = pathname; }, [pathname]);

  useEffect(() => {
    try {
      setCollapsed(localStorage.getItem("archai-admin-collapsed") === "1");
    } catch {}
  }, []);

  function toggleCollapse() {
    const next = !collapsed;
    setCollapsed(next);
    try {
      localStorage.setItem("archai-admin-collapsed", next ? "1" : "0");
    } catch {}
  }

  useEffect(() => {
    try {
      const l = localStorage.getItem("archai-admin-locale");
      if (l === "en" || l === "ar") setLocale(l);
      const th = localStorage.getItem("theme") || "dark";
      setTheme(th);
      document.documentElement.dataset.theme = th;
    } catch {}
  }, []);

  useEffect(() => {
    let mounted = true;
    const validateInitialSession = async () => {
      try {
        const { data, error: sessionError } = await sb.auth.getSession();
        if (sessionError) throw sessionError;
        if (!mounted) return;
        if (!data.session) {
          validatedUserId.current = null;
          if (pathnameRef.current !== "/admin/login") router.replace("/admin/login");
          setReady(true);
          return;
        }

        if (validatedUserId.current === data.session.user.id) {
          setEmail(data.session.user.email || "Admin");
          setReady(true);
          return;
        }

        const { data: profile, error: profileError } = await sb.rpc("get_my_profile");
        if (profileError || profile?.role !== "admin") {
          await sb.auth.signOut();
          if (!mounted) return;
          router.replace("/admin/login?denied=1");
          setReady(true);
          return;
        }

        if (!mounted) return;
        validatedUserId.current = data.session.user.id;
        setEmail(data.session.user.email || profile?.name || "Admin");
        setReady(true);
      } catch (error) {
        if (!mounted) return;
        if (process.env.NODE_ENV !== "production") console.error("[admin] session validation failed", error);
        setReady(true);
        if (pathnameRef.current !== "/admin/login") router.replace("/admin/login?error=auth");
      }
    };

    void validateInitialSession();
    const { data: authListener } = sb.auth.onAuthStateChange((event) => {
      if (!mounted) return;
      if (event === "SIGNED_OUT") {
        validatedUserId.current = null;
        setReady(false);
        setEmail("");
        if (pathnameRef.current !== "/admin/login") router.replace("/admin/login");
      }
    });

    return () => {
      mounted = false;
      authListener.subscription.unsubscribe();
    };
  }, [pathname, router, sb]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setCommandOpen((v) => !v);
        setCommandQuery("");
      }
      if (event.key === "Escape") {
        setCommandOpen(false);
        setOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  function changeLocale(next: AdminLocale) {
    setLocale(next);
    try {
      localStorage.setItem("archai-admin-locale", next);
    } catch {}
  }

  function changeTheme() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem("theme", next);
    } catch {}
  }

  if (pathname === "/admin/login") return <MotionConfig reducedMotion="user">{children}</MotionConfig>;

  if (!ready) {
    return (
      <div className="admin-loading">
        {locale === "ar" ? "جارٍ تحميل لوحة التحكم…" : "Loading admin workspace…"}
      </div>
    );
  }

  const L = labels[locale];
  const isRTL = locale === "ar";
  const activeNav = nav.find(
    (n) => pathname === n.href || (n.href !== "/admin" && pathname.startsWith(n.href))
  );

  return (
    <MotionConfig reducedMotion="user">
    <AdminLocaleProvider locale={locale}>
      <div
        className={`admin-app admin-${locale}`}
        dir={isRTL ? "rtl" : "ltr"}
        lang={locale}
      >
        {/* ============================================================
            SIDEBAR
            ============================================================ */}
        <aside
          className={`${open ? "open" : ""} ${collapsed ? "collapsed" : ""} admin-sidebar`}
        >
          <div className="admin-brand-row">
            <Link href="/admin" className="admin-brand">
              <img src="/assets/logo.webp" alt="Archai" />
              <div>
                <strong>ARCHAI</strong>
                <span>PROJECTS CONTROL</span>
              </div>
            </Link>
            <button
              className="admin-collapse-btn"
              onClick={toggleCollapse}
              aria-label={locale === "ar" ? (collapsed ? "توسيع القائمة الجانبية" : "طي القائمة الجانبية") : (collapsed ? "Expand sidebar" : "Collapse sidebar")}
              title={locale === "ar" ? (collapsed ? "توسيع" : "طي") : (collapsed ? "Expand" : "Collapse")}
            >
              <PanelLeft size={14} />
            </button>
          </div>

          <nav>
            {NAV_SECTIONS.map((section) => (
              <div key={section.id} className="admin-nav-section">
                <span className="admin-nav-label">
                  {locale === "ar" ? section.labelAr : section.labelEn}
                </span>
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const active =
                    pathname === item.href ||
                    (item.href !== "/admin" && pathname.startsWith(item.href));
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={active ? "active" : ""}
                      onClick={() => setOpen(false)}
                      title={L[item.key]}
                    >
                      <span className="flex items-center gap-2.5 admin-nav-main">
                        <Icon size={15} />
                        <span>{L[item.key]}</span>
                      </span>
                      <small className="admin-nav-kb">⌘{item.kb}</small>
                    </Link>
                  );
                })}
              </div>
            ))}
          </nav>

          <div className="admin-sidebar-foot">
            <span className="admin-online-dot" />
            <span className="admin-foot-text">
              {locale === "ar" ? "مساحة إدارة المحتوى" : "CONTENT WORKSPACE"}
            </span>
          </div>

          <div className="admin-user-card">
            <i>{(email[0] || "A").toUpperCase()}</i>
            <div className="admin-user-card-info">
              <span className="admin-user-card-email">{email}</span>
              <span className="admin-user-card-role">
                {locale === "ar" ? "مسؤول" : "Administrator"}
              </span>
            </div>
            <button
              className="admin-user-card-logout"
              onClick={async () => {
                await sb.auth.signOut();
                router.replace("/admin/login");
              }}
              aria-label={L.logout}
              title={L.logout}
            >
              <LogOut size={14} />
            </button>
          </div>
        </aside>

        {open && (
          <button
            className="admin-overlay"
            aria-label={locale === "ar" ? "إغلاق القائمة" : "Close navigation"}
            onClick={() => setOpen(false)}
          />
        )}

        {/* ============================================================
            MAIN
            ============================================================ */}
        <section className="admin-main">
          <header className="admin-topbar">
            <button
              className="admin-menu"
              onClick={() => setOpen((v) => !v)}
              aria-label={locale === "ar" ? "فتح القائمة" : "Menu"}
            >
              <Menu size={18} />
            </button>

            <div className="admin-top-title">
              <span>{L.console}</span>
              <h1>
                Archai <em>{locale === "ar" ? "مساحة الإدارة" : "Workspace"}</em>
              </h1>
              {/* Breadcrumb — derived from the active route */}
              <nav className="admin-breadcrumb" aria-label="Breadcrumb">
                <Link href="/admin">{L.overview}</Link>
                {activeNav && activeNav.href !== "/admin" && (
                  <>
                    <ChevronRight size={11} />
                    <span>{L[activeNav.key]}</span>
                  </>
                )}
              </nav>
            </div>

            <div className="admin-top-actions">
              <button
                className="admin-tool-button admin-command-trigger"
                onClick={() => {
                  setCommandOpen(true);
                  setCommandQuery("");
                }}
                aria-label={locale === "ar" ? "فتح قائمة الأوامر" : "Command menu"}
              >
                <Search size={14} />
                <span>⌘K</span>
              </button>

              <button
                className="admin-tool-button"
                onClick={() => changeLocale(locale === "ar" ? "en" : "ar")}
                aria-label={locale === "ar" ? "تغيير اللغة" : "Language"}
              >
                <Languages size={14} />
                {L.language}
              </button>

              <button
                className="admin-tool-button theme-switch"
                onClick={changeTheme}
                aria-label={theme === "dark" ? L.light : L.dark}
              >
                {theme === "dark" ? <Sun size={14} /> : <Moon size={14} />}
                <span>{theme === "dark" ? L.light : L.dark}</span>
              </button>

              <div className="admin-user" title={email}>
                <i>{(email[0] || "A").toUpperCase()}</i>
              </div>
            </div>
          </header>

          <main className="admin-content">
            <motion.div
              className="admin-route-content"
              key={pathname}
              initial={reduceMotion ? false : { opacity: 0.97, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={reduceMotion ? { duration: 0 } : { duration: 0.26, ease: [0.2, 0.75, 0.25, 1] }}
            >
              {children}
            </motion.div>
          </main>

          {/* ============================================================
              COMMAND PALETTE
              ============================================================ */}
          <AnimatePresence>
            {commandOpen && (
              <motion.div
                className="admin-command-backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onMouseDown={(e) => {
                  if (e.target === e.currentTarget) setCommandOpen(false);
                }}
              >
                <motion.section
                  className="admin-command-dialog"
                  role="dialog"
                  aria-modal="true"
                  initial={{ opacity: 0, y: -12, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -12, scale: 0.98 }}
                >
                  <div className="admin-command-search">
                    <Search size={18} />
                    <input
                      autoFocus
                      value={commandQuery}
                      onChange={(e) => setCommandQuery(e.target.value)}
                      placeholder={
                        locale === "ar"
                          ? "ابحث عن صفحة أو إجراء..."
                          : "Search pages and actions..."
                      }
                    />
                    <kbd>ESC</kbd>
                  </div>

                  <div className="admin-command-list">
                    {nav
                      .filter((item) => {
                        const label = L[item.key] || item.key;
                        return `${label} ${item.href} ${item.key}`
                          .toLowerCase()
                          .includes(commandQuery.toLowerCase());
                      })
                      .map((item) => {
                        const Icon = item.icon;
                        return (
                          <Link
                            href={item.href}
                            key={item.href}
                            onClick={() => setCommandOpen(false)}
                          >
                            <span className="admin-command-icon">
                              <Icon size={16} />
                            </span>
                            <span>{L[item.key]}</span>
                            <kbd>↵</kbd>
                          </Link>
                        );
                      })}
                    {!nav.some((item) =>
                      `${L[item.key] || item.key} ${item.href} ${item.key}`
                        .toLowerCase()
                        .includes(commandQuery.toLowerCase())
                    ) && (
                      <p>
                        {locale === "ar"
                          ? "لا توجد نتائج مطابقة"
                          : "No matching pages"}
                      </p>
                    )}
                  </div>

                  <footer>
                    {locale === "ar"
                      ? "تنقل سريع داخل مساحة الإدارة"
                      : "Quick navigation across your workspace"}
                    <span>ARCHAI COMMAND</span>
                  </footer>
                </motion.section>
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </div>
    </AdminLocaleProvider>
    </MotionConfig>
  );
}