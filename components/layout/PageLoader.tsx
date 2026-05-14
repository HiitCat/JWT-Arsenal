"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/shared/Icons";
import clsx from "clsx";
import s from "@/styles/layout/PageLoader.module.css";

const BOOT_LINES = [
  { text: "Loading cryptographic engine",  ok: true,  delay: 380 },
  { text: "Importing exploit modules",      ok: true,  delay: 680 },
  { text: "Verifying secure context",       ok: true,  delay: 960 },
  { text: "All systems operational",        ok: false, delay: 1220 },
];

const TITLE        = "JWT Arsenal";
const CHARS        = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#!?<>/\\~^";
const SCRAMBLE_MS  = 700;
const PROGRESS_MS  = 1600;
const FADE_AT      = 1900;
const UNMOUNT_AT   = 2600;
const LOADER_SEEN_KEY = "jwt-arsenal-page-loader-seen";
let loaderResolved = false;

export function PageLoader() {
  const [checked,  setChecked]  = useState(loaderResolved);
  const [mounted,  setMounted]  = useState(!loaderResolved);
  const [visible,  setVisible]  = useState(true);
  const [title,    setTitle]    = useState(TITLE);
  const [lines,    setLines]    = useState<number[]>([]);
  const [progress, setProgress] = useState(0);
  const [cursor,   setCursor]   = useState(true);

  useEffect(() => {
    try {
      if (sessionStorage.getItem(LOADER_SEEN_KEY)) {
        loaderResolved = true;
        requestAnimationFrame(() => {
          setMounted(false);
          setChecked(true);
        });
        return;
      }
      sessionStorage.setItem(LOADER_SEEN_KEY, "true");
      loaderResolved = true;
    } catch {
      loaderResolved = true;
    }
    requestAnimationFrame(() => setChecked(true));
  }, []);

  useEffect(() => {
    if (!checked || !mounted) return;
    let raf: number;
    let t0: number | null = null;
    const animate = (ts: number) => {
      if (!t0) t0 = ts;
      const p = Math.min((ts - t0) / SCRAMBLE_MS, 1);
      const resolved = Math.floor(p * TITLE.length);
      setTitle(TITLE.split("").map((c, i) =>
        i < resolved ? c : CHARS[Math.floor(Math.random() * CHARS.length)]
      ).join(""));
      if (p < 1) raf = requestAnimationFrame(animate);
      else setTitle(TITLE);
    };
    const id = setTimeout(() => { raf = requestAnimationFrame(animate); }, 180);
    return () => { clearTimeout(id); cancelAnimationFrame(raf); };
  }, [checked, mounted]);

  useEffect(() => {
    if (!checked || !mounted) return;
    const ids = BOOT_LINES.map((l, i) =>
      setTimeout(() => setLines(prev => [...prev, i]), l.delay)
    );
    return () => ids.forEach(clearTimeout);
  }, [checked, mounted]);

  useEffect(() => {
    if (!checked || !mounted) return;
    let raf: number;
    let t0: number | null = null;
    const update = (ts: number) => {
      if (!t0) t0 = ts;
      const p = Math.min((ts - t0) / PROGRESS_MS, 1);
      setProgress(p * 100);
      if (p < 1) raf = requestAnimationFrame(update);
    };
    raf = requestAnimationFrame(update);
    return () => cancelAnimationFrame(raf);
  }, [checked, mounted]);

  useEffect(() => {
    if (!checked || !mounted) return;
    const id = setInterval(() => setCursor(v => !v), 530);
    return () => clearInterval(id);
  }, [checked, mounted]);

  useEffect(() => {
    if (!checked || !mounted) return;
    const t1 = setTimeout(() => setVisible(false), FADE_AT);
    const t2 = setTimeout(() => setMounted(false), UNMOUNT_AT);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [checked, mounted]);

  if (!mounted) return null;

  if (!checked) return <div className={s.blocker} />;

  return (
    <div
      className={s.overlay}
      style={{ opacity: visible ? 1 : 0, pointerEvents: visible ? "all" : "none" }}
    >
      <div className={s.ambient} />
      <div className={s.scanline} />

      <div className={s.sphere}>
        <Icon.Logo size={80} />
      </div>

      <div className={s.titleRow}>
        <span className={s.titleText} style={{ minWidth: `${TITLE.length}ch` }}>{title}</span>
        <span className={s.cursor} style={{ opacity: cursor ? 1 : 0 }}>_</span>
      </div>

      <div className={s.terminal}>
        {BOOT_LINES.map((line, i) => (
          <div
            key={i}
            className={s.termLine}
            style={{ opacity: lines.includes(i) ? 1 : 0 }}
          >
            <span className={s.termText}>
              <span className={s.termPrompt}>›</span>
              {line.text}
            </span>
            {line.ok && <span className={s.okBadge}>OK</span>}
          </div>
        ))}
      </div>

      <div className={s.progressTrack}>
        <div
          className={clsx(s.progressBar, progress > 5 && s.progressBarGlow)}
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className={s.footer}>100% CLIENT-SIDE · NO DATA LEAVES YOUR BROWSER</div>
    </div>
  );
}
