"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";
import clsx from "clsx";
import s from "@/styles/shared/CodeBlock.module.css";

const C = {
  comment:     "var(--syntax-comment)",
  string:      "var(--syntax-string)",
  url:         "var(--syntax-url)",
  flag:        "var(--syntax-flag)",
  command:     "var(--syntax-command)",
  keyword:     "var(--syntax-keyword)",
  number:      "var(--syntax-number)",
  operator:    "var(--syntax-operator)",
  key:         "var(--syntax-key)",
  punctuation: "var(--syntax-punctuation)",
  placeholder: "var(--syntax-placeholder)",
  default:     "var(--syntax-default)",
} as const;

type Pat = [RegExp, string];

const BASH: Pat[] = [
  [/^(#.*)/, C.comment],
  [/^(https?:\/\/[^\s"'\n\\]+)/, C.url],
  [/^("(?:[^"\\]|\\.)*")/, C.string],
  [/^('(?:[^'\\]|\\.)*')/, C.string],
  [/^(<[A-Z_][A-Z_0-9 ]*>)/, C.placeholder],
  [/^(--?[\w][\w-]*)/, C.flag],
  [/^(\b(?:curl|python3|python|git|npm|npx|hashcat|john|ngrok|pip3|pip|cd|ls|mkdir|echo|cat|openssl|wget|chmod)\b)/, C.command],
  [/^(\$\{?[\w]+\}?)/, C.keyword],
  [/^([|\\&;>]+)/, C.operator],
  [/^(\b\d+\b)/, C.number],
];

const PYTHON: Pat[] = [
  [/^(#.*)/, C.comment],
  [/^("""[\s\S]*?"""|'''[\s\S]*?''')/, C.string],
  [/^("(?:[^"\\]|\\.)*")/, C.string],
  [/^('(?:[^'\\]|\\.)*')/, C.string],
  [/^(\b(?:import|from|as|def|class|if|else|elif|try|except|with|return|for|in|and|or|not|True|False|None|await|async|pass|raise|lambda|yield)\b)/, C.keyword],
  [/^(\b(?:print|len|range|str|int|list|dict|set|open|json|base64|hmac|hashlib|bytes)\b)/, C.command],
  [/^(\b\d+(?:\.\d+)?\b)/, C.number],
];

const JSON_LANG: Pat[] = [
  [/^("(?:[^"\\]|\\.)*"\s*:)/, C.key],
  [/^("(?:[^"\\]|\\.)*")/, C.string],
  [/^(\b(?:true|false|null)\b)/, C.keyword],
  [/^(-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)/, C.number],
  [/^([{}\[\],])/, C.punctuation],
];

const HTTP: Pat[] = [
  [/^(https?:\/\/[^\s"'\n]+)/, C.url],
  [/^(\b(?:GET|POST|PUT|DELETE|PATCH|HEAD|OPTIONS)\b)/, C.command],
  [/^(\b(?:Authorization|Content-Type|Host|Accept|Cookie|Bearer)\b)/, C.keyword],
  [/^(HTTP\/\d\.\d)/, C.flag],
  [/^("(?:[^"\\]|\\.)*")/, C.string],
  [/^(\b\d{3}\b)/, C.number],
];

const JS: Pat[] = [
  [/^(\/\/.*)/, C.comment],
  [/^(`(?:[^`\\]|\\.)*`)/, C.string],
  [/^("(?:[^"\\]|\\.)*")/, C.string],
  [/^('(?:[^'\\]|\\.)*')/, C.string],
  [/^(\b(?:const|let|var|function|class|return|if|else|for|while|do|try|catch|finally|import|export|default|from|new|this|super|await|async|typeof|instanceof|void|delete|throw|switch|case|break|continue|in|of|yield|static|get|set|extends)\b)/, C.keyword],
  [/^(\b(?:console|JSON|Object|Array|Promise|fetch|require|module|exports|process|window|document|Math|Date|Error|Map|Set|Buffer|setTimeout|setInterval|parseInt|parseFloat|atob|btoa)\b)/, C.command],
  [/^(\b(?:true|false|null|undefined|NaN|Infinity)\b)/, C.flag],
  [/^(-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)/, C.number],
  [/^([(){}[\],;])/, C.punctuation],
  [/^([=!<>+\-*/%&|^~?:.]+)/, C.operator],
];

function pats(lang: string): Pat[] {
  if (lang === "python") return PYTHON;
  if (lang === "json") return JSON_LANG;
  if (lang === "http") return HTTP;
  if (lang === "js" || lang === "javascript" || lang === "ts" || lang === "typescript") return JS;
  return BASH;
}

type Token = { text: string; color: string };

function tokenizeLine(line: string, lang: string): Token[] {
  const patterns = pats(lang);
  const tokens: Token[] = [];
  let pos = 0;

  while (pos < line.length) {
    const slice = line.slice(pos);
    let hit = false;

    for (const [re, color] of patterns) {
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

function highlight(code: string, lang: string): React.ReactNode {
  const lines = code.split("\n");
  return lines.map((line, li) => (
    <span key={li}>
      {tokenizeLine(line, lang).map((tok, ti) => (
        <span key={ti} style={{ color: tok.color }}>{tok.text}</span>
      ))}
      {li < lines.length - 1 && "\n"}
    </span>
  ));
}

interface CodeBlockProps {
  code: string;
  language?: string;
  label?: string;
  copyable?: boolean;
}

export function CodeBlock({ code, language = "bash", label, copyable = true }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={s.wrapper}>
      <div className={s.header}>
        <span className={s.lang}>{label ?? language}</span>
        {copyable && (
          <button
            onClick={handleCopy}
            className={clsx(s.copyBtn, copied && s.copied)}
            title={copied ? "Copied!" : "Copy"}
          >
            {copied ? <Check size={12} /> : <Copy size={12} />}
          </button>
        )}
      </div>
      <pre className={s.pre}>
        <code>{highlight(code, language)}</code>
      </pre>
    </div>
  );
}
