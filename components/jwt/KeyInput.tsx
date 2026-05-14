"use client";

import { useState } from "react";
import { isPemPublicKey, isPemPrivateKey } from "@/lib/pem";
import clsx from "clsx";
import s from "@/styles/jwt/KeyInput.module.css";

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
      {label && <label className={s.label}>{label}</label>}
      <textarea
        value={value}
        onChange={(e) => { onChange(e.target.value); validate(e.target.value); }}
        placeholder={placeholder ?? "-----BEGIN PUBLIC KEY-----\n...\n-----END PUBLIC KEY-----"}
        spellCheck={false}
        className={clsx(s.textarea, error && s.error)}
      />
      {error && <p className={s.errorMsg}>{error}</p>}
    </div>
  );
}
