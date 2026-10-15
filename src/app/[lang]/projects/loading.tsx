export default function ProjectsLoading() {
  return (
    <main className="projects-index min-h-screen px-5 pb-24 pt-10 md:px-8" aria-busy="true" aria-label="Loading projects">
      <div className="mx-auto max-w-7xl">
        <div className="grid min-h-[46vh] grid-cols-1 items-center gap-8 lg:grid-cols-2">
          <div className="space-y-5">
            <div className="h-3 w-32 animate-pulse rounded bg-violet-300/20" />
            <div className="h-12 max-w-xl animate-pulse rounded-xl bg-white/[0.07] md:h-16" />
            <div className="h-12 max-w-md animate-pulse rounded-xl bg-white/[0.05] md:h-16" />
            <div className="h-4 max-w-2xl animate-pulse rounded bg-white/[0.05]" />
            <div className="h-4 max-w-xl animate-pulse rounded bg-white/[0.05]" />
            <div className="flex gap-3 pt-3">
              <div className="h-12 w-44 animate-pulse rounded-xl bg-violet-400/15" />
              <div className="h-12 w-36 animate-pulse rounded-xl bg-white/[0.05]" />
            </div>
          </div>
          <div className="relative mx-auto aspect-square w-full max-w-[460px] animate-pulse rounded-full bg-[radial-gradient(circle,rgba(98,112,255,0.12),transparent_68%)]">
            <span className="absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full border border-violet-300/15" />
            <span className="absolute left-1/2 top-1/2 h-24 w-64 -translate-x-1/2 -translate-y-1/2 rotate-[-28deg] rounded-[50%] border border-mint-300/15" />
          </div>
        </div>
        <div className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {[0, 1, 2, 3, 4, 5].map((index) => (
            <div key={index} className="overflow-hidden rounded-3xl border border-white/10 p-3">
              <div className="aspect-[16/10] animate-pulse rounded-2xl bg-white/[0.05]" />
              <div className="mt-5 h-4 w-2/3 animate-pulse rounded bg-white/[0.07]" />
              <div className="mt-3 h-3 w-full animate-pulse rounded bg-white/[0.04]" />
              <div className="mt-2 h-3 w-4/5 animate-pulse rounded bg-white/[0.04]" />
            </div>
          ))}
        </div>
      </div>
      <span className="sr-only">Loading the project catalogue…</span>
    </main>
  );
}
