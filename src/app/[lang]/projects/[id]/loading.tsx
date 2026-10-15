export default function ProjectDetailLoading() {
  return (
    <main className="wrap min-h-screen py-12" aria-busy="true" aria-label="Loading project details">
      <div className="mb-8 h-3 w-48 animate-pulse rounded bg-violet-300/15" />
      <div className="glass relative overflow-hidden rounded-3xl p-7 md:p-10">
        <div className="max-w-3xl space-y-5">
          <div className="h-4 w-28 animate-pulse rounded bg-mint-300/15" />
          <div className="h-12 max-w-2xl animate-pulse rounded-xl bg-white/[0.07] md:h-16" />
          <div className="h-4 max-w-2xl animate-pulse rounded bg-white/[0.05]" />
          <div className="h-4 max-w-xl animate-pulse rounded bg-white/[0.05]" />
          <div className="h-11 w-36 animate-pulse rounded-xl bg-violet-400/15" />
        </div>
      </div>
      <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-[2fr_1fr]">
        <div className="aspect-[16/9] animate-pulse rounded-3xl border border-white/10 bg-white/[0.035]" />
        <div className="space-y-4 rounded-3xl border border-white/10 p-7">
          {[0, 1, 2, 3, 4].map((item) => <div key={item} className="h-4 animate-pulse rounded bg-white/[0.05]" />)}
        </div>
      </div>
      <span className="sr-only">Loading project details…</span>
    </main>
  );
}
