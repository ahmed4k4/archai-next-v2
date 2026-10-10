import { ImageResponse } from "next/og";

export const alt = "Archai Solutions — Software, AI & Digital Product Engineering";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const runtime = "edge";

export default function OpenGraphImage() {
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
          background: "linear-gradient(135deg, #030510 0%, #2c1679 45%, #084945 100%)",
          position: "relative",
          overflow: "hidden",
          fontFamily: "Arial, sans-serif",
        }}
      >
        {/* Glow circles */}
        <div
          style={{
            position: "absolute",
            width: "700px",
            height: "700px",
            right: "-180px",
            top: "-240px",
            borderRadius: "50%",
            border: "2px solid rgba(124,92,255,.5)",
            boxShadow:
              "0 0 0 60px rgba(124,92,255,.08), 0 0 0 140px rgba(76,226,208,.05)",
          }}
        />
        <div
          style={{
            position: "absolute",
            width: "500px",
            height: "500px",
            left: "-200px",
            bottom: "-240px",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(76,226,208,.35), transparent 65%)",
            filter: "blur(20px)",
          }}
        />

        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "18px",
            fontSize: 24,
            letterSpacing: "5px",
            color: "#cbfff6",
          }}
        >
          <div
            style={{
              width: 60,
              height: 60,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 18,
              color: "white",
              fontSize: 32,
              fontWeight: 700,
              background: "linear-gradient(135deg, #7c5cff, #4ce2d0)",
            }}
          >
            A
          </div>
          ARCHAI SOLUTIONS
        </div>

        {/* Main content */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 24,
            maxWidth: 960,
          }}
        >
          <div
            style={{
              fontSize: 76,
              lineHeight: 1.05,
              fontWeight: 700,
              letterSpacing: "-3px",
            }}
          >
            Engineering digital progress.
          </div>
          <div
            style={{
              fontSize: 34,
              background:
                "linear-gradient(100deg, #ad97ff 0%, #4ce2d0 100%)",
              backgroundClip: "text",
              color: "transparent",
              fontWeight: 600,
            }}
          >
            Software · AI · Embedded · IoT
          </div>
          <div
            style={{
              fontSize: 24,
              color: "#c5cbe0",
              lineHeight: 1.5,
              maxWidth: 800,
            }}
          >
            From product strategy to reliable, production-ready technology.
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            fontSize: 18,
            letterSpacing: 3,
            color: "#ad97ff",
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
          DIGITAL PRODUCT ENGINEERING
        </div>
      </div>
    ),
    { ...size }
  );
}