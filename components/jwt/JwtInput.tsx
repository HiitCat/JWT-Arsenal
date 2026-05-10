"use client";

import { useMemo, useEffect } from "react";
import { decodeJwt, JwtParts } from "@/lib/jwt";

const COLORS = {
  header:    "var(--jwt-header)",
  payload:   "var(--jwt-payload)",
  signature: "var(--jwt-signature)",
  dot:       "var(--jwt-dot)",
};

function ColorizedJwt({ value }: { value: string }) {
  const parts = value.split(".");
  if (parts.length < 2) {
    return <span style={{ color: COLORS.header }}>{value}</span>;
  }
  const [header, payload, ...rest] = parts;
  const signature = rest.join(".");
  return (
    <>
      <span style={{ color: COLORS.header }}>{header}</span>
      <span style={{ color: COLORS.dot }}>.</span>
      <span style={{ color: COLORS.payload }}>{payload}</span>
      {(signature !== undefined) && (
        <>
          <span style={{ color: COLORS.dot }}>.</span>
          <span style={{ color: COLORS.signature }}>{signature}</span>
        </>
      )}
    </>
  );
}

interface JwtInputProps {
  value: string;
  onChange: (value: string) => void;
  onParsed?: (parts: JwtParts | null) => void;
  placeholder?: string;
  label?: string;
}

export function JwtInput({ value, onChange, onParsed, placeholder, label }: JwtInputProps) {
  const { parsed, error } = useMemo(() => {
    if (!value.trim()) return { parsed: null, error: null };
    try {
      return { parsed: decodeJwt(value.trim()), error: null };
    } catch (e) {
      return { parsed: null, error: e instanceof Error ? e.message : "Invalid JWT" };
    }
  }, [value]);

  useEffect(() => {
    onParsed?.(parsed);
  }, [parsed, onParsed]);

  const borderColor = error ? "var(--danger)" : "var(--border)";
  const sharedStyle: React.CSSProperties = {
    padding: "12px 16px",
    fontFamily: "var(--font-mono)",
    fontSize: "13px",
    lineHeight: 1.6,
    whiteSpace: "pre-wrap",
    wordBreak: "break-all",
    overflowWrap: "break-word",
  };

  return (
    <div>
      {label && (
        <label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "var(--text-muted)", marginBottom: "8px" }}>
          {label}
        </label>
      )}
      <div
        style={{
          position: "relative",
          background: "var(--bg)",
          border: `1px solid ${borderColor}`,
          borderRadius: "var(--radius)",
          transition: "border-color 0.15s",
        }}
      >
        {/* Colored text layer behind the textarea */}
        <div
          aria-hidden
          style={{
            ...sharedStyle,
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            userSelect: "none",
            overflow: "hidden",
            borderRadius: "var(--radius)",
            zIndex: 0,
          }}
        >
          {value ? <ColorizedJwt value={value} /> : null}
        </div>

        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder ?? "Paste JWT token here - eyJ..."}
          spellCheck={false}
          style={{
            ...sharedStyle,
            position: "relative",
            zIndex: 1,
            display: "block",
            width: "100%",
            minHeight: "120px",
            background: "transparent",
            border: "none",
            borderRadius: "var(--radius)",
            color: value ? "transparent" : "var(--text-muted)",
            caretColor: "var(--text)",
            resize: "vertical",
            outline: "none",
          }}
          onFocus={(e) => {
            e.currentTarget.parentElement!.style.border = `1px solid ${error ? "var(--danger)" : "var(--accent)"}`;
          }}
          onBlur={(e) => {
            e.currentTarget.parentElement!.style.border = `1px solid ${borderColor}`;
          }}
        />
      </div>
      {error && (
        <p style={{ fontSize: "12px", color: "var(--danger)", margin: "4px 0 0" }}>{error}</p>
      )}
    </div>
  );
}
