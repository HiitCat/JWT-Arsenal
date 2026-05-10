"use client";

import { useState } from "react";

interface PayloadEditorProps {
  /** Initial value - when this changes identity, use a key prop on the parent to reset */
  initialValue: Record<string, unknown>;
  onChange: (value: Record<string, unknown>) => void;
  label?: string;
}

export function PayloadEditor({ initialValue, onChange, label }: PayloadEditorProps) {
  const [text, setText] = useState(() => JSON.stringify(initialValue, null, 2));
  const [error, setError] = useState<string | null>(null);

  const handleChange = (raw: string) => {
    setText(raw);
    try {
      const parsed = JSON.parse(raw);
      setError(null);
      onChange(parsed);
    } catch {
      setError("Invalid JSON");
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
        value={text}
        onChange={(e) => handleChange(e.target.value)}
        spellCheck={false}
        style={{
          width: "100%",
          minHeight: "160px",
          padding: "12px 16px",
          background: "var(--bg)",
          border: `1px solid ${error ? "var(--danger)" : "var(--border)"}`,
          borderRadius: "var(--radius)",
          color: "var(--text)",
          fontFamily: "var(--font-mono)",
          fontSize: "13px",
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
