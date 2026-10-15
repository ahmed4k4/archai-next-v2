"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

export default function ProjectsError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const pathname = usePathname();
  const lang = pathname.startsWith("/en") ? "en" : "ar";
  const ar = lang === "ar";

  useEffect(() => {
    console.error("[projects-route] rendering failed:", error);
  }, [error]);

  return (
    <main data-route-ready="true" lang={lang} dir={ar ? "rtl" : "ltr"} className="wrap flex min-h-[65vh] items-center justify-center py-20">
      <section className="glass w-full max-w-2xl rounded-3xl p-8 text-center md:p-12" role="alert">
        <span className="mx-auto mb-5 grid size-14 place-items-center rounded-2xl border border-rose-400/25 bg-rose-400/10 text-rose-300" aria-hidden="true">!</span>
        <p className="mb-3 text-xs font-mono uppercase tracking-[0.2em] text-mint-300">ARCHAI / WORK</p>
        <h1 className="font-display text-3xl font-semibold text-ink-0 md:text-4xl">
          {ar ? "تعذر تحميل المشروعات" : "Projects could not be loaded"}
        </h1>
        <p className="mx-auto mt-4 max-w-xl leading-8 text-ink-3">
          {ar
            ? "حدث خطأ غير متوقع أثناء عرض الأرشيف. جرّب إعادة التحميل؛ وستظل بقية صفحات الموقع متاحة."
            : "An unexpected error interrupted the project archive. Try loading the archive again; the rest of the site remains available."}
        </p>
        {process.env.NODE_ENV !== "production" && error?.message ? (
          <pre className="mx-auto mt-5 max-w-full overflow-auto rounded-xl border border-rose-400/20 bg-black/20 p-3 text-start text-xs leading-6 text-rose-200/90">
            {error.message}
          </pre>
        ) : null}
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <button type="button" onClick={reset} className="btn-primary">
            {ar ? "إعادة المحاولة" : "Try again"} ↻
          </button>
          <Link href={`/${lang}`} className="btn-ghost">{ar ? "العودة للرئيسية" : "Back home"} ↗</Link>
        </div>
      </section>
    </main>
  );
}
