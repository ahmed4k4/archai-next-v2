import { ImageResponse } from "next/og";

export const alt = "Archai Solutions";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const runtime = "edge";

export default async function OGImage({
  params,
}: {
  params: { lang: string };
}) {
  const ar = params.lang === "ar";
  const title = ar ? "اكتشف مشاريعنا الرقمية" : "Explore Our Digital Projects";
  const subtitle = ar
    ? "حلول برمجية · ذكاء اصطناعي · أنظمة مدمجة"
    : "Software · AI · Embedded · IoT";

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
          ARCHAI SOLUTIONS
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
          {ar ? "الأنظمة المتكاملة" : "INTEGRATED SYSTEMS"}
        </div>
      </div>
    ),
    { ...size }
  );
}