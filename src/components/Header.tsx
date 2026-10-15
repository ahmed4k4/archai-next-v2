"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, useTransition, useCallback, type MouseEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";
import {
  Search,
  Sun,
  Moon,
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
import type { Locale, SiteSettings } from "@/lib/types";
import { resolveSiteNavigation, type SiteNavigationItem } from "@/lib/site-navigation";
import CommandPalette from "./CommandPalette";

type HeaderProps = {
  lang: Locale;
  cats: any[];
  settings?: SiteSettings;
};

type NavItem = SiteNavigationItem & { icon: LucideIcon };

const ICON_BY_ROUTE: Record<string, LucideIcon> = {
  about: Building2,
  services: Layers,
  projects: Briefcase,
  industries: Cpu,
  process: Workflow,
  insights: BookOpen,
  "case-studies": Briefcase,
  careers: Briefcase,
  faq: HelpCircle,
  contact: Mail,
};

function safeBrandImage(value: unknown): string {
  if (typeof value !== "string" || !value.trim()) return "/assets/logo.png";
  const input = value.trim();
  if (input.startsWith("/") && !input.startsWith("//")) return input;
  try {
    const parsed = new URL(input);
    return parsed.protocol === "https:" || parsed.protocol === "http:" ? parsed.toString() : "/assets/logo.png";
  } catch {
    return "/assets/logo.png";
  }
}

type StableNavLinkProps = {
  href: string;
  label: string;
  active: boolean;
  onIntent: (href: string) => void;
};

/** Stable component identity prevents the primary navigation links from remounting
 * whenever Header state changes (scroll, theme, menus). Prefetching on pointer/focus
 * also avoids a cold first click on the projects route in production. */
function StableNavLink({ href, label, active, onIntent }: StableNavLinkProps) {
  const prefetchRoute = () => onIntent(href);
  const className = `group relative rounded-lg px-3 py-2 text-sm transition-colors hover:bg-violet-500/10 ${
    active ? "font-semibold text-ink-0" : "font-medium text-ink-2 hover:text-ink-0"
  }`;
  const indicator = (
    <span
      className={`pointer-events-none absolute bottom-1 left-3 right-3 h-px origin-center bg-grad-signal transition-transform duration-300 ${
        active ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
      }`}
    />
  );

  // Keep all localized routes on the App Router so transitions start immediately and
  // the destination can be prefetched instead of forcing a slow full-document reload.
  return (
    <Link href={href} prefetch={true} onMouseEnter={prefetchRoute} onPointerDown={prefetchRoute} onFocus={prefetchRoute}
      aria-current={active ? "page" : undefined} className={className}>
      {label}
      {indicator}
    </Link>
  );
}

export default function Header({ lang, cats, settings }: HeaderProps) {
  const T = tr(lang);
  const ar = lang === "ar";
  const settingsRoot = (settings || {}) as Record<string, unknown>;
  const companyName = typeof settingsRoot.company_name === "string" && settingsRoot.company_name.trim()
    ? settingsRoot.company_name.trim()
    : "ARCHAI";
  const brandTagline = (ar ? settingsRoot.brand_tagline_ar : settingsRoot.brand_tagline_en);
  const companyTagline = typeof brandTagline === "string" && brandTagline.trim()
    ? brandTagline.trim()
    : "INTEGRATED SYSTEMS";
  const logoUrl = safeBrandImage(settingsRoot.logo_url);
  const configuredNavigation = resolveSiteNavigation(settingsRoot.navigation);
  const companyLinks: NavItem[] = configuredNavigation.map((item) => ({
    ...item,
    icon: ICON_BY_ROUTE[item.href] || Briefcase,
  }));
  const primaryLinks = companyLinks.filter((item) => ["services", "industries", "projects"].includes(item.href));
  const dropdownLinks = companyLinks.filter((item) => !["services", "industries", "projects"].includes(item.href));
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
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("archai:navigation-intent", { detail: { href: newPath } }));
    }
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
    setTheme(v);
    try {
      localStorage.theme = v;
    } catch {}
  };

  const closeNavigationMenus = useCallback(() => {
    setCompanyOpen(false);
    setCatsOpen(false);
    setMobileOpen(false);
  }, []);

  const handleInternalLinkClick = useCallback((event: MouseEvent<HTMLAnchorElement>) => {
    // Keep Next Link's native App Router interception intact. Do not preventDefault or
    // call router.push here: Link must remain the single owner of this navigation.
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    closeNavigationMenus();
  }, [closeNavigationMenus]);

  const labelOf = (item: NavItem) => (ar ? item.labelAr : item.labelEn) || item.href;

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

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
                  src={logoUrl}
                  alt={companyName}
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
                  {companyName.toLocaleUpperCase(ar ? "ar" : "en")}
                </div>
                <div className="font-mono text-[9px] tracking-[0.15em] text-ink-4">
                  {companyTagline}
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
                        exit={{ opacity: 0, y: -8, pointerEvents: "none" }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="w-[420px] p-3 rounded-2xl bg-[var(--bg-1)] border border-violet-500/20 shadow-[0_24px_64px_rgba(0,0,0,0.4)] backdrop-blur-2xl">
                          <div className="grid grid-cols-2 gap-1.5">
                            {cats.map((c) => (
                              <Link
                                key={c.id}
                                href={`/${lang}/categories/${c.slug}`}
                                onMouseEnter={() => router.prefetch(`/${lang}/categories/${c.slug}`)}
                                onTouchStart={() => router.prefetch(`/${lang}/categories/${c.slug}`)}
                                onFocus={() => router.prefetch(`/${lang}/categories/${c.slug}`)}
                                onClick={handleInternalLinkClick}
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

              {primaryLinks.map((item) => {
                const href = `/${lang}/${item.href}`;
                return (
                  <StableNavLink
                    key={item.href}
                    href={href}
                    label={labelOf(item)}
                    active={isActive(href)}
                    onIntent={(target) => router.prefetch(target)}
                  />
                );
              })}

              {/* Company dropdown */}
              {dropdownLinks.length > 0 && <div
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
                      exit={{ opacity: 0, y: -8, pointerEvents: "none" }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="w-[300px] p-2 rounded-2xl bg-[var(--bg-1)] border border-violet-500/20 shadow-[0_24px_64px_rgba(0,0,0,0.4)] backdrop-blur-2xl">
                        <div className="grid grid-cols-2 gap-1">
                          {dropdownLinks.map((item) => {
                            const Icon = item.icon;
                            return (
                              <Link
                                key={item.href}
                                href={`/${lang}/${item.href}`}
                                onMouseEnter={() => router.prefetch(`/${lang}/${item.href}`)}
                                onTouchStart={() => router.prefetch(`/${lang}/${item.href}`)}
                                onFocus={() => router.prefetch(`/${lang}/${item.href}`)}
                                onClick={handleInternalLinkClick}
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
              </div>}
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
                        onMouseEnter={() => router.prefetch(`/${lang}/categories/${c.slug}`)}
                        onTouchStart={() => router.prefetch(`/${lang}/categories/${c.slug}`)}
                        onFocus={() => router.prefetch(`/${lang}/categories/${c.slug}`)}
                        onClick={handleInternalLinkClick}
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

                {companyLinks.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={`/${lang}/${item.href}`}
                      onMouseEnter={() => router.prefetch(`/${lang}/${item.href}`)}
                      onTouchStart={() => router.prefetch(`/${lang}/${item.href}`)}
                      onFocus={() => router.prefetch(`/${lang}/${item.href}`)}
                      onClick={handleInternalLinkClick}
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
                  onClick={handleInternalLinkClick}
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