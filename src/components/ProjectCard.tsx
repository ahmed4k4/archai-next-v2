"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { useState } from "react";
import { pick, tr, safeUrl, projectCover } from "@/lib/i18n";
import type { Locale } from "@/lib/types";
import Scroll3DCard from "./marketing/Scroll3DCard";

type ProjectCardProps = { p: any; lang: Locale };

export default function ProjectCard({ p, lang }: ProjectCardProps) {
  const T = tr(lang);
  const title = pick(p, "title", lang);
  const cover = projectCover(p);
  const [broken, setBroken] = useState(false);
  const href = `/${lang}/projects/${p.id}`;

  return (
    <Scroll3DCard
      className="group relative rounded-3xl overflow-hidden glass"
      initial={{ opacity: 0, y: 42, rotateX: 18 }}
      whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
      viewport={{ once: true, amount: 0.18 }}
    >
      {/* Cover */}
      <Link
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
          <div className="w-full h-full grid place-items-center bg-grad-aurora opacity-30">
            <span className="text-6xl text-violet-200/60">◫</span>
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
          <Link href={href}>{title}</Link>
        </h3>

        <p className="text-sm text-ink-3 leading-relaxed mb-4 line-clamp-2">
          {pick(p, "summary", lang)}
        </p>

        {/* Tech tags */}
        {p.project_technologies?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-5">
            {p.project_technologies.slice(0, 3).map((x: any) => (
              <span
                key={x.technology}
                className="marketing-3d-chip px-2 py-1 rounded-md text-[10px] font-mono uppercase tracking-wider text-violet-200 bg-violet-500/10 border border-violet-500/25"
              >
                {x.technology}
              </span>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          {p.live_url && (
            <a
              className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-grad-cta text-white text-xs font-semibold hover:shadow-glow-violet transition-all"
              target="_blank"
              rel="noopener noreferrer"
              href={safeUrl(p.live_url)}
            >
              {T("visit")}
              <span className="text-sm">↗</span>
            </a>
          )}
          <Link
            href={href}
            className={`${
              p.live_url ? "" : "flex-1"
            } inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-violet-500/30 bg-violet-500/5 text-ink-1 text-xs font-semibold hover:bg-violet-500/15 hover:border-violet-500/50 transition-all`}
          >
            {T("details")}
          </Link>
        </div>
      </div>

      {/* Bottom glow line */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-grad-signal scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-500" />
    </Scroll3DCard>
  );
}