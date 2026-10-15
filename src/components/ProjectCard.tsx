"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { pick, tr, safeUrl, projectCover } from "@/lib/i18n";
import type { Locale } from "@/lib/types";

type ProjectCardProps = { p: any; lang: Locale; index?: number };

export default function ProjectCard({ p, lang, index = 0 }: ProjectCardProps) {
  const T = tr(lang);
  const router = useRouter();
  const title = pick(p, "title", lang);
  const cover = projectCover(p);
  const liveUrl = safeUrl(p.live_url);
  const technologies = Array.isArray(p?.project_technologies) ? p.project_technologies : [];
  const [broken, setBroken] = useState(false);
  const href = `/${lang}/projects/${p.slug || p.id}`;
  // Prefetch only the first row automatically; the rest prefetch on actual intent so a
  // long portfolio does not flood mobile connections with every detail route at once.
  const prefetchDetails = index < 3;

  return (
    <motion.article
      onMouseEnter={() => router.prefetch(href)}
      onTouchStart={() => router.prefetch(href)}
      className="group relative rounded-3xl overflow-hidden glass"
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.42, delay: Math.min(index * 0.045, 0.27), ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -8 }}
    >
      {/* Cover */}
      <Link
        prefetch={prefetchDetails}
        href={href}
        className="block relative aspect-[16/10] overflow-hidden bg-violet-900/20"
        aria-label={`${T("details")} — ${title}`}
      >
        {cover && !broken ? (
          <motion.img
            src={cover}
            alt={title}
            loading="lazy"
            decoding="async"
            onError={() => setBroken(true)}
            className="w-full h-full object-cover"
            whileHover={{ scale: 1.06 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          />
        ) : (
          <div className="relative grid h-full w-full place-items-center overflow-hidden bg-[radial-gradient(circle_at_72%_30%,rgba(99,102,241,0.36),transparent_32%),radial-gradient(circle_at_20%_88%,rgba(45,212,191,0.20),transparent_36%),linear-gradient(135deg,#101426_0%,#090d19_56%,#17132b_100%)]">
            <div className="pointer-events-none absolute h-[78%] aspect-square rounded-full border border-violet-200/20 rotate-[-24deg]" />
            <div className="pointer-events-none absolute h-[58%] aspect-square rounded-full border border-mint-200/20 rotate-[32deg] scale-x-[1.65]" />
            <div className="pointer-events-none absolute h-2 w-2 rounded-full bg-mint-200 shadow-[0_0_24px_rgba(153,246,228,0.9)] translate-x-20 -translate-y-16" />
            <div className="relative z-10 flex flex-col items-center gap-2 text-center">
              <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-mint-200/80">{p.categories ? pick(p.categories, "name", lang) : "ARCHAI / WORK"}</span>
              <span className="font-display text-5xl font-semibold tracking-tight text-white/90">{String(title).split(/\s+/).filter(Boolean).slice(0, 2).map((part: string) => part[0]).join("").toUpperCase()}</span>
              <span className="h-px w-12 bg-gradient-to-r from-transparent via-violet-200/70 to-transparent" />
            </div>
          </div>
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        {/* Corner hint */}
        <div className="absolute top-4 right-4 px-3 py-1.5 rounded-full bg-black/70 backdrop-blur-md border border-violet-500/40 text-violet-200 text-[10px] font-mono tracking-widest uppercase opacity-0 group-hover:opacity-100 -translate-y-2 group-hover:translate-y-0 transition-all duration-400">
          ↗ {T("details")}
        </div>

        {/* Category badge (always visible) */}
        {p.categories && (
          <div className="absolute bottom-4 left-4 px-3 py-1.5 rounded-lg bg-violet-500/25 backdrop-blur-md border border-violet-500/40 text-violet-100 text-[10px] font-mono tracking-wider">
            {pick(p.categories, "name", lang)}
          </div>
        )}

        {p.featured && (
          <div className="absolute top-4 left-4 px-2.5 py-1 rounded-lg bg-amber-500/20 backdrop-blur-md border border-amber-500/40 text-amber-300 text-[10px] font-mono tracking-wider">
            ★ {T("feat")}
          </div>
        )}
      </Link>

      {/* Body */}
      <div className="p-6">
        <h3 className="font-display text-xl font-medium text-ink-0 mb-3 leading-snug group-hover:text-violet-200 transition-colors duration-300">
          <Link href={href} prefetch={prefetchDetails}>{title}</Link>
        </h3>

        <p className="text-sm text-ink-3 leading-relaxed mb-4 line-clamp-2">
          {pick(p, "summary", lang)}
        </p>

        {/* Tech tags */}
        {technologies.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-5">
            {technologies.slice(0, 3).map((x: any) => (
              <span
                key={x.technology}
                className="px-2 py-1 rounded-md text-[10px] font-mono uppercase tracking-wider text-violet-200 bg-violet-500/10 border border-violet-500/25"
              >
                {x.technology}
              </span>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          {liveUrl && (
            <a
              className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-grad-cta text-white text-xs font-semibold hover:shadow-glow-violet transition-all"
              target="_blank"
              rel="noopener noreferrer"
              href={liveUrl}
            >
              {T("visit")}
              <span className="text-sm">↗</span>
            </a>
          )}
          <Link
            href={href}
            prefetch={prefetchDetails}
            className={`${
              liveUrl ? "" : "flex-1"
            } inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-violet-500/30 bg-violet-500/5 text-ink-1 text-xs font-semibold hover:bg-violet-500/15 hover:border-violet-500/50 transition-all`}
          >
            {T("details")}
          </Link>
        </div>
      </div>

      {/* Bottom glow line */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-grad-signal scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-500" />
    </motion.article>
  );
}