"use client";

import { useState, useRef } from "react";
import { Copy, Check } from "lucide-react";
import clsx from "clsx";
import s from "@/styles/jwt/JsonEditor.module.css";

const C = {
  key:         "var(--syntax-key)",
  string:      "var(--syntax-string)",
  keyword:     "var(--syntax-keyword)",
  number:      "var(--syntax-number)",
  punctuation: "var(--syntax-punctuation)",
  default:     "var(--syntax-default)",
} as const;

type Pat = [RegExp, string];
const PATTERNS: Pat[] = [
  [/^("(?:[^"\\]|\\.)*"\s*:)/, C.key],
  [/^("(?:[^"\\]|\\.)*")/, C.string],
  [/^(\b(?:true|false|null)\b)/, C.keyword],
  [/^(-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)/, C.number],
  [/^([{}\[\],])/, C.punctuation],
];

function tokenizeLine(line: string): Array<{ text: string; color: string }> {
  const tokens: Array<{ text: string; color: string }> = [];
  let pos = 0;
  while (pos < line.length) {
    const slice = line.slice(pos);
    let hit = false;
    for (const [re, color] of PATTERNS) {
      const m = slice.match(re);
      if (m) { tokens.push({ text: m[0], color }); pos += m[0].length; hit = true; break; }
    }
    if (!hit) {
      const last = tokens[tokens.length - 1];
      if (last && last.color === C.default) { last.text += line[pos]; } else { tokens.push({ text: line[pos], color: C.default }); }
      pos++;
    }
  }
  return tokens;
}

function ColorizedJson({ value }: { value: string }) {
  const lines = value.split("\n");
  return (
    <>
      {lines.map((line, li) => (
        <span key={li}>
          {tokenizeLine(line).map((tok, ti) => (
            <span key={ti} style={{ color: tok.color }}>{tok.text}</span>
          ))}
          {li < lines.length - 1 && "\n"}
        </span>
      ))}
    </>
  );
}

interface JsonEditorProps {
  initialValue: Record<string, unknown>;
  onChange: (value: Record<string, unknown>) => void;
  onValidChange?: (valid: boolean, errorMsg?: string) => void;
}

function parseErrorMessage(e: unknown): string {
  if (!(e instanceof SyntaxError)) return "Invalid JSON";
  return e.message
    .replace(/^JSON\.parse:\s*/i, "")
    .replace(/\s*at\s+(line\s+\d+\s+column\s+\d+[^)]*|\d+)\s*$/i, "")
    .replace(/^Unexpected\b/, "Unexpected character -")
    .trim();
}

export function JsonEditor({ initialValue, onChange, onValidChange }: JsonEditorProps) {
  const [text, setText] = useState(() => JSON.stringify(initialValue, null, 2));
  const [error, setError] = useState(false);
  const [copied, setCopied] = useState(false);
  const colorLayerRef = useRef<HTMLDivElement>(null);

  const handleChange = (raw: string) => {
    setText(raw);
    try {
      onChange(JSON.parse(raw));
      if (error) { setError(false); onValidChange?.(true); }
    } catch (e) {
      if (!error) { setError(true); }
      onValidChange?.(false, parseErrorMessage(e));
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={clsx(s.wrapper, error && s.error)}>
      <div aria-hidden ref={colorLayerRef} className={s.colorLayer}>
        <ColorizedJson value={text} />
      </div>
      <textarea
        value={text}
        onChange={(e) => handleChange(e.target.value)}
        spellCheck={false}
        className={s.textarea}
        style={{ color: "transparent", caretColor: "var(--text)" }}
      />
      <button
        onClick={handleCopy}
        className={clsx(s.floatBtn, copied && s.copied)}
        title={copied ? "Copied!" : "Copy"}
      >
        {copied ? <Check size={12} /> : <Copy size={12} />}
      </button>
    </div>
  );
}
