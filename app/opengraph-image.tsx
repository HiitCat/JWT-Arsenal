import { ImageResponse } from "next/og";
import { readFileSync } from "fs";
import { join } from "path";

export const alt         = "JWT Arsenal - Offensive JWT Exploitation Toolkit";
export const size        = { width: 1200, height: 630 };
export const contentType = "image/png";
export const dynamic     = "force-static";

export default function OgImage() {
  const interBold    = readFileSync(join(process.cwd(), "node_modules/@fontsource/inter/files/inter-latin-700-normal.woff"));
  const interRegular = readFileSync(join(process.cwd(), "node_modules/@fontsource/inter/files/inter-latin-400-normal.woff"));

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px", height: "630px",
          background: "#09090b",
          display: "flex",
          fontFamily: "Inter",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Subtle grid */}
        <div style={{
          position: "absolute", inset: 0, display: "flex",
          backgroundImage: "linear-gradient(rgba(132,204,22,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(132,204,22,0.05) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }} />

        {/* Left accent bar */}
        <div style={{
          position: "absolute", left: 0, top: 0, bottom: 0,
          width: "4px",
          background: "linear-gradient(180deg, transparent, #84cc16 30%, #84cc16 70%, transparent)",
          display: "flex",
        }} />

        {/* Top border line */}
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0,
          height: "1px",
          background: "linear-gradient(90deg, transparent, rgba(132,204,22,0.4) 30%, rgba(132,204,22,0.4) 70%, transparent)",
          display: "flex",
        }} />

        {/* Glow behind content */}
        <div style={{
          position: "absolute",
          width: "600px", height: "400px",
          left: "60px", top: "50%",
          transform: "translateY(-50%)",
          background: "radial-gradient(ellipse, rgba(132,204,22,0.08) 0%, transparent 70%)",
          display: "flex",
        }} />

        {/* Main content - left column */}
        <div style={{
          display: "flex", flexDirection: "column",
          justifyContent: "center",
          padding: "64px 64px 64px 80px",
          flex: 1,
          position: "relative",
        }}>
          {/* Top label */}
          <div style={{
            display: "flex", alignItems: "center", gap: "8px",
            marginBottom: "28px",
          }}>
            <div style={{
              width: "8px", height: "8px",
              borderRadius: "50%",
              background: "#84cc16",
              boxShadow: "0 0 8px #84cc16",
              display: "flex",
            }} />
            <span style={{
              fontSize: "13px", fontWeight: 400,
              color: "#84cc16",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
            }}>
              Open Source Security Toolkit
            </span>
          </div>

          {/* Title */}
          <div style={{
            fontSize: "88px", fontWeight: 700,
            color: "#fafafa",
            letterSpacing: "-4px",
            lineHeight: 1,
            marginBottom: "20px",
            display: "flex",
          }}>
            JWT Arsenal
          </div>

          {/* Subtitle */}
          <div style={{
            fontSize: "22px", fontWeight: 400,
            color: "#71717a",
            marginBottom: "40px",
            display: "flex",
            lineHeight: 1.4,
          }}>
            Forge, inspect &amp; exploit JWT vulnerabilities
            <br />directly in your browser - no backend needed.
          </div>

          {/* Badges */}
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            {["Pentest", "Bug Bounty", "CTF", "100% Client-Side"].map((b) => (
              <div key={b} style={{
                fontSize: "13px", fontWeight: 400,
                color: "#84cc16",
                border: "1px solid rgba(132,204,22,0.35)",
                background: "rgba(132,204,22,0.08)",
                padding: "5px 14px",
                borderRadius: "100px",
                display: "flex",
              }}>
                {b}
              </div>
            ))}
          </div>
        </div>

        {/* Right column - attack list */}
        <div style={{
          display: "flex", flexDirection: "column",
          justifyContent: "center",
          padding: "64px 64px 64px 0",
          gap: "10px",
          width: "360px",
          flexShrink: 0,
        }}>
          {[
            { label: "Unverified Signature", color: "#06b6d4" },
            { label: "Algorithm None",       color: "#f59e0b" },
            { label: "Algorithm Confusion",  color: "#84cc16" },
            { label: "KID Injection",        color: "#ef4444" },
            { label: "JWK Injection",        color: "#ec4899" },
            { label: "JKU Injection",        color: "#3b82f6" },
            { label: "Key Recovery",         color: "#22c55e" },
          ].map((item) => (
            <div key={item.label} style={{
              display: "flex", alignItems: "center", gap: "10px",
              padding: "9px 14px",
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: "8px",
            }}>
              <div style={{
                width: "6px", height: "6px",
                borderRadius: "50%",
                background: item.color,
                flexShrink: 0,
                display: "flex",
              }} />
              <span style={{ fontSize: "14px", fontWeight: 400, color: "#a1a1aa" }}>
                {item.label}
              </span>
            </div>
          ))}
        </div>

        {/* Bottom URL */}
        <div style={{
          position: "absolute", bottom: "28px", right: "64px",
          fontSize: "14px", fontWeight: 400,
          color: "#3f3f46",
          display: "flex",
        }}>
          jwtarsenal.com
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Inter", data: interBold,    style: "normal", weight: 700 },
        { name: "Inter", data: interRegular, style: "normal", weight: 400 },
      ],
    },
  );
}
