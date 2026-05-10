import { ImageResponse } from "next/og";

export const dynamic = "force-static";
export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "64px",
          height: "64px",
          borderRadius: "32px",
          background: "radial-gradient(circle at 36% 28%, #cef060 0%, #86cc12 22%, #3a7a00 58%, #163500 100%)",
          overflow: "hidden",
          display: "flex",
          position: "relative",
        }}
      >
        {/* Diagonal stripe */}
        <div
          style={{
            position: "absolute",
            top: "30px",
            left: "-12px",
            width: "100px",
            height: "16px",
            background: "linear-gradient(90deg, rgba(158,216,0,0.8), #ccf000, rgba(142,200,0,0.65))",
            transform: "rotate(-28deg)",
          }}
        />
        {/* Specular gloss */}
        <div
          style={{
            position: "absolute",
            top: "7px",
            left: "11px",
            width: "24px",
            height: "16px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(255,255,255,0.68) 0%, rgba(255,255,255,0) 100%)",
          }}
        />
        {/* Rim vignette */}
        <div
          style={{
            position: "absolute",
            inset: "0",
            borderRadius: "32px",
            background: "radial-gradient(circle at 50% 50%, transparent 60%, rgba(0,0,0,0.42) 100%)",
          }}
        />
      </div>
    ),
    size,
  );
}
