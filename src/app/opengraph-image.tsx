import { ImageResponse } from "next/og";

export const alt = "Archai Solutions — Software, AI & Digital Product Engineering";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "72px", color: "#f8f8ff", background: "linear-gradient(135deg,#090d1c 0%,#171333 54%,#062a2b 100%)", position: "relative", overflow: "hidden", fontFamily: "Arial, sans-serif" }}>
        <div style={{ position: "absolute", width: "580px", height: "580px", right: "-100px", top: "-190px", borderRadius: "50%", border: "2px solid rgba(169,149,255,.45)", boxShadow: "0 0 0 40px rgba(130,101,255,.08),0 0 0 90px rgba(76,226,208,.05)" }} />
        <div style={{ display: "flex", alignItems: "center", gap: "18px", fontSize: 24, letterSpacing: "5px", color: "#b8fff4" }}><div style={{ width: 54, height: 54, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 16, color: "white", fontSize: 28, background: "linear-gradient(135deg,#8265ff,#4ce2d0)" }}>A</div> ARCHAI SOLUTIONS</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 900 }}>
          <div style={{ fontSize: 68, lineHeight: 1.08, fontWeight: 700 }}>Engineering digital progress.</div>
          <div style={{ fontSize: 30, color: "#b8fff4" }}>Software · AI · Embedded Systems · IoT</div>
          <div style={{ fontSize: 23, color: "#c3c5da", lineHeight: 1.45 }}>From product strategy to reliable, production-ready technology.</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 18, letterSpacing: 2, color: "#a995ff" }}><div style={{ width: 8, height: 8, borderRadius: 8, background: "#4ce2d0" }} /> DIGITAL PRODUCT ENGINEERING</div>
      </div>
    ),
    { ...size },
  );
}
