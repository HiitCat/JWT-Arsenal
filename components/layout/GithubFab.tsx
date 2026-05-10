"use client";

import { useState, useRef, useCallback } from "react";
import { Icon } from "@/components/shared/Icons";

const GITHUB_URL = "https://github.com/";
const LABEL = "GitHub";
const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$!?<>/\\~^";
const DURATION = 480;

export function GithubFab() {
  const [text, setText] = useState(LABEL);
  const [hovered, setHovered] = useState(false);
  const rafRef = useRef<number | null>(null);
  const t0Ref = useRef<number | null>(null);

  const animate = useCallback((ts: number) => {
    if (t0Ref.current === null) t0Ref.current = ts;
    const p = Math.min((ts - t0Ref.current) / DURATION, 1);
    const resolved = Math.floor(p * LABEL.length);
    setText(
      LABEL.split("").map((c, i) =>
        i < resolved ? c : CHARS[Math.floor(Math.random() * CHARS.length)]
      ).join("")
    );
    if (p < 1) rafRef.current = requestAnimationFrame(animate);
    else setText(LABEL);
  }, []);

  const onEnter = () => {
    setHovered(true);
    t0Ref.current = null;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(animate);
  };

  const onLeave = () => {
    setHovered(false);
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    setText(LABEL);
  };

  return (
    <a
      href={GITHUB_URL}
      target="_blank"
      rel="noopener noreferrer"
      title="GitHub repository"
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      style={{
        position: "fixed",
        bottom: "24px",
        right: "24px",
        zIndex: 50,
        display: "inline-flex",
        alignItems: "center",
        gap: "7px",
        height: "40px",
        padding: "0 14px",
        background: hovered ? "var(--info-tint)" : "var(--bg-elevated)",
        border: `1px solid ${hovered ? "var(--info-border)" : "var(--border)"}`,
        borderRadius: "100px",
        color: hovered ? "var(--info)" : "var(--text-muted)",
        textDecoration: "none",
        fontSize: "13px",
        fontWeight: 500,
        boxShadow: hovered
          ? "0 0 0 1px var(--info-border), 0 4px 20px rgba(124,92,255,0.15)"
          : "0 4px 16px rgba(0,0,0,0.4)",
        transition: "color 0.2s, border-color 0.2s, box-shadow 0.2s, background 0.2s",
      }}
    >
      <Icon.Github size={14} />
      <span style={{ fontFamily: "var(--font-mono)", display: "inline-block", width: "46px" }}>
        {text}
      </span>
    </a>
  );
}
