"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";
import clsx from "clsx";
import s from "@/styles/jwt/JwtOutput.module.css";

interface JwtOutputProps {
  token: string;
  label?: string;
}

export function JwtOutput({ token, label }: JwtOutputProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(token);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const parts = token.split(".");
  const hasThreeParts = parts.length === 3;

  return (
    <div className={s.wrapper}>
      <div className={s.header}>
        <span className={s.label}>{label ?? "Forged JWT"}</span>
        <button
          onClick={handleCopy}
          className={clsx(s.copyBtn, copied && s.copied)}
          title={copied ? "Copied!" : "Copy"}
        >
          {copied ? <Check size={12} /> : <Copy size={12} />}
        </button>
      </div>
      <div className={s.body}>
        {hasThreeParts ? (
          <p className={s.token}>
            <span style={{ color: "var(--jwt-header)" }}>{parts[0]}</span>
            <span style={{ color: "var(--jwt-dot)" }}>.</span>
            <span style={{ color: "var(--jwt-payload)" }}>{parts[1]}</span>
            <span style={{ color: "var(--jwt-dot)" }}>.</span>
            <span style={{ color: "var(--jwt-signature)" }}>{parts[2] || ""}</span>
          </p>
        ) : (
          <p className={clsx(s.token, s.tokenPlain)}>{token}</p>
        )}
      </div>
    </div>
  );
}
