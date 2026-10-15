import { ImageResponse } from "next/og";

export const alt = "Archai Solutions";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const runtime = "edge";
export const revalidate = 60;

export default async function OGImage({
  params,
}: {
  params: { lang: string };
}) {
  const ar = params.lang === "ar";
  // Use the public, RLS-protected settings row so the OG card follows dashboard edits.
  // Keep the image generator resilient: if Supabase is unavailable, use honest defaults.
  let settings: Record<string, unknown> = {};
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/+$/, "");
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (supabaseUrl && anonKey) {
    try {
      const response = await fetch(
        `${supabaseUrl}/rest/v1/site_settings?id=eq.1&select=company_name,home_title_ar,home_title_en,brand_tagline_ar,brand_tagline_en`,
        { headers: { apikey: anonKey, Authorization: `Bearer ${anonKey}` }, cache: "force-cache" },
      );
      if (response.ok) {
        const rows = await response.json();
        if (Array.isArray(rows) && rows[0] && typeof rows[0] === "object") settings = rows[0];
      }
    } catch {
      // Fall through to localized defaults; social preview generation must not fail.
    }
  }
  const title = (typeof settings[ar ? "home_title_ar" : "home_title_en"] === "string"
    ? String(settings[ar ? "home_title_ar" : "home_title_en"]).trim()
    : "") || (ar ? "منتجات رقمية تُبنى حول احتياج حقيقي" : "Digital products built around real needs");
  const companyName = (typeof settings.company_name === "string" && settings.company_name.trim())
    ? settings.company_name.trim()
    : "Archai Integrated Systems";
  const subtitle = ((typeof settings[ar ? "brand_tagline_ar" : "brand_tagline_en"] === "string"
    ? String(settings[ar ? "brand_tagline_ar" : "brand_tagline_en"]).trim()
    : "") || (ar ? "أنظمة متكاملة · منتجات رقمية · ذكاء اصطناعي" : "Integrated systems · Digital products · AI")).slice(0, 140);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px",
          color: "#ffffff",
          background:
            "linear-gradient(135deg, #030510 0%, #2c1679 45%, #084945 100%)",
          position: "relative",
          overflow: "hidden",
          fontFamily: ar ? "Arial" : "Arial, sans-serif",
          direction: ar ? "rtl" : "ltr",
        }}
      >
        <div
          style={{
            position: "absolute",
            width: "620px",
            height: "620px",
            right: ar ? "auto" : "-160px",
            left: ar ? "-160px" : "auto",
            top: "-220px",
            borderRadius: "50%",
            border: "2px solid rgba(124,92,255,.5)",
            boxShadow: "0 0 0 60px rgba(124,92,255,.08)",
          }}
        />

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "18px",
            fontSize: 22,
            letterSpacing: "5px",
            color: "#cbfff6",
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 16,
              color: "white",
              fontSize: 30,
              fontWeight: 700,
              background: "linear-gradient(135deg, #7c5cff, #4ce2d0)",
            }}
          >
            A
          </div>
          {companyName.toUpperCase()}
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 20,
            maxWidth: 980,
          }}
        >
          <div
            style={{
              fontSize: 72,
              lineHeight: 1.1,
              fontWeight: 700,
              letterSpacing: "-2px",
            }}
          >
            {title}
          </div>
          <div
            style={{
              fontSize: 30,
              color: "#ad97ff",
              fontWeight: 600,
            }}
          >
            {subtitle}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            fontSize: 18,
            letterSpacing: 3,
            color: "#4ce2d0",
          }}
        >
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: 10,
              background: "#4ce2d0",
              boxShadow: "0 0 20px #4ce2d0",
            }}
          />
          {ar ? "حلول هندسية متكاملة" : "DIGITAL PRODUCT ENGINEERING"}
        </div>
      </div>
    ),
    { ...size }
  );
}