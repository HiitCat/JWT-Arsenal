"use client";

import { useEffect, useState, useRef } from "react";
import { Icon } from "@/components/shared/Icons";

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

export function PageLoader() {
  const [mounted,  setMounted]  = useState(true);
  const [visible,  setVisible]  = useState(true);
  const [title,    setTitle]    = useState(TITLE);
  const [lines,    setLines]    = useState<number[]>([]);
  const [progress, setProgress] = useState(0);
  const [cursor,   setCursor]   = useState(true);

  /* ── scramble title ─────────────────────────────────────── */
  useEffect(() => {
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
  }, []);

  /* ── boot lines ─────────────────────────────────────────── */
  useEffect(() => {
    const ids = BOOT_LINES.map((l, i) =>
      setTimeout(() => setLines(prev => [...prev, i]), l.delay)
    );
    return () => ids.forEach(clearTimeout);
  }, []);

  /* ── progress bar ───────────────────────────────────────── */
  useEffect(() => {
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
  }, []);

  /* ── cursor blink ───────────────────────────────────────── */
  useEffect(() => {
    const id = setInterval(() => setCursor(v => !v), 530);
    return () => clearInterval(id);
  }, []);

  /* ── fade + unmount ─────────────────────────────────────── */
  useEffect(() => {
    const t1 = setTimeout(() => setVisible(false), FADE_AT);
    const t2 = setTimeout(() => setMounted(false), UNMOUNT_AT);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  if (!mounted) return null;

  return (
    <>
      <style>{`
        @keyframes _sphere-in {
          0%   { opacity:0; transform:scale(0.55) translateY(12px); }
          65%  { transform:scale(1.07) translateY(-4px); }
          100% { opacity:1; transform:scale(1) translateY(0); }
        }
        @keyframes _line-in {
          from { opacity:0; transform:translateX(-10px); }
          to   { opacity:1; transform:translateX(0); }
        }
        @keyframes _scan {
          0%   { transform:translateY(-100%); }
          100% { transform:translateY(100vh); }
        }
        @keyframes _bar-glow {
          0%, 100% { box-shadow: 0 0 6px var(--accent-glow); }
          50%       { box-shadow: 0 0 16px var(--accent-glow), 0 0 32px var(--accent-border); }
        }
      `}</style>

      <div style={{
        position: "fixed", inset: 0, zIndex: 9999,
        background: "var(--bg)",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        opacity: visible ? 1 : 0,
        transition: "opacity 0.65s cubic-bezier(0.4,0,1,1)",
        pointerEvents: visible ? "all" : "none",
        overflow: "hidden",
      }}>

        {/* Ambient glow */}
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          background: "radial-gradient(ellipse 70% 55% at 50% 50%, rgba(132,204,22,0.07) 0%, transparent 70%)",
        }} />

        {/* Scanline sweep */}
        <div style={{
          position: "absolute", left: 0, right: 0, height: "2px",
          background: "linear-gradient(90deg, transparent, var(--accent-border-mid), transparent)",
          animation: "_scan 1.8s linear forwards",
          pointerEvents: "none", opacity: 0.6,
        }} />

        {/* Sphere */}
        <div style={{
          animation: "_sphere-in 0.65s cubic-bezier(0.34,1.56,0.64,1) forwards",
          marginBottom: "18px",
        }}>
          <Icon.Logo size={80} />
        </div>

        {/* Title */}
        <div style={{
          fontFamily: "var(--font-mono)",
          fontSize: "30px",
          fontWeight: 700,
          letterSpacing: "-0.02em",
          color: "var(--accent)",
          marginBottom: "44px",
          display: "flex", alignItems: "baseline", gap: "2px",
        }}>
          <span style={{ display: "inline-block", minWidth: `${TITLE.length}ch` }}>{title}</span>
          <span style={{ opacity: cursor ? 1 : 0, transition: "opacity 0.1s" }}>_</span>
        </div>

        {/* Terminal lines */}
        <div style={{
          width: "min(420px, 88vw)",
          fontFamily: "var(--font-mono)",
          fontSize: "12px",
          display: "flex", flexDirection: "column", gap: "7px",
          marginBottom: "28px",
        }}>
          {BOOT_LINES.map((line, i) => (
            <div key={i} style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              opacity: lines.includes(i) ? 1 : 0,
              animation: lines.includes(i) ? "_line-in 0.28s ease forwards" : "none",
            }}>
              <span style={{ color: "var(--text-muted)" }}>
                <span style={{ color: "var(--accent)", opacity: 0.5, marginRight: "8px" }}>›</span>
                {line.text}
              </span>
              {line.ok && (
                <span style={{
                  color: "var(--success)", fontSize: "11px",
                  background: "var(--success-tint)", border: "1px solid var(--success-border)",
                  borderRadius: "4px", padding: "1px 6px", flexShrink: 0,
                }}>
                  OK
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Progress bar */}
        <div style={{
          width: "min(420px, 88vw)", height: "2px",
          background: "var(--border)", borderRadius: "2px", overflow: "hidden",
        }}>
          <div style={{
            height: "100%",
            width: `${progress}%`,
            background: "linear-gradient(90deg, var(--accent), var(--accent-mid))",
            borderRadius: "2px",
            animation: progress > 5 ? "_bar-glow 0.9s ease-in-out infinite" : "none",
            transition: "width 0.06s linear",
          }} />
        </div>

        {/* Bottom label */}
        <div style={{
          marginTop: "14px",
          fontFamily: "var(--font-mono)",
          fontSize: "10px",
          color: "var(--text-muted)",
          opacity: 0.4,
          letterSpacing: "0.08em",
        }}>
          100% CLIENT-SIDE · NO DATA LEAVES YOUR BROWSER
        </div>
      </div>
    </>
  );
}
