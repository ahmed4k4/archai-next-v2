"use client";
import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase-browser";
import { useAdminI18n } from "@/components/admin/AdminI18n";
import {
  VisitorsArea,
  DevicesPie,
  TopProjectsBar,
  SourcesPie,
} from "@/components/admin/AnalyticsChart";
import { AnimatedNumber } from "@/components/motion";

export default function Analytics() {
  const { t, locale } = useAdminI18n();
  const sb = supabaseBrowser();
  const [d, setD] = useState<any>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let live = true;
    const load = async () => {
      const to = new Date().toISOString();
      const from = new Date(Date.now() - 30 * 864e5).toISOString();
      try {
        const { data, error } = await sb.rpc("analytics_dashboard", {
          p_from: from,
          p_to: to,
          p_bucket: "day",
        });
        if (!live) return;
        if (error) setError(error.message);
        else setD(data);
      } catch (requestError) {
        if (!live) return;
        setError(requestError instanceof Error ? requestError.message : (locale === "ar" ? "تعذر تحميل التحليلات." : "Could not load analytics."));
      } finally {
        if (live) setLoading(false);
      }
    };
    void load();
    return () => { live = false; };
  }, [sb, locale]);

  const metrics = [
    [t("pageViews"), d?.totals?.page_views, "◉"],
    [t("uniqueSessions"), d?.totals?.unique_sessions, "⌁"],
    [t("projectViews"), d?.totals?.project_views, "◫"],
    [t("uniqueProjectVisitors"), d?.totals?.unique_project_visitors, "↗"],
  ];

  const series = (d?.visitors_series || []).map((p: any) => ({
    t: new Date(p.t).toLocaleDateString(locale === "ar" ? "ar" : "en", {
      month: "short",
      day: "numeric",
    }),
    visitors: Number(p.visitors) || 0,
    page_views: Number(p.page_views) || 0,
  }));

  const topProjects = (d?.top_projects || [])
    .slice(0, 6)
    .map((p: any) => ({
      name:
        locale === "ar"
          ? (p.title_ar || p.title_en || "").slice(0, 20)
          : (p.title_en || p.title_ar || "").slice(0, 20),
      views: Number(p.views) || 0,
    }));

  const devices = (d?.devices || []).map((x: any) => ({
    device_type: x.device_type,
    sessions: Number(x.sessions) || 0,
  }));

  const sources = (d?.sources || []).map((x: any) => ({
    referrer_type: x.referrer_type,
    sessions: Number(x.sessions) || 0,
  }));

  return (
    <>
      <div className="admin-page-head">
        <div>
          <span className="admin-kicker">ANALYTICS / 30 DAYS</span>
          <h2>{t("analytics")}</h2>
          <p>{t("publicTraffic")}</p>
        </div>
        <span className="admin-panel-badge">● {t("last30")}</span>
      </div>

      {error && <div className="admin-error">{error}</div>}

      {/* KPI cards */}
      <div className="stat-grid">
        {metrics.map(([label, value, icon]) => (
          <div className="stat-card" key={String(label)}>
            <div className="stat-card-top">
              <span>{label}</span>
              <i>{icon}</i>
            </div>
            {loading ? (
              <strong>—</strong>
            ) : (
              <strong>
                <AnimatedNumber value={Number(value || 0)} />
              </strong>
            )}
            <small>{t("last30")}</small>
          </div>
        ))}
      </div>

      {/* Charts grid */}
      {!loading && (
        <>
          {/* Visitors + page views over time */}
          <div className="admin-panel">
            <div className="admin-section-title">
              <div>
                <span className="admin-kicker">TRAFFIC / DAILY</span>
                <h3>{locale === "ar" ? "الزيارات اليومية" : "Daily traffic"}</h3>
              </div>
              <div className="flex gap-3 text-[10px] font-mono">
                <span className="flex items-center gap-1.5 text-violet-300">
                  <span className="w-2 h-2 rounded-full bg-violet-500" />
                  Visitors
                </span>
                <span className="flex items-center gap-1.5 text-mint-300">
                  <span className="w-2 h-2 rounded-full bg-mint-400" />
                  Page views
                </span>
              </div>
            </div>
            <VisitorsArea data={series} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Top projects */}
            <div className="admin-panel">
              <div className="admin-section-title">
                <div>
                  <span className="admin-kicker">CONTENT</span>
                  <h3>{t("topProjects")}</h3>
                </div>
              </div>
              {topProjects.length ? (
                <TopProjectsBar data={topProjects} />
              ) : (
                <div className="empty">{t("noViews")}</div>
              )}
            </div>

            {/* Devices */}
            <div className="admin-panel">
              <div className="admin-section-title">
                <div>
                  <span className="admin-kicker">AUDIENCE</span>
                  <h3>{locale === "ar" ? "الأجهزة" : "Devices"}</h3>
                </div>
              </div>
              {devices.length ? (
                <div className="flex items-center gap-4">
                  <DevicesPie data={devices} />
                  <div className="space-y-2">
                    {devices.map((x, i) => (
                      <div key={x.device_type} className="flex items-center gap-2 text-xs">
                        <span
                          className="w-3 h-3 rounded-sm"
                          style={{
                            background: ["#7c5cff", "#4ce2d0", "#ad97ff"][i % 3],
                          }}
                        />
                        <span className="text-ink-3 capitalize">{x.device_type}</span>
                        <span className="text-ink-0 font-mono">{x.sessions}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="empty">—</div>
              )}
            </div>

            {/* Sources */}
            <div className="admin-panel">
              <div className="admin-section-title">
                <div>
                  <span className="admin-kicker">ACQUISITION</span>
                  <h3>{locale === "ar" ? "مصادر الزيارات" : "Traffic sources"}</h3>
                </div>
              </div>
              {sources.length ? (
                <div className="flex items-center gap-4">
                  <SourcesPie data={sources} />
                  <div className="space-y-2">
                    {sources.map((x, i) => (
                      <div key={x.referrer_type} className="flex items-center gap-2 text-xs">
                        <span
                          className="w-3 h-3 rounded-sm"
                          style={{
                            background: ["#7c5cff", "#4ce2d0", "#ad97ff", "#5ff5e0"][
                              i % 4
                            ],
                          }}
                        />
                        <span className="text-ink-3 capitalize">
                          {x.referrer_type}
                        </span>
                        <span className="text-ink-0 font-mono">{x.sessions}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="empty">—</div>
              )}
            </div>

            {/* Top projects ranking (existing list) */}
            <div className="admin-panel">
              <div className="admin-section-title">
                <div>
                  <span className="admin-kicker">RANKING</span>
                  <h3>{t("topProjects")}</h3>
                </div>
              </div>
              {(d?.top_projects || []).length ? (
                <div className="rank-list">
                  {d.top_projects.slice(0, 8).map((p: any, i: number) => (
                    <div className="rank-row" key={p.id}>
                      <span className="rank-number">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <div className="rank-info">
                        <strong>
                          {locale === "ar"
                            ? p.title_ar || p.title_en
                            : p.title_en || p.title_ar}
                        </strong>
                        <div className="rank-track">
                          <i
                            style={{
                              width: `${Math.max(
                                6,
                                Math.min(
                                  100,
                                  (p.views /
                                    (d.top_projects[0]?.views || 1)) *
                                    100
                                )
                              )}%`,
                            }}
                          />
                        </div>
                      </div>
                      <span className="rank-count">
                        {Number(p.views || 0).toLocaleString(locale)}{" "}
                        {t("views")}
                        <small>
                          {Number(p.uniq || 0).toLocaleString(locale)}{" "}
                          {t("visitors")}
                        </small>
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty">{t("noViews")}</div>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}