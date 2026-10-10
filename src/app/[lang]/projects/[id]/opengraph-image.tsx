import { ImageResponse } from "next/og";
import { getProject } from "@/lib/data";
import { pick } from "@/lib/i18n";
import { SITE_URL } from "@/lib/supabase";

export const alt = "Archai Project";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const runtime = "edge";

export default async function OGImage({
  params,
}: {
  params: { lang: string; id: string };
}) {
  const { lang, id } = params;
  const ar = lang === "ar";
  const project = await getProject(id);

  const title = project
    ? pick(project, "title", lang as any) || "Archai Project"
    : ar
    ? "مشروع"
    : "Project";
  const summary = project
    ? pick(project, "summary", lang as any) || ""
    : "";
  const category = project?.categories
    ? pick(project.categories, "name", lang as any) || ""
    : "";
  const cover = project?.cover_image || project?.featured_image;
  const techs = project?.project_technologies?.slice(0, 4).map((t) => t.technology) || [];

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px",
          color: "#ffffff",
          background:
            "linear-gradient(135deg, #030510 0%, #1a1f3a 55%, #084945 100%)",
          position: "relative",
          overflow: "hidden",
          fontFamily: ar ? "Arial" : "Arial, sans-serif",
          direction: ar ? "rtl" : "ltr",
        }}
      >
        {/* Background glow */}
        <div
          style={{
            position: "absolute",
            width: "600px",
            height: "600px",
            right: "-180px",
            top: "-200px",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(124,92,255,.4), transparent 65%)",
            filter: "blur(30px)",
          }}
        />
        <div
          style={{
            position: "absolute",
            width: "500px",
            height: "500px",
            left: "-150px",
            bottom: "-180px",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(76,226,208,.35), transparent 65%)",
            filter: "blur(30px)",
          }}
        />

        {/* Optional cover image on right */}
        {cover && (
          <div
            style={{
              position: "absolute",
              top: "64px",
              right: ar ? "auto" : "64px",
              left: ar ? "64px" : "auto",
              width: "340px",
              height: "240px",
              borderRadius: "20px",
              overflow: "hidden",
              border: "1px solid rgba(124,92,255,.4)",
              boxShadow: "0 20px 60px rgba(0,0,0,.5)",
              display: "flex",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={cover}
              alt={title}
              width={340}
              height={240}
              style={{ objectFit: "cover", width: "100%", height: "100%" }}
            />
          </div>
        )}

        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "14px",
            fontSize: 20,
            letterSpacing: "4px",
            color: "#cbfff6",
            zIndex: 2,
          }}
        >
          <div
            style={{
              width: 48,
              height: 48,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 14,
              color: "white",
              fontSize: 26,
              fontWeight: 700,
              background: "linear-gradient(135deg, #7c5cff, #4ce2d0)",
            }}
          >
            A
          </div>
          ARCHAI
          {category && (
            <>
              <span style={{ color: "#4ce2d0" }}>·</span>
              <span style={{ color: "#ad97ff" }}>{category}</span>
            </>
          )}
        </div>

        {/* Main content */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 20,
            maxWidth: cover ? "640px" : "1000px",
            zIndex: 2,
          }}
        >
          <div
            style={{
              fontSize: title.length > 40 ? 54 : 68,
              lineHeight: 1.1,
              fontWeight: 700,
              letterSpacing: "-2px",
            }}
          >
            {title.slice(0, 90)}
          </div>
          {summary && (
            <div
              style={{
                fontSize: 24,
                color: "#c5cbe0",
                lineHeight: 1.45,
                maxWidth: 720,
              }}
            >
              {summary.slice(0, 140)}
              {summary.length > 140 ? "…" : ""}
            </div>
          )}
          {techs.length > 0 && (
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {techs.map((t) => (
                <span
                  key={t}
                  style={{
                    padding: "6px 14px",
                    fontSize: 15,
                    borderRadius: 8,
                    background: "rgba(124,92,255,.18)",
                    color: "#ad97ff",
                    border: "1px solid rgba(124,92,255,.35)",
                    fontFamily: "monospace",
                    letterSpacing: "1px",
                  }}
                >
                  {t}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: 16,
            letterSpacing: "3px",
            color: "#4ce2d0",
            zIndex: 2,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: 8,
                background: "#4ce2d0",
                boxShadow: "0 0 16px #4ce2d0",
              }}
            />
            {ar ? "الحلول البرمجية" : "INTEGRATED SYSTEMS"}
          </div>
          <div style={{ color: "#8f96b8" }}>
            {SITE_URL.replace(/^https?:\/\//, "")}
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}