"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  FolderKanban,
  FileText,
  Eye,
  Star,
  Users,
  TrendingUp,
  Plus,
  ArrowUpRight,
  Sparkles,
} from "lucide-react";
import { supabaseBrowser } from "@/lib/supabase-browser";
import { useAdminI18n } from "@/components/admin/AdminI18n";
import { AnimatedNumber } from "@/components/motion";
import { VisitorsArea } from "@/components/admin/AnalyticsChart";

type Stats = {
  total_projects: number;
  published_projects: number;
  featured_projects: number;
  sessions: number;
  project_views: number;
};

export default function AdminHome() {
  const { t, locale } = useAdminI18n();
  const sb = supabaseBrowser();
  const ar = locale === "ar";

  const [stats, setStats] = useState<Stats>({
    total_projects: 0,
    published_projects: 0,
    featured_projects: 0,
    sessions: 0,
    project_views: 0,
  });
  const [series, setSeries] = useState<any[]>([]);
  const [recentProjects, setRecentProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let alive = true;
    (async () => {
      const [overview, dash, recent] = await Promise.all([
        sb.rpc("admin_overview"),
        sb.rpc("analytics_dashboard", {
          p_from: new Date(Date.now() - 14 * 864e5).toISOString(),
          p_to: new Date().toISOString(),
          p_bucket: "day",
        }),
        sb
          .from("projects")
          .select("id, title_ar, title_en, status, featured, created_at, cover_image")
          .order("created_at", { ascending: false })
          .limit(5),
      ]);

      if (!alive) return;

      if (overview.error || !overview.data) {
        setNotice(
          ar
            ? "تعذر جلب بعض الإحصائيات؛ تحقق من دوال قاعدة البيانات."
            : "Some statistics could not be loaded. Check the database RPC functions."
        );
      } else {
        setStats(overview.data as Stats);
      }

      if (!dash.error && dash.data?.visitors_series) {
        setSeries(
          (dash.data.visitors_series as any[]).map((p) => ({
            t: new Date(p.t).toLocaleDateString(ar ? "ar" : "en", {
              month: "short",
              day: "numeric",
            }),
            visitors: Number(p.visitors) || 0,
            page_views: Number(p.page_views) || 0,
          }))
        );
      }

      setRecentProjects(recent.data || []);
      setLoading(false);
    })();
    return () => {
      alive = false;
    };
  }, [sb, ar]);

  // KPI values and supporting labels come from database RPC results only.
  // Do not manufacture trend percentages or sparkline shapes when analytics data is absent.
  const cards = [
    {
      label: t("totalProjects"),
      value: stats.total_projects,
      icon: FolderKanban,
      tone: "violet",
      description: ar ? "إجمالي السجلات في قاعدة البيانات" : "Records returned by the database",
    },
    {
      label: t("publishedProjects"),
      value: stats.published_projects,
      icon: TrendingUp,
      tone: "mint",
      description: ar ? "مشروعات منشورة للعامة" : "Projects published publicly",
    },
    {
      label: t("featuredProjects"),
      value: stats.featured_projects,
      icon: Star,
      tone: "amber",
      description: ar ? "مشروعات محددة كمميزة" : "Projects marked as featured",
    },
    {
      label: t("projectViews"),
      value: stats.project_views,
      icon: Eye,
      tone: "rose",
      description: ar ? "مشاهدات مسجلة في التحليلات" : "Views recorded by analytics",
    },
  ];

  /* Split tones so the card border/text and the gradient overlay stay independent. */
  const toneClass: Record<string, { card: string; glow: string; icon: string }> = {
    violet: {
      card: "border-violet-500/25 text-violet-300 hover:border-violet-500/50",
      glow: "from-violet-500/20 to-transparent",
      icon: "bg-violet-500/15 border-violet-500/30",
    },
    mint: {
      card: "border-mint-500/25 text-mint-300 hover:border-mint-500/50",
      glow: "from-mint-500/20 to-transparent",
      icon: "bg-mint-500/15 border-mint-500/30",
    },
    amber: {
      card: "border-amber-500/25 text-amber-400 hover:border-amber-500/50",
      glow: "from-amber-500/20 to-transparent",
      icon: "bg-amber-500/15 border-amber-500/30",
    },
    rose: {
      card: "border-rose-500/25 text-rose-400 hover:border-rose-500/50",
      glow: "from-rose-500/20 to-transparent",
      icon: "bg-rose-500/15 border-rose-500/30",
    },
  };

  return (
    <div className="admin-dashboard">
      {/* ============================================================
          HEAD
          ============================================================ */}
      <div className="admin-page-head">
        <div>
          <span className="admin-kicker">
            ARCHAI / {t("overview").toUpperCase()}
          </span>
          <h2>{t("dashboard")}</h2>
          <p>{t("dashboardDesc")}</p>
        </div>
        <Link className="admin-primary" href="/admin/projects?new=1">
          <Plus size={14} />
          {t("newProject")}
        </Link>
      </div>

      {notice && <div className="admin-notice">{notice}</div>}

      {/* ============================================================
          KPI CARDS
          ============================================================ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {cards.map((card, i) => {
          const Icon = card.icon;
          const tone = toneClass[card.tone];
          return (
            <motion.div
              key={card.label}
              className={`group relative overflow-hidden rounded-2xl border bg-[var(--ad-panel)] p-5 transition-colors ${tone.card}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -3 }}
              transition={{ delay: i * 0.08, duration: 0.5 }}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${tone.glow} opacity-50`} />
              <div className="relative">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-mono uppercase tracking-widest text-ink-3">
                    {card.label}
                  </span>
                  <span className={`w-9 h-9 grid place-items-center rounded-xl border ${tone.icon}`}>
                    <Icon size={16} />
                  </span>
                </div>
                <div className="font-display text-3xl font-medium text-ink-0 tabular-nums">
                  {loading ? "—" : <AnimatedNumber value={card.value} />}
                </div>
                <p className="mt-2 text-[10px] leading-5 text-ink-4">{card.description}</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* ============================================================
          TRAFFIC CHART
          ============================================================ */}
      {!loading && series.length > 0 && (
        <motion.div
          className="admin-panel"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <div className="admin-section-title">
            <div>
              <span className="admin-kicker">TRAFFIC / LAST 14 DAYS</span>
              <h3>{ar ? "حركة الموقع" : "Website traffic"}</h3>
            </div>
            <Link href="/admin/analytics" className="admin-secondary text-xs">
              {ar ? "كل التحليلات" : "All analytics"} ↗
            </Link>
          </div>
          <VisitorsArea data={series} />
        </motion.div>
      )}

      {/* ============================================================
          QUICK GRID + RECENT
          ============================================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
        {/* Quick actions */}
        <motion.div
          className="admin-panel lg:col-span-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <div className="admin-section-title">
            <div>
              <span className="admin-kicker">WORKSPACE</span>
              <h3>{t("contentManagement")}</h3>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              {
                href: "/admin/projects",
                icon: FolderKanban,
                title: t("projects"),
                desc: t("manageProjects"),
              },
              {
                href: "/admin/categories",
                icon: Sparkles,
                title: t("categories"),
                desc: t("manageCategories"),
              },
              {
                href: "/admin/content",
                icon: FileText,
                title: t("contentPages"),
                desc: ar ? "تحرير نصوص الصفحات والأسئلة وبيانات SEO" : "Edit page copy, FAQs, and SEO metadata",
              },
              {
                href: "/admin/analytics",
                icon: TrendingUp,
                title: t("analytics"),
                desc: t("viewAnalytics"),
              },
              {
                href: "/admin/settings",
                icon: Star,
                title: t("settings"),
                desc: t("manageSettings"),
              },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.href}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + i * 0.05 }}
                >
                  <Link
                    href={item.href}
                    className="group flex items-start gap-4 p-4 rounded-xl border border-violet-500/15 bg-[var(--ad-panel-2)] hover:border-violet-500/40 hover:-translate-y-0.5 transition-all"
                  >
                    <span className="w-10 h-10 grid place-items-center rounded-xl bg-violet-500/15 text-violet-300 shrink-0 group-hover:bg-grad-primary group-hover:text-white transition-all">
                      <Icon size={18} />
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-ink-0 text-sm">
                        {item.title}
                      </div>
                      <div className="text-xs text-ink-3 mt-1 leading-relaxed">
                        {item.desc}
                      </div>
                    </div>
                    <ArrowUpRight
                      size={16}
                      className="text-ink-4 group-hover:text-violet-300 transition-colors"
                    />
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Recent projects */}
        <motion.div
          className="admin-panel"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          <div className="admin-section-title">
            <div>
              <span className="admin-kicker">RECENT</span>
              <h3>{ar ? "أحدث المشاريع" : "Recent projects"}</h3>
            </div>
          </div>

          <div className="space-y-2">
            {loading ? (
              <div className="space-y-2">
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className="admin-skeleton h-14 w-full" />
                ))}
              </div>
            ) : recentProjects.length === 0 ? (
              <div className="empty">
                <FolderKanban />
                <b>{ar ? "لا مشاريع بعد" : "No projects yet"}</b>
                <span>
                  {ar ? "ابدأ بإضافة أول مشروع." : "Add your first project to get started."}
                </span>
              </div>
            ) : (
              recentProjects.map((p) => {
                const title =
                  (ar ? p.title_ar : p.title_en) ||
                  p.title_en ||
                  p.title_ar ||
                  "—";
                return (
                  <Link
                    key={p.id}
                    href={`/admin/projects`}
                    className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-violet-500/10 transition-colors group"
                  >
                    <div className="w-10 h-10 rounded-lg bg-black/30 overflow-hidden shrink-0">
                      {p.cover_image ? (
                        <img
                          src={p.cover_image}
                          alt={title}
                          loading="lazy"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full grid place-items-center text-ink-4 text-xs">
                          ◫
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs text-ink-1 truncate group-hover:text-violet-300 transition-colors">
                        {title}
                      </div>
                      <div className="text-[10px] font-mono text-ink-4 mt-0.5 uppercase">
                        {p.status}
                      </div>
                    </div>
                    {p.featured && <Star size={12} className="text-amber-400 shrink-0" />}
                  </Link>
                );
              })
            )}
          </div>
        </motion.div>
      </div>

      {/* ============================================================
          TIP + OPEN SITE
          ============================================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <motion.div
          className="admin-panel lg:col-span-2 flex items-start gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <span className="w-11 h-11 grid place-items-center rounded-2xl bg-violet-500/15 text-violet-300 text-xl shrink-0">
            ✦
          </span>
          <div>
            <span className="admin-kicker">{t("recentTip")}</span>
            <h3 className="mt-2">
              {ar
                ? "خلّي كل مشروع جاهز للعرض"
                : "Make every project presentation-ready"}
            </h3>
            <p className="text-sm text-ink-3 mt-2 leading-relaxed">
              {t("tipText")}
            </p>
            <Link
              href="/admin/projects"
              className="inline-flex items-center gap-1 mt-3 text-violet-300 text-xs font-medium hover:underline"
            >
              {t("projects")} <ArrowUpRight size={12} />
            </Link>
          </div>
        </motion.div>

        <motion.div
          className="admin-panel"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65 }}
        >
          <span className="admin-kicker">QUICK ACCESS</span>
          <h3 className="mt-2">
            {ar ? "معاينة الموقع" : "Public website preview"}
          </h3>
          <p className="text-sm text-ink-3 mt-2 mb-4 leading-relaxed">
            {ar
              ? "افتح الموقع في نافذة جديدة لمراجعة شكل التغييرات."
              : "Open the public website in a new tab to review your changes."}
          </p>
          <a
            href="/en"
            target="_blank"
            rel="noreferrer"
            className="admin-secondary inline-flex items-center gap-2"
          >
            {t("openSite")} ↗
          </a>
        </motion.div>
      </div>
    </div>
  );
}