"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { pick, tr, safeUrl, projectCover } from "@/lib/i18n";
import type { Locale } from "@/lib/types";

type ProjectCardProps = { p: any; lang: Locale; index?: number };

function canUseNextImage(src: string): boolean {
  if (src.startsWith("/") && !src.startsWith("//")) return true;
  try {
    const url = new URL(src);
    return url.protocol === "https:" && url.hostname.endsWith(".supabase.co") &&
      url.pathname.startsWith("/storage/v1/object/public/");
  } catch {
    return false;
  }
}

export default function ProjectCard({ p, lang, index = 0 }: ProjectCardProps) {
  const T = tr(lang);
  const router = useRouter();
  const title = pick(p, "title", lang);
  const cover = projectCover(p);
  const liveUrl = safeUrl(p.live_url);
  const technologies = Array.isArray(p?.project_technologies) ? p.project_technologies : [];
  const [broken, setBroken] = useState(false);
  const href = `/${lang}/projects/${p.slug || p.id}`;
  // Prefetch only the first row. Remaining details prefetch on pointer/touch intent.
  const prefetchDetails = index < 3;
  const optimized = useMemo(() => canUseNextImage(cover), [cover]);

  useEffect(() => setBroken(false), [cover]);

  const image = cover && !broken ? (
    optimized ? (
      <Image
        src={cover}
        alt={title}
        fill
        sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 33vw"
        quality={72}
        loading="lazy"
        onError={() => setBroken(true)}
        className="object-cover transition-transform duration-700 ease-out sm:group-hover:scale-[1.035]"
      />
    ) : (
      <img
        src={cover}
        alt={title}
        loading="lazy"
        decoding="async"
        fetchPriority="low"
        onError={() => setBroken(true)}
        className="h-full w-full object-cover transition-transform duration-700 ease-out sm:group-hover:scale-[1.035]"
      />
    )
  ) : null;

  return (
    <article
      onMouseEnter={() => router.prefetch(href)}
      onTouchStart={() => router.prefetch(href)}
      className="group relative overflow-hidden rounded-3xl glass transition-transform duration-300 ease-out sm:motion-safe:hover:-translate-y-1.5"
    >
      <Link
        prefetch={prefetchDetails}
        href={href}
        className="relative block aspect-[16/10] overflow-hidden bg-violet-900/20"
        aria-label={`${T("details")} — ${title}`}
      >
        {image || (
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

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        <div className="pointer-events-none absolute top-4 right-4 rounded-full border border-violet-500/40 bg-black/70 px-3 py-1.5 text-[10px] font-mono uppercase tracking-widest text-violet-200 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 -translate-y-1">
          ↗ {T("details")}
        </div>
        {p.categories && (
          <div className="absolute bottom-4 left-4 rounded-lg border border-violet-500/40 bg-[#17132b]/90 px-3 py-1.5 text-[10px] font-mono tracking-wider text-violet-100">
            {pick(p.categories, "name", lang)}
          </div>
        )}
        {p.featured && (
          <div className="absolute top-4 left-4 rounded-lg border border-amber-500/40 bg-[#211b25]/90 px-2.5 py-1 text-[10px] font-mono tracking-wider text-amber-300">
            ★ {T("feat")}
          </div>
        )}
      </Link>

      <div className="p-5 sm:p-6">
        <h3 className="mb-3 font-display text-lg font-medium leading-snug text-ink-0 transition-colors duration-200 group-hover:text-violet-200 sm:text-xl">
          <Link href={href} prefetch={prefetchDetails}>{title}</Link>
        </h3>
        <p className="mb-4 line-clamp-2 text-sm leading-relaxed text-ink-3">{pick(p, "summary", lang)}</p>

        {technologies.length > 0 && (
          <div className="mb-5 flex flex-wrap gap-1.5">
            {technologies.slice(0, 3).map((x: any, tagIndex: number) => (
              <span key={`${x.technology}-${tagIndex}`} className="rounded-md border border-violet-500/25 bg-violet-500/10 px-2 py-1 text-[10px] font-mono uppercase tracking-wider text-violet-200">
                {x.technology}
              </span>
            ))}
          </div>
        )}

        <div className="flex flex-col gap-2 sm:flex-row">
          {liveUrl && (
            <a className="inline-flex min-h-11 flex-1 items-center justify-center gap-1.5 rounded-xl bg-grad-cta px-4 py-2.5 text-xs font-semibold text-white transition-shadow hover:shadow-glow-violet" target="_blank" rel="noopener noreferrer" href={liveUrl}>
              {T("visit")} <span className="text-sm">↗</span>
            </a>
          )}
          <Link href={href} prefetch={prefetchDetails} className={`${liveUrl ? "" : "flex-1"} inline-flex min-h-11 items-center justify-center gap-1.5 rounded-xl border border-violet-500/30 bg-violet-500/5 px-4 py-2.5 text-xs font-semibold text-ink-1 transition-colors hover:border-violet-500/50 hover:bg-violet-500/15`}>
            {T("details")}
          </Link>
        </div>
      </div>
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-[2px] origin-left scale-x-0 bg-grad-signal transition-transform duration-300 group-hover:scale-x-100" />
    </article>
  );
}
