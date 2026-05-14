"use client";

import { useState } from "react";
import clsx from "clsx";
import s from "@/styles/jwt/PayloadEditor.module.css";

interface PayloadEditorProps {
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
      {label && <label className={s.label}>{label}</label>}
      <textarea
        value={text}
        onChange={(e) => handleChange(e.target.value)}
        spellCheck={false}
        className={clsx(s.textarea, error && s.error)}
      />
      {error && <p className={s.errorMsg}>{error}</p>}
    </div>
  );
}
