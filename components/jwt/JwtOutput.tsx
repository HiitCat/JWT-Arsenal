"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

interface JwtOutputProps {
  token: string;
  label?: string;
  variant?: string;
}

export function JwtOutput({ token, label, variant }: JwtOutputProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(token);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Color the JWT parts
  const parts = token.split(".");
  const hasThreeParts = parts.length === 3;

  return (
    <div
      style={{
        background: "var(--bg)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius)",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "8px 12px",
          borderBottom: "1px solid var(--border)",
          background: "var(--surface-overlay)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "12px", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
            {label ?? "Forged JWT"}
          </span>
        </div>
        <button
          onClick={handleCopy}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "4px",
            padding: "4px 8px",
            background: "transparent",
            border: "1px solid var(--border)",
            borderRadius: "4px",
            cursor: "pointer",
            color: copied ? "var(--success)" : "var(--text-muted)",
            fontSize: "11px",
            transition: "color 0.15s",
          }}
        >
          {copied ? <Check size={11} /> : <Copy size={11} />}
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
      <div style={{ padding: "12px 16px" }}>
        {hasThreeParts ? (
          <p
            style={{
              margin: 0,
              fontFamily: "var(--font-mono)",
              fontSize: "12px",
              lineHeight: 1.7,
              wordBreak: "break-all",
            }}
          >
            <span style={{ color: "var(--jwt-header)" }}>{parts[0]}</span>
            <span style={{ color: "var(--jwt-dot)" }}>.</span>
            <span style={{ color: "var(--jwt-payload)" }}>{parts[1]}</span>
            <span style={{ color: "var(--jwt-dot)" }}>.</span>
            <span style={{ color: "var(--jwt-signature)" }}>{parts[2] || ''}</span>
          </p>
        ) : (
          <p
            style={{
              margin: 0,
              fontFamily: "var(--font-mono)",
              fontSize: "12px",
              color: "var(--text)",
              wordBreak: "break-all",
              lineHeight: 1.7,
            }}
          >
            {token}
          </p>
        )}
      </div>
    </div>
  );
}
