import { ImageResponse } from "next/og";

export const alt         = "JWT Arsenal - Offensive JWT Exploitation Toolkit";
export const size        = { width: 1200, height: 630 };
export const contentType = "image/png";
export const dynamic     = "force-static";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px", height: "630px",
          background: "#0a0a0b",
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          fontFamily: "monospace",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Grid lines */}
        <div style={{ position: "absolute", inset: 0, display: "flex",
          backgroundImage: "linear-gradient(rgba(132,204,22,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(132,204,22,0.04) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }} />

        {/* Radial glow */}
        <div style={{
          position: "absolute",
          width: "900px", height: "500px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(132,204,22,0.10) 0%, transparent 70%)",
          top: "50%", left: "50%",
          transform: "translate(-50%,-50%)",
          display: "flex",
        }} />

        {/* Sphere logo */}
        <div style={{
          width: "96px", height: "96px",
          borderRadius: "48px",
          background: "radial-gradient(circle at 36% 28%, #cef060 0%, #86cc12 22%, #3a7a00 58%, #163500 100%)",
          marginBottom: "28px",
          display: "flex",
          boxShadow: "0 0 40px rgba(132,204,22,0.3)",
        }} />

        {/* Title */}
        <div style={{
          fontSize: "80px", fontWeight: 700,
          color: "#84cc16",
          letterSpacing: "-3px",
          marginBottom: "16px",
          display: "flex",
        }}>
          JWT Arsenal
        </div>

        {/* Subtitle */}
        <div style={{
          fontSize: "24px", color: "#8a8a93",
          marginBottom: "36px",
          display: "flex",
        }}>
          Offensive JWT Exploitation Toolkit
        </div>

        {/* Badges */}
        <div style={{ display: "flex", gap: "12px" }}>
          {["Pentest", "Bug Bounty", "CTF", "100% Client-Side"].map((b) => (
            <div key={b} style={{
              fontSize: "14px", color: "#84cc16",
              border: "1px solid rgba(132,204,22,0.3)",
              background: "rgba(132,204,22,0.06)",
              padding: "6px 16px", borderRadius: "100px",
              display: "flex",
            }}>
              {b}
            </div>
          ))}
        </div>

        {/* Bottom URL */}
        <div style={{
          position: "absolute", bottom: "28px",
          fontSize: "15px", color: "#52525b",
          display: "flex",
        }}>
          jwtarsenal.com
        </div>
      </div>
    ),
    size,
  );
}
