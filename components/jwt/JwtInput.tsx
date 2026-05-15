"use client";

import { useState, useMemo, useEffect } from "react";
import { Copy, Check } from "lucide-react";
import { decodeJwt, JwtParts } from "@/lib/jwt";
import clsx from "clsx";
import s from "@/styles/jwt/JwtInput.module.css";

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
      {signature !== undefined && (
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
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!value.trim()) return;
    await navigator.clipboard.writeText(value.trim());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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

  return (
    <div>
      {label && <label className={s.label}>{label}</label>}
      <div className={clsx(s.wrapper, error && s.error)}>
        <div aria-hidden className={s.colorLayer}>
          {value ? <ColorizedJwt value={value} /> : null}
        </div>
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder ?? "Paste JWT token here - eyJ..."}
          spellCheck={false}
          className={s.textarea}
          style={{ color: value ? "transparent" : "var(--text-muted)" }}
        />
        {value && (
          <button
            onClick={handleCopy}
            className={clsx(s.floatBtn, copied && s.copied)}
            title={copied ? "Copied!" : "Copy"}
          >
            {copied ? <Check size={12} /> : <Copy size={12} />}
          </button>
        )}
      </div>
      {error && <p className={s.errorMsg}>{error}</p>}
    </div>
  );
}
