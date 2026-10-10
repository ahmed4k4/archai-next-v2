"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, useTransition, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";
import {
  Search,
  Sun,
  Moon,
  Bell,
  ArrowUpRight,
  Building2,
  Briefcase,
  Layers,
  Cpu,
  Workflow,
  BookOpen,
  HelpCircle,
  Mail,
  type LucideIcon,
} from "lucide-react";
import { pick, tr } from "@/lib/i18n";
import type { Locale } from "@/lib/types";
import CommandPalette from "./CommandPalette";

type HeaderProps = {
  lang: Locale;
  cats: any[];
};

type NavItem = {
  href: string;
  key?: string;
  labelAr?: string;
  labelEn?: string;
  icon: LucideIcon;
  descAr?: string;
  descEn?: string;
};

const COMPANY_LINKS: NavItem[] = [
  { href: "about", key: "about", icon: Building2 },
  { href: "services", key: "services", icon: Layers },
  { href: "industries", key: "industries", icon: Cpu },
  { href: "process", key: "process", icon: Workflow },
  { href: "insights", key: "insights", icon: BookOpen },
  { href: "case-studies", labelAr: "دراسات الحالة", labelEn: "Case studies", icon: Briefcase },
  { href: "careers", labelAr: "الوظائف", labelEn: "Careers", icon: Briefcase },
  { href: "faq", labelAr: "الأسئلة الشائعة", labelEn: "FAQ", icon: HelpCircle },
  { href: "contact", key: "contact", icon: Mail },
];

export default function Header({ lang, cats }: HeaderProps) {
  const T = tr(lang);
  const ar = lang === "ar";
  const pathname = usePathname() || `/${lang}`;
  const other = ar ? "en" : "ar";
  const alt = pathname.replace(/^\/(ar|en)/, "/" + other);

  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [companyOpen, setCompanyOpen] = useState(false);
  const [catsOpen, setCatsOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [cmdOpen, setCmdOpen] = useState(false);
  const [langPending, startLangTransition] = useTransition();

  /**
   * Switch locale without a full reload: swap the `/{lang}` segment, persist the
   * choice, preserve scroll, and let Next.js do a client-side transition.
   */
  const switchLanguage = useCallback(() => {
    const next = other;
    const newPath = alt;
    try {
      document.cookie = `lang=${next};path=/;max-age=31536000;samesite=lax`;
      localStorage.setItem("lang", next);
    } catch {}
    const y = typeof window !== "undefined" ? window.scrollY : 0;
    startLangTransition(() => {
      router.push(newPath, { scroll: false });
      /* restore scroll after the new route paints */
      requestAnimationFrame(() => window.scrollTo(0, y));
    });
  }, [alt, other, router]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setCompanyOpen(false);
    setCatsOpen(false);
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCmdOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    try {
      setTheme((document.documentElement.dataset.theme as "dark" | "light") || "dark");
    } catch {}
  }, []);

  const toggleTheme = () => {
    const h = document.documentElement;
    const v = h.dataset.theme === "dark" ? "light" : "dark";
    h.dataset.theme = v;
    window.dispatchEvent(new Event("archai:theme-change"));
    setTheme(v);
    try {
      localStorage.theme = v;
    } catch {}
  };

  const labelOf = (item: NavItem) =>
    item.key ? T(item.key) : ar ? item.labelAr : item.labelEn;

  const isActive = (href: string) =>
    pathname === href ||
    (href !== `/${lang}` && pathname.startsWith(href)) ||
    (href === `/${lang}` && pathname === `/${lang}`);

  /** Desktop nav link with an animated underline + active state. */
  const NavLink = ({ href, label }: { href: string; label: string }) => {
    const active = isActive(href);
    return (
      <Link
        href={href}
        className={`group relative px-3 py-2 text-sm transition-colors rounded-lg hover:bg-violet-500/10 ${
          active ? "text-ink-0 font-semibold" : "text-ink-2 font-medium hover:text-ink-0"
        }`}
      >
        {label}
        <span
          className={`pointer-events-none absolute bottom-1 left-3 right-3 h-px origin-center bg-grad-signal transition-transform duration-300 ${
            active ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
          }`}
        />
      </Link>
    );
  };

  return (
    <>
      <motion.header
        className="fixed top-0 left-0 right-0 z-[100] transition-all duration-300"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        <div
          className={`relative ${
            scrolled
              ? "bg-[var(--bg-glass)] backdrop-blur-2xl border-b border-violet-500/15 shadow-[0_8px_32px_rgba(0,0,0,0.2)]"
              : "bg-transparent border-b border-transparent"
          } transition-all duration-300`}
        >
          {/* Hairline glow (violet → mint) */}
          <motion.div
            className="absolute bottom-0 left-0 right-0 h-px bg-grad-signal"
            initial={{ opacity: 0 }}
            animate={{ opacity: scrolled ? 0.9 : 0 }}
            transition={{ duration: 0.3 }}
          />

          <div className="wrap-wide flex items-center h-16 lg:h-20 gap-6">
            {/* Logo */}
            <Link href={`/${lang}`} aria-label="Archai home" className="flex items-center gap-3 shrink-0 group">
              <motion.div
                className="relative w-10 h-10 rounded-xl overflow-hidden"
                whileHover={{ scale: 1.08, rotate: -3 }}
                transition={{ duration: 0.3 }}
              >
                <img
                  src="/assets/logo.png"
                  alt="Archai"
                  className="w-full h-full object-contain"
                />
                <motion.div
                  className="absolute inset-0 bg-grad-primary opacity-0 group-hover:opacity-30 blur-xl"
                  animate={{ opacity: [0, 0.15, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                />
              </motion.div>
              <div className="hidden sm:block">
                <div className="font-mono text-[11px] font-bold tracking-[0.2em] text-ink-0">
                  ARCHAI
                </div>
                <div className="font-mono text-[9px] tracking-[0.15em] text-ink-4">
                  INTEGRATED SYSTEMS
                </div>
              </div>
            </Link>

            {/* Center nav (desktop) */}
            <nav className="hidden lg:flex items-center gap-1 mx-auto" aria-label="Main">
              {/* Categories */}
              {cats.length > 0 && (
                <div
                  className="relative"
                  onMouseEnter={() => setCatsOpen(true)}
                  onMouseLeave={() => setCatsOpen(false)}
                >
                  <button className="px-3 py-2 text-sm font-medium text-ink-2 hover:text-ink-0 transition-colors flex items-center gap-1.5 rounded-lg hover:bg-violet-500/10">
                    {T("categories")}
                    <motion.svg
                      width="10"
                      height="10"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      animate={{ rotate: catsOpen ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <path d="M6 9l6 6 6-6" />
                    </motion.svg>
                  </button>

                  <AnimatePresence>
                    {catsOpen && (
                      <motion.div
                        className="absolute top-full left-1/2 -translate-x-1/2 pt-3"
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="w-[420px] p-3 rounded-2xl bg-[var(--bg-1)] border border-violet-500/20 shadow-[0_24px_64px_rgba(0,0,0,0.4)] backdrop-blur-2xl">
                          <div className="grid grid-cols-2 gap-1.5">
                            {cats.map((c) => (
                              <Link
                                key={c.id}
                                href={`/${lang}/categories/${c.slug}`}
                                className="group/cat flex items-center gap-3 p-3 rounded-xl hover:bg-violet-500/10 transition-colors"
                              >
                                <span className="w-9 h-9 grid place-items-center rounded-lg bg-violet-500/10 border border-violet-500/20 text-violet-300 group-hover/cat:bg-grad-primary group-hover/cat:text-white transition-all">
                                  {c.icon || "◆"}
                                </span>
                                <span className="text-sm font-medium text-ink-1 group-hover/cat:text-ink-0">
                                  {pick(c, "name", lang)}
                                </span>
                              </Link>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              <NavLink href={`/${lang}/services`} label={T("services")} />
              <NavLink href={`/${lang}/industries`} label={T("industries")} />
              <NavLink href={`/${lang}#list`} label={T("projects")} />

              {/* Company dropdown */}
              <div
                className="relative"
                onMouseEnter={() => setCompanyOpen(true)}
                onMouseLeave={() => setCompanyOpen(false)}
              >
                <button className="px-3 py-2 text-sm font-medium text-ink-2 hover:text-ink-0 transition-colors flex items-center gap-1.5 rounded-lg hover:bg-violet-500/10">
                  {T("company")}
                  <motion.svg
                    width="10"
                    height="10"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    animate={{ rotate: companyOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <path d="M6 9l6 6 6-6" />
                  </motion.svg>
                </button>

                <AnimatePresence>
                  {companyOpen && (
                    <motion.div
                      className="absolute top-full right-0 pt-3"
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="w-[300px] p-2 rounded-2xl bg-[var(--bg-1)] border border-violet-500/20 shadow-[0_24px_64px_rgba(0,0,0,0.4)] backdrop-blur-2xl">
                        <div className="grid grid-cols-2 gap-1">
                          {COMPANY_LINKS.map((item) => {
                            const Icon = item.icon;
                            return (
                              <Link
                                key={item.href}
                                href={`/${lang}/${item.href}`}
                                className="group/link flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-ink-2 hover:text-ink-0 hover:bg-violet-500/10 transition-colors"
                              >
                                <span className="w-8 h-8 grid place-items-center rounded-lg bg-violet-500/10 border border-violet-500/20 text-violet-300 group-hover/link:bg-grad-primary group-hover/link:text-white group-hover/link:border-transparent transition-all shrink-0">
                                  <Icon size={15} />
                                </span>
                                <span className="flex-1 truncate">{labelOf(item)}</span>
                                <ArrowUpRight
                                  size={13}
                                  className="text-ink-4 opacity-0 -translate-x-1 group-hover/link:opacity-100 group-hover/link:translate-x-0 group-hover/link:text-violet-300 transition-all"
                                />
                              </Link>
                            );
                          })}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </nav>

            {/* Right actions */}
            <div className="flex items-center gap-2 shrink-0">
              {/* Command palette */}
              <button
                onClick={() => setCmdOpen(true)}
                className="hidden md:flex items-center gap-2 px-3 h-9 rounded-lg border border-violet-500/20 bg-violet-500/5 hover:bg-violet-500/10 text-ink-3 hover:text-ink-1 transition-colors text-xs font-mono"
                aria-label="Open command palette"
              >
                <Search size={14} />
                <kbd className="px-1.5 py-0.5 rounded border border-violet-500/20 text-[9px]">
                  ⌘K
                </kbd>
              </button>

              {/* Notifications (visual) */}
              <button
                aria-label="Notifications"
                className="relative hidden md:grid w-9 h-9 place-items-center rounded-lg border border-violet-500/20 bg-violet-500/5 hover:bg-violet-500/10 text-ink-2 hover:text-ink-0 transition-colors"
              >
                <Bell size={15} />
                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-mint-400 shadow-glow-mint-sm" />
              </button>

              {/* Language (instant switch — no reload) */}
              <button
                type="button"
                onClick={switchLanguage}
                aria-label={ar ? "Switch to English" : "التبديل إلى العربية"}
                className="w-9 h-9 grid place-items-center rounded-lg border border-violet-500/20 bg-violet-500/5 hover:bg-violet-500/10 text-ink-2 hover:text-ink-0 text-xs font-bold transition-colors"
              >
                {langPending ? (
                  <Loader2 size={15} className="animate-spin" />
                ) : other === "en" ? (
                  "EN"
                ) : (
                  "ع"
                )}
              </button>

              {/* Theme */}
              <button
                onClick={toggleTheme}
                aria-label={T("theme")}
                className="w-9 h-9 grid place-items-center rounded-lg border border-violet-500/20 bg-violet-500/5 hover:bg-violet-500/10 text-ink-2 hover:text-ink-0 transition-colors"
              >
                <AnimatePresence mode="wait" initial={false}>
                  <motion.span
                    key={theme}
                    initial={{ rotate: -90, opacity: 0, scale: 0.6 }}
                    animate={{ rotate: 0, opacity: 1, scale: 1 }}
                    exit={{ rotate: 90, opacity: 0, scale: 0.6 }}
                    transition={{ duration: 0.25 }}
                    className="grid place-items-center"
                  >
                    {theme === "dark" ? <Moon size={16} /> : <Sun size={16} />}
                  </motion.span>
                </AnimatePresence>
              </button>

              {/* Primary CTA (desktop) */}
              <Link
                href={`/${lang}/contact`}
                className="hidden lg:inline-flex items-center gap-1.5 h-9 px-4 rounded-full bg-grad-cta text-white text-xs font-semibold shadow-glow-violet-sm hover:shadow-glow-violet hover:-translate-y-0.5 transition-all"
              >
                {ar ? "ابدأ مشروعك" : "Start a project"}
                <ArrowUpRight size={13} />
              </Link>

              {/* Mobile menu toggle */}
              <button
                onClick={() => setMobileOpen((v) => !v)}
                aria-label={ar ? "القائمة" : "Menu"}
                aria-expanded={mobileOpen}
                className="lg:hidden w-9 h-9 grid place-items-center rounded-lg border border-violet-500/20 bg-violet-500/5 text-ink-0"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                >
                  <motion.path
                    d="M3 6h18"
                    animate={{ rotate: mobileOpen ? 45 : 0, y: mobileOpen ? 6 : 0 }}
                    style={{ originX: "50%", originY: "50%" }}
                    transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                  />
                  <motion.path
                    d="M3 12h18"
                    animate={{ opacity: mobileOpen ? 0 : 1 }}
                    transition={{ duration: 0.25 }}
                  />
                  <motion.path
                    d="M3 18h18"
                    animate={{ rotate: mobileOpen ? -45 : 0, y: mobileOpen ? -6 : 0 }}
                    style={{ originX: "50%", originY: "50%" }}
                    transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="fixed inset-0 z-[90] lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              className={`absolute top-16 bottom-0 w-[85%] max-w-[380px] bg-[var(--bg-1)]/95 backdrop-blur-2xl border-violet-500/20 overflow-y-auto ${ar ? "left-0 border-r" : "right-0 border-l"}`}
              initial={{ x: ar ? "-100%" : "100%" }}
              animate={{ x: 0 }}
              exit={{ x: ar ? "-100%" : "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
            >
              <div className="h-px bg-grad-signal" />
              <nav className="p-6 space-y-1">
                {cats.length > 0 && (
                  <>
                    <div className="px-3 py-2 text-[10px] font-mono uppercase tracking-widest text-ink-4">
                      {T("categories")}
                    </div>
                    {cats.map((c) => (
                      <Link
                        key={c.id}
                        href={`/${lang}/categories/${c.slug}`}
                        className="flex items-center gap-3 px-3 py-3 rounded-xl text-ink-1 hover:bg-violet-500/10 transition-colors"
                      >
                        <span className="w-8 h-8 grid place-items-center rounded-lg bg-violet-500/10 text-violet-300">
                          {c.icon || "◆"}
                        </span>
                        {pick(c, "name", lang)}
                      </Link>
                    ))}
                    <div className="h-px bg-violet-500/15 my-3" />
                  </>
                )}

                {COMPANY_LINKS.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={`/${lang}/${item.href}`}
                      className="group flex items-center gap-3 px-3 py-3 rounded-xl text-ink-1 hover:bg-violet-500/10 hover:text-ink-0 transition-colors"
                    >
                      <span className="w-8 h-8 grid place-items-center rounded-lg bg-violet-500/10 border border-violet-500/20 text-violet-300 group-hover:bg-grad-primary group-hover:text-white group-hover:border-transparent transition-all shrink-0">
                        <Icon size={15} />
                      </span>
                      <span className="flex-1">{labelOf(item)}</span>
                      <ArrowUpRight size={14} className="text-ink-4 group-hover:text-violet-300 transition-colors" />
                    </Link>
                  );
                })}

                {/* Mobile CTA */}
                <Link
                  href={`/${lang}/contact`}
                  onClick={() => setMobileOpen(false)}
                  className="mt-4 flex items-center justify-center gap-2 h-12 rounded-xl bg-grad-cta text-white text-sm font-semibold shadow-glow-violet"
                >
                  {ar ? "ابدأ مشروعك" : "Start a project"}
                  <ArrowUpRight size={15} />
                </Link>
              </nav>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>

      <CommandPalette lang={lang} cats={cats} open={cmdOpen} onClose={() => setCmdOpen(false)} />
    </>
  );
}