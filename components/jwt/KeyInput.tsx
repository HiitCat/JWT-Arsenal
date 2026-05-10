"use client";

import { useState } from "react";
import { isPemPublicKey, isPemPrivateKey } from "@/lib/pem";

interface KeyInputProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  accept?: "public" | "private" | "any";
  placeholder?: string;
}

export function KeyInput({ value, onChange, label, accept = "any", placeholder }: KeyInputProps) {
  const [error, setError] = useState<string | null>(null);

  const validate = (pem: string) => {
    if (!pem.trim()) { setError(null); return; }
    if (accept === "public" && !isPemPublicKey(pem)) {
      setError("Expected a PEM public key (-----BEGIN PUBLIC KEY-----)");
    } else if (accept === "private" && !isPemPrivateKey(pem)) {
      setError("Expected a PEM private key");
    } else if (accept === "any" && !isPemPublicKey(pem) && !isPemPrivateKey(pem)) {
      setError("Does not appear to be a valid PEM key");
    } else {
      setError(null);
    }
  };

  return (
    <div>
      {label && (
        <label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "var(--text-muted)", marginBottom: "8px" }}>
          {label}
        </label>
      )}
      <textarea
        value={value}
        onChange={(e) => { onChange(e.target.value); validate(e.target.value); }}
        placeholder={placeholder ?? "-----BEGIN PUBLIC KEY-----\n...\n-----END PUBLIC KEY-----"}
        spellCheck={false}
        style={{
          width: "100%",
          minHeight: "140px",
          padding: "12px 16px",
          background: "var(--bg)",
          border: `1px solid ${error ? "var(--danger)" : "var(--border)"}`,
          borderRadius: "var(--radius)",
          color: "var(--text)",
          fontFamily: "var(--font-mono)",
          fontSize: "12px",
          lineHeight: 1.6,
          resize: "vertical",
          outline: "none",
        }}
        onFocus={(e) => { e.currentTarget.style.border = `1px solid ${error ? "var(--danger)" : "var(--accent)"}`; }}
        onBlur={(e) => { e.currentTarget.style.border = `1px solid ${error ? "var(--danger)" : "var(--border)"}`; }}
      />
      {error && (
        <p style={{ fontSize: "12px", color: "var(--danger)", margin: "4px 0 0" }}>{error}</p>
      )}
    </div>
  );
}
