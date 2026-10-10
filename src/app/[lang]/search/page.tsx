import Link from "next/link";
import type { Metadata } from "next";
import { getHome } from "@/lib/data";
import { pick } from "@/lib/i18n";
import type { Locale } from "@/lib/types";
import { SITE_URL } from "@/lib/supabase";

export const revalidate = 60;

export async function generateMetadata({ params, searchParams }: { params: { lang: string }; searchParams: { q?: string } }): Promise<Metadata> {
  const lang = params.lang as Locale;
  const q = (searchParams.q || "").trim();
  const title = lang === "ar" ? `بحث${q ? ` عن ${q}` : ""}` : `Search${q ? ` for ${q}` : ""}`;
  return {
    title,
    description: lang === "ar" ? "ابحث داخل مشاريع وحلول Archai Solutions." : "Search Archai Solutions projects and solutions.",
    robots: { index: false, follow: true },
    alternates: { canonical: `${SITE_URL}/${lang}/search` },
  };
}

export default async function SearchPage({ params, searchParams }: { params: { lang: string }; searchParams: { q?: string } }) {
  const lang = params.lang as Locale;
  const q = (searchParams.q || "").trim().toLowerCase();
  const { projects } = await getHome();
  const results = q
    ? projects.filter((p) => {
        const haystack = [pick(p, "title", lang), pick(p, "summary", lang), pick(p, "description", lang), ...(p.project_technologies || []).map((x) => x.technology), ...(p.project_industries || []).map((x) => x.industry)].join(" ").toLowerCase();
        return haystack.includes(q);
      })
    : projects.slice(0, 12);

  return (
    <main className="wrap py-20 min-h-[70vh]" dir={lang === "ar" ? "rtl" : "ltr"}>
      <p className="section-kicker">{lang === "ar" ? "بحث الموقع" : "SITE SEARCH"}</p>
      <h1 className="section-title">{lang === "ar" ? "ابحث في مشاريعنا" : "Search our work"}</h1>
      <form className="mt-8 flex gap-3 max-w-3xl" action={`/${lang}/search`}>
        <input name="q" defaultValue={searchParams.q || ""} className="flex-1 rounded-2xl border border-violet-500/20 bg-white/70 dark:bg-white/5 px-5 py-4 text-ink-0 outline-none focus:border-violet-500" placeholder={lang === "ar" ? "مثال: AI أو Next.js أو ERP" : "Try AI, Next.js, ERP…"} />
        <button className="btn-primary" type="submit">{lang === "ar" ? "بحث" : "Search"}</button>
      </form>
      <div className="mt-12 grid md:grid-cols-2 lg:grid-cols-3 gap-5">
        {results.map((p) => (
          <Link key={p.id} href={`/${lang}/projects/${p.id}`} className="glass p-6 block hover:-translate-y-1 transition-transform">
            <div className="text-xs font-mono text-violet-300">{p.categories?.name_en || "ARCHAI"}</div>
            <h2 className="mt-3 text-xl font-semibold text-ink-0">{pick(p, "title", lang)}</h2>
            <p className="mt-2 text-sm text-ink-3 line-clamp-3">{pick(p, "summary", lang)}</p>
          </Link>
        ))}
      </div>
      {!results.length && <p className="mt-12 text-ink-3">{lang === "ar" ? "لم نجد نتائج مطابقة." : "No matching results."}</p>}
    </main>
  );
}
