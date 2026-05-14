"use client";

import React from "react";
import s from "@/styles/shared/JsonView.module.css";

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
      if (m) {
        tokens.push({ text: m[0], color });
        pos += m[0].length;
        hit = true;
        break;
      }
    }
    if (!hit) {
      const last = tokens[tokens.length - 1];
      if (last && last.color === C.default) {
        last.text += line[pos];
      } else {
        tokens.push({ text: line[pos], color: C.default });
      }
      pos++;
    }
  }
  return tokens;
}

interface JsonViewProps {
  value: string;
  style?: React.CSSProperties;
}

export function JsonView({ value, style }: JsonViewProps) {
  const lines = value.split("\n");
  return (
    <pre className={s.pre} style={style}>
      {lines.map((line, li) => (
        <span key={li}>
          {tokenizeLine(line).map((tok, ti) => (
            <span key={ti} style={{ color: tok.color }}>{tok.text}</span>
          ))}
          {li < lines.length - 1 && "\n"}
        </span>
      ))}
    </pre>
  );
}
