import { ReactNode } from "react";

export function StepCard({ number, title, children }: { number: number; title: string; children: ReactNode }) {
  return (
    <div
      style={{
        display: "flex",
        gap: "16px",
        padding: "16px",
        background: "var(--bg)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius)",
      }}
    >
      <div
        style={{
          width: "32px",
          height: "32px",
          borderRadius: "8px",
          background: "var(--accent-tint)",
          border: "1px solid var(--accent-border-mid)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "13px",
          fontWeight: 600,
          color: "var(--accent)",
          fontFamily: "var(--font-mono)",
          flexShrink: 0,
        }}
      >
        {number}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 600, fontSize: "14px", color: "var(--text)", marginBottom: "8px" }}>{title}</div>
        <div style={{ fontSize: "14px", color: "var(--text-muted)", lineHeight: 1.6 }}>{children}</div>
      </div>
    </div>
  );
}
