"use client";

import { useState } from "react";
import { useTheme } from "./ThemeProvider";
import s from "@/styles/layout/ThemeToggle.module.css";

function SunIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="3.2" fill="currentColor" />
      <g className={s.rays} stroke="currentColor" strokeWidth="1.3" strokeLinecap="round">
        <line x1="8" y1="1"    x2="8"    y2="2.5"  />
        <line x1="8" y1="13.5" x2="8"    y2="15"   />
        <line x1="1" y1="8"    x2="2.5"  y2="8"    />
        <line x1="13.5" y1="8" x2="15"   y2="8"    />
        <line x1="3.05" y1="3.05"   x2="4.11"  y2="4.11"  />
        <line x1="11.89" y1="11.89" x2="12.95" y2="12.95" />
        <line x1="12.95" y1="3.05"  x2="11.89" y2="4.11"  />
        <line x1="4.11"  y1="11.89" x2="3.05"  y2="12.95" />
      </g>
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path
        d="M12.5 9A6 6 0 0 1 5 1.5a.5.5 0 0 0-.6-.6A6.5 6.5 0 1 0 13.1 9.6a.5.5 0 0 0-.6-.6z"
        fill="currentColor"
      />
    </svg>
  );
}

type Dir = "toLight" | "toDark" | null;

export function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const [dir, setDir] = useState<Dir>(null);
  const isLight = theme === "light";

  const handleClick = () => {
    const next: Dir = isLight ? "toDark" : "toLight";
    setDir(next);
    setTimeout(() => {
      toggle();
      setDir(null);
    }, 380);
  };

  // dark→light : moon (currently visible) exits, sun enters
  // light→dark : sun (currently visible) exits, moon enters
  const sunClass = [
    s.icon, s.sun,
    dir === "toLight" ? s.enterArc : "",
    dir === "toDark"  ? s.exitArc  : "",
    !dir && isLight   ? s.visible  : "",
    !dir && !isLight  ? s.hiddenArc: "",
  ].filter(Boolean).join(" ");

  const moonClass = [
    s.icon, s.moon,
    dir === "toLight" ? s.exitArc  : "",
    dir === "toDark"  ? s.enterArc : "",
    !dir && !isLight  ? s.visible  : "",
    !dir && isLight   ? s.hiddenArc: "",
  ].filter(Boolean).join(" ");

  return (
    <button
      onClick={handleClick}
      className={s.btn}
      title={isLight ? "Switch to dark mode" : "Switch to light mode"}
      aria-label={isLight ? "Switch to dark mode" : "Switch to light mode"}
    >
      <div className={s.track}>
        <span className={sunClass}><SunIcon /></span>
        <span className={moonClass}><MoonIcon /></span>
      </div>
    </button>
  );
}
