"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowUpRight,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Map,
  Bot,
  Globe,
  FolderKanban,
  Sparkles,
  Settings,
} from "lucide-react";
import { supabaseBrowser } from "@/lib/supabase-browser";
import { useAdminI18n } from "@/components/admin/AdminI18n";

type Stats = {
  projects: number;
  published: number;
  categories: number;
  missingSummary: number;
  missingCover: number;
};

export default function AdminTools() {
  const { t, locale } = useAdminI18n();
  const sb = supabaseBrowser();
  const ar = locale === "ar";

  const [stats, setStats] = useState<Stats>({
    projects: 0,
    published: 0,
    categories: 0,
    missingSummary: 0,
    missingCover: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      sb.from("projects").select("status,summary_ar,summary_en,cover_image"),
      sb.from("categories").select("id"),
    ]).then(([p, c]) => {
      const rows = p.data || [];
      setStats({
        projects: rows.length,
        published: rows.filter((x: any) => x.status === "published").length,
        categories: c.data?.length || 0,
        missingSummary: rows.filter(
          (x: any) =>
            x.status === "published" && (!x.summary_en || !x.summary_ar)
        ).length,
        missingCover: rows.filter(
          (x: any) => x.status === "published" && !x.cover_image
        ).length,
      });
      setLoading(false);
    });
  }, [sb]);

  const check = (
    ok: boolean,
    label: string,
    desc: string,
    href?: string
  ) => (
    <div className="health-row" key={label}>
      <span className={ok ? "health-icon good" : "health-icon warn"}>
        {ok ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
      </span>
      <div>
        <strong>{label}</strong>
        <p>{desc}</p>
      </div>
      {href ? (
        <Link href={href} className="text-xs text-violet-300 hover:underline">
          {ar ? "إصلاح" : "Fix"} ↗
        </Link>
      ) : (
        <span className={ok ? "health-status good" : "health-status warn"}>
          {ok ? (ar ? "جيد" : "Good") : ar ? "يحتاج مراجعة" : "Review"}
        </span>
      )}
    </div>
  );

  const cards = [
    { label: t("publicProjects"), value: stats.published, icon: FolderKanban },
    { label: t("categoriesPublic"), value: stats.categories, icon: Sparkles },
    {
      label: ar ? "ملخصات ناقصة" : "Missing summaries",
      value: stats.missingSummary,
      icon: AlertTriangle,
    },
    {
      label: ar ? "صور أغلفة ناقصة" : "Missing cover images",
      value: stats.missingCover,
      icon: AlertTriangle,
    },
  ];

  const tools = [
    {
      href: "/admin/projects",
      icon: FolderKanban,
      title: t("projects"),
      desc: ar ? "إدارة البيانات والنشر" : "Manage content and publishing",
    },
    {
      href: "/admin/categories",
      icon: Sparkles,
      title: t("categories"),
      desc: ar ? "تنظيم أقسام الموقع" : "Organize site categories",
    },
    {
      href: "/admin/settings",
      icon: Settings,
      title: t("settings"),
      desc: ar ? "ضبط العنوان والوصف" : "Configure title and description",
    },
    {
      href: "/sitemap.xml",
      icon: Map,
      title: t("sitemap"),
      desc: ar ? "فتح خريطة الموقع" : "Open generated sitemap",
      external: true,
    },
    {
      href: "/robots.txt",
      icon: Bot,
      title: t("robots"),
      desc: ar ? "مراجعة تعليمات محركات البحث" : "Review crawler directives",
      external: true,
    },
    {
      href: "/en",
      icon: Globe,
      title: t("openSite"),
      desc: ar ? "معاينة النسخة الإنجليزية" : "Preview English site",
      external: true,
    },
  ];

  return (
    <div className="admin-dashboard">
      <div className="admin-page-head">
        <div>
          <span className="admin-kicker">WORKSPACE / UTILITIES</span>
          <h2>{t("siteTools")}</h2>
          <p>{t("toolsDesc")}</p>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {cards.map((c, i) => {
          const Icon = c.icon;
          return (
            <motion.div
              key={c.label}
              className="admin-panel"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-ink-3">{c.label}</span>
                <span className="w-8 h-8 grid place-items-center rounded-lg bg-violet-500/15 text-violet-300">
                  <Icon size={14} />
                </span>
              </div>
              <div className="font-display text-3xl font-medium text-ink-0">
                {loading ? "—" : c.value}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Two-column grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Content health */}
        <motion.section
          className="admin-panel"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="admin-section-title">
            <div>
              <span className="admin-kicker">01 / CONTENT HEALTH</span>
              <h3>{ar ? "فحص جودة المحتوى" : "Content quality check"}</h3>
            </div>
          </div>

          {check(
            !loading && stats.published > 0,
            ar ? "وجود مشاريع منشورة" : "Published content",
            ar
              ? `${stats.published} مشروع منشور من إجمالي ${stats.projects}.`
              : `${stats.published} published out of ${stats.projects} total projects.`
          )}
          {check(
            stats.missingSummary === 0,
            ar ? "الملخصات ثنائية اللغة" : "Bilingual summaries",
            ar
              ? `${stats.missingSummary} مشروع يحتاج استكمال ملخص.`
              : `${stats.missingSummary} projects need a summary update.`,
            stats.missingSummary > 0 ? "/admin/projects" : undefined
          )}
          {check(
            stats.missingCover === 0,
            ar ? "صور المشاريع" : "Project cover images",
            ar
              ? `${stats.missingCover} مشروع بدون صورة غلاف.`
              : `${stats.missingCover} projects have no cover image.`,
            stats.missingCover > 0 ? "/admin/projects" : undefined
          )}

          <p className="admin-muted-note mt-4">
            {ar
              ? "هذه مراجعة محلية لبيانات المحتوى، وليست فحصًا أمنيًا أو اختبارًا للأداء."
              : "This checks content records only; it is not a security audit or performance test."}
          </p>
        </motion.section>

        {/* Quick links */}
        <motion.section
          className="admin-panel"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="admin-section-title">
            <div>
              <span className="admin-kicker">02 / QUICK LINKS</span>
              <h3>{ar ? "روابط الإدارة" : "Management shortcuts"}</h3>
            </div>
          </div>

          <div className="space-y-1">
            {tools.map((tool) => {
              const Icon = tool.icon;
              const Comp: any = tool.external ? "a" : Link;
              const extra = tool.external
                ? { target: "_blank", rel: "noreferrer" }
                : {};
              return (
                <Comp
                  key={tool.href}
                  href={tool.href}
                  {...extra}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-violet-500/10 transition-colors group"
                >
                  <span className="w-10 h-10 grid place-items-center rounded-xl bg-violet-500/15 text-violet-300 group-hover:bg-grad-primary group-hover:text-white transition-all">
                    <Icon size={16} />
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-ink-0">
                      {tool.title}
                    </div>
                    <div className="text-xs text-ink-3 mt-0.5">{tool.desc}</div>
                  </div>
                  <ArrowUpRight
                    size={14}
                    className="text-ink-4 group-hover:text-violet-300 transition-colors"
                  />
                </Comp>
              );
            })}
          </div>
        </motion.section>
      </div>
    </div>
  );
}