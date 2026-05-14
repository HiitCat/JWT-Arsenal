"use client";

import { useState, useRef, useCallback } from "react";
import { Icon } from "@/components/shared/Icons";
import s from "@/styles/layout/GithubFab.module.css";

const GITHUB_URL = "https://github.com/HiitCat/JWT-Arsenal";
const LABEL = "GitHub";
const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$!?<>/\\~^";
const DURATION = 480;

export function GithubFab() {
  const [text, setText] = useState(LABEL);
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
    t0Ref.current = null;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(animate);
  };

  const onLeave = () => {
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
      className={s.fab}
    >
      <Icon.Github size={14} />
      <span className={s.label}>{text}</span>
    </a>
  );
}
