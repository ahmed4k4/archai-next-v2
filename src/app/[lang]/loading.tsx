/** Lightweight segment-level fallback so slow CMS/database reads never leave a blank route. */
export default function LocalePageLoading() {
  return (
    <main
      className="wrap min-h-[calc(100svh-76px)] py-10 md:py-16"
      aria-busy="true"
      aria-label="Loading page"
      data-route-loading="true"
    >
      <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-[1.05fr_.95fr] lg:gap-12">
        <section className="space-y-5" aria-hidden="true">
          <div className="h-3 w-32 animate-pulse rounded bg-violet-300/20" />
          <div className="h-11 max-w-2xl animate-pulse rounded-xl bg-white/[0.07] sm:h-14 md:h-16" />
          <div className="h-11 max-w-xl animate-pulse rounded-xl bg-white/[0.05] sm:h-14 md:h-16" />
          <div className="space-y-3 pt-2">
            <div className="h-4 max-w-2xl animate-pulse rounded bg-white/[0.055]" />
            <div className="h-4 max-w-xl animate-pulse rounded bg-white/[0.045]" />
          </div>
          <div className="flex flex-wrap gap-3 pt-3">
            <div className="h-11 w-36 animate-pulse rounded-xl bg-violet-300/15" />
            <div className="h-11 w-32 animate-pulse rounded-xl bg-white/[0.05]" />
          </div>
        </section>
        <div className="mx-auto aspect-square w-full max-w-[260px] animate-pulse rounded-full bg-[radial-gradient(circle,rgba(98,112,255,0.13),transparent_68%)] sm:max-w-[340px] lg:max-w-[440px]" aria-hidden="true" />
      </div>
      <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3" aria-hidden="true">
        {[0, 1, 2].map((item) => (
          <div key={item} className="rounded-2xl border border-white/10 p-4 sm:p-5">
            <div className="aspect-[16/8] animate-pulse rounded-xl bg-white/[0.05]" />
            <div className="mt-5 h-4 w-2/3 animate-pulse rounded bg-white/[0.07]" />
            <div className="mt-3 h-3 w-full animate-pulse rounded bg-white/[0.04]" />
            <div className="mt-2 h-3 w-4/5 animate-pulse rounded bg-white/[0.04]" />
          </div>
        ))}
      </div>
      <span className="sr-only">Loading the requested page…</span>
    </main>
  );
}
