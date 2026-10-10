"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { pick, tr } from "@/lib/i18n";
import type { Locale } from "@/lib/types";
import { Reveal } from "./motion";
import { fadeUp, staggerSlow, viewportOnce } from "@/lib/motion";

type FooterProps = { lang: Locale; cats: any[] };

export default function Footer({ lang, cats }: FooterProps) {
  const T = tr(lang);
  const ar = lang === "ar";

  return (
    <footer className="relative overflow-hidden mt-20">
      {/* Top border glow */}
      <div className="h-px bg-grad-signal opacity-60" />

      {/* Background nebula */}
      <div className="absolute inset-0 nebula opacity-25 pointer-events-none" aria-hidden />

      <div className="wrap relative z-10 py-16 lg:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-16">
          {/* Brand */}
          <div className="lg:col-span-2">
            <motion.div
              className="flex items-center gap-3 mb-6"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={viewportOnce}
              transition={{ duration: 0.6 }}
            >
              <div className="w-10 h-10 rounded-xl overflow-hidden">
                <img src="/assets/logo.png" alt="Archai" className="w-full h-full object-contain" />
              </div>
              <div>
                <div className="font-mono text-xs font-bold tracking-[0.2em] text-ink-0">ARCHAI</div>
                <div className="font-mono text-[9px] tracking-[0.15em] text-ink-4">
                  INTEGRATED SYSTEMS
                </div>
              </div>
            </motion.div>

            <motion.h3
              className="font-display text-2xl lg:text-3xl font-medium tracking-tight text-ink-0 mb-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={viewportOnce}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              {ar ? "نصمم ونبني ما" : "We design and build what"}
              <br />
              <span className="bg-grad-text-light dark:bg-grad-text bg-clip-text text-transparent">
                {ar ? "يستخدمه العالم." : "the world relies on."}
              </span>
            </motion.h3>

            <motion.p
              className="text-sm text-ink-3 leading-relaxed max-w-md"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={viewportOnce}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              {T("footerAbout")}
            </motion.p>

            {/* Social mini strip */}
            <div className="flex gap-2 mt-6">
              {["in", "X", "GH"].map((s, i) => (
                <motion.a
                  key={s}
                  href="#"
                  aria-label={s}
                  className="w-9 h-9 grid place-items-center rounded-lg border border-violet-500/20 bg-violet-500/5 text-ink-3 hover:text-violet-300 hover:border-violet-500/40 transition-colors font-mono text-xs"
                  whileHover={{ y: -3 }}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={viewportOnce}
                  transition={{ delay: 0.3 + i * 0.05 }}
                >
                  {s}
                </motion.a>
              ))}
            </div>
          </div>

          {/* Site links */}
          <div>
            <div className="font-mono text-[10px] uppercase tracking-widest text-violet-300 mb-4">
              {T("footerLinks")}
            </div>
            <ul className="space-y-2.5">
              {[
                { href: `/${lang}`, label: T("home") },
                { href: `/${lang}#list`, label: T("projects") },
                { href: `/${lang}/services`, label: T("services") },
                { href: `/${lang}/industries`, label: T("industries") },
                { href: `/${lang}/about`, label: T("about") },
                { href: `/${lang}/process`, label: T("process") },
                { href: `/${lang}/insights`, label: T("insights") },
                { href: `/${lang}/case-studies`, label: lang === "ar" ? "دراسات الحالة" : "Case studies" },
                { href: `/${lang}/careers`, label: lang === "ar" ? "الوظائف" : "Careers" },
                { href: `/${lang}/faq`, label: lang === "ar" ? "الأسئلة الشائعة" : "FAQ" },
                { href: `/${lang}/contact`, label: T("contact") },
              ].map((item, i) => (
                <motion.li
                  key={item.href}
                  initial={{ opacity: 0, x: ar ? 12 : -12 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={viewportOnce}
                  transition={{ delay: i * 0.04 }}
                >
                  <Link
                    href={item.href}
                    className="text-sm text-ink-3 hover:text-ink-0 transition-colors inline-flex items-center gap-1 group"
                  >
                    <span className="w-0 group-hover:w-3 h-px bg-mint-400 transition-all duration-300" />
                    {item.label}
                  </Link>
                </motion.li>
              ))}
            </ul>
          </div>

          {/* Categories / Contact */}
          <div>
            {cats.length > 0 && (
              <>
                <div className="font-mono text-[10px] uppercase tracking-widest text-mint-300 mb-4">
                  {T("categories")}
                </div>
                <ul className="space-y-2.5 mb-8">
                  {cats.slice(0, 4).map((c) => (
                    <li key={c.id}>
                      <Link
                        href={`/${lang}/categories/${c.slug}`}
                        className="text-sm text-ink-3 hover:text-ink-0 transition-colors inline-flex items-center gap-2"
                      >
                        <span className="text-violet-300">{c.icon || "◆"}</span>
                        {pick(c, "name", lang)}
                      </Link>
                    </li>
                  ))}
                </ul>
              </>
            )}

            <div className="font-mono text-[10px] uppercase tracking-widest text-violet-300 mb-4">
              {T("footerContact")}
            </div>
            <a
              href="mailto:info@archai.com"
              className="text-sm text-ink-3 hover:text-ink-0 transition-colors"
            >
              info@archai.com
            </a>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-16 pt-6 border-t border-violet-500/15 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-ink-4 font-mono">
          <div>
            {T("footerRights").replace("{year}", String(new Date().getFullYear()))}
          </div>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-mint-400 animate-pulse" />
            {T("footerLocation")}
          </div>
        </div>
      </div>

      {/* Marquee strip */}
      <div className="border-t border-violet-500/15 py-4 overflow-hidden">
        <motion.div
          className="flex gap-12 whitespace-nowrap"
          animate={{ x: ar ? ["0%", "50%"] : ["0%", "-50%"] }}
          transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
        >
          {Array.from({ length: 20 }).map((_, i) => (
            <span
              key={i}
              className="text-[10px] font-mono uppercase tracking-[0.3em] text-ink-4 flex items-center gap-3"
            >
              <span className="w-1 h-1 rounded-full bg-violet-400" />
              {ar ? "برمجيات · ذكاء اصطناعي · أنظمة مدمجة · إنترنت الأشياء" : "SOFTWARE · AI · EMBEDDED · IOT"}
            </span>
          ))}
        </motion.div>
      </div>
    </footer>
  );
}