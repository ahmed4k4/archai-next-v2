"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { pick, tr } from "@/lib/i18n";
import type { Locale } from "@/lib/types";

type Cmd = { id: string; label: string; href: string; section: string; icon?: string };

export default function CommandPalette({
  lang,
  cats,
  open,
  onClose,
}: {
  lang: Locale;
  cats: any[];
  open: boolean;
  onClose: () => void;
}) {
  const T = tr(lang);
  const ar = lang === "ar";
  const router = useRouter();
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!open) setQuery("");
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const commands: Cmd[] = useMemo(() => {
    const pages: Cmd[] = [
      { id: "home", label: T("home"), href: `/${lang}`, section: ar ? "صفحات" : "Pages", icon: "⌂" },
      { id: "projects", label: T("projects"), href: `/${lang}#list`, section: ar ? "صفحات" : "Pages", icon: "◫" },
      { id: "services", label: T("services"), href: `/${lang}/services`, section: ar ? "صفحات" : "Pages", icon: "⌘" },
      { id: "industries", label: T("industries"), href: `/${lang}/industries`, section: ar ? "صفحات" : "Pages", icon: "▦" },
      { id: "about", label: T("about"), href: `/${lang}/about`, section: ar ? "الشركة" : "Company", icon: "◉" },
      { id: "process", label: T("process"), href: `/${lang}/process`, section: ar ? "الشركة" : "Company", icon: "⌁" },
      { id: "insights", label: T("insights"), href: `/${lang}/insights`, section: ar ? "الشركة" : "Company", icon: "✧" },
      { id: "case-studies", label: ar ? "دراسات الحالة" : "Case studies", href: `/${lang}/case-studies`, section: ar ? "الشركة" : "Company", icon: "◈" },
      { id: "careers", label: ar ? "الوظائف" : "Careers", href: `/${lang}/careers`, section: ar ? "الشركة" : "Company", icon: "✳" },
      { id: "faq", label: ar ? "الأسئلة الشائعة" : "FAQ", href: `/${lang}/faq`, section: ar ? "الشركة" : "Company", icon: "?" },
      { id: "contact", label: T("contact"), href: `/${lang}/contact`, section: ar ? "الشركة" : "Company", icon: "✉" },
    ];
    const catCmds: Cmd[] = cats.map((c) => ({
      id: `cat-${c.id}`,
      label: pick(c, "name", lang),
      href: `/${lang}/categories/${c.slug}`,
      section: T("categories"),
      icon: c.icon || "◆",
    }));
    return [...pages, ...catCmds];
  }, [lang, cats, T, ar]);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return commands;
    return commands.filter(
      (c) =>
        c.label.toLowerCase().includes(q) ||
        c.href.toLowerCase().includes(q) ||
        c.section.toLowerCase().includes(q)
    );
  }, [commands, query]);

  const grouped = useMemo(() => {
    const map = new Map<string, Cmd[]>();
    filtered.forEach((c) => {
      if (!map.has(c.section)) map.set(c.section, []);
      map.get(c.section)!.push(c);
    });
    return Array.from(map.entries());
  }, [filtered]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[200] flex items-start justify-center pt-[12vh] px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
            onClick={onClose}
            aria-hidden
          />
          <motion.div
            className="relative w-full max-w-[600px] rounded-2xl bg-[var(--bg-1)] border border-violet-500/25 shadow-[0_40px_100px_rgba(0,0,0,0.5)] overflow-hidden"
            initial={{ opacity: 0, y: -16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16, scale: 0.97 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="flex items-center gap-3 px-5 py-4 border-b border-violet-500/15">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-ink-4">
                <circle cx="11" cy="11" r="7" />
                <path d="M21 21l-4-4" />
              </svg>
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={ar ? "ابحث عن صفحة..." : "Search pages..."}
                className="flex-1 bg-transparent border-0 outline-0 text-ink-0 placeholder:text-ink-4 text-base"
              />
              <kbd className="px-2 py-1 rounded border border-violet-500/20 text-[10px] font-mono text-ink-4">
                ESC
              </kbd>
            </div>

            <div className="max-h-[55vh] overflow-y-auto p-2">
              {grouped.length === 0 ? (
                <div className="py-12 text-center text-ink-4 text-sm">
                  {ar ? "لا توجد نتائج" : "No results"}
                </div>
              ) : (
                grouped.map(([section, items]) => (
                  <div key={section} className="mb-2">
                    <div className="px-3 py-2 text-[10px] font-mono uppercase tracking-widest text-ink-4">
                      {section}
                    </div>
                    {items.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => {
                          router.push(c.href);
                          onClose();
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-violet-500/10 text-ink-2 hover:text-ink-0 transition-colors text-left"
                      >
                        <span className="w-8 h-8 grid place-items-center rounded-lg bg-violet-500/10 text-violet-300 text-sm">
                          {c.icon}
                        </span>
                        <span className="flex-1 text-sm">{c.label}</span>
                        <span className="text-ink-4 text-xs font-mono">↵</span>
                      </button>
                    ))}
                  </div>
                ))
              )}
            </div>

            <div className="flex justify-between items-center px-5 py-3 border-t border-violet-500/15 text-[10px] font-mono uppercase tracking-widest text-ink-4">
              <span>{ar ? "تنقل سريع" : "Quick navigation"}</span>
              <span>ARCHAI COMMAND</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}