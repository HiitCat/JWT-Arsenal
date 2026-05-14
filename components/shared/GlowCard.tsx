"use client";

import React, { useRef } from "react";
import { Link } from "@/components/shared/Link";
import s from "@/styles/shared/GlowCard.module.css";

export function hexToRgb(hex: string): string {
  return `${parseInt(hex.slice(1, 3), 16)}, ${parseInt(hex.slice(3, 5), 16)}, ${parseInt(hex.slice(5, 7), 16)}`;
}

interface GlowCardProps {
  color: string;
  href?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}

export function GlowCard({ color, href, style, children }: GlowCardProps) {
  const rgb = hexToRgb(color);
  const spotRef = useRef<HTMLDivElement>(null);

  const dynamicStyle: React.CSSProperties = {
    border: `1px solid rgba(${rgb}, 0.18)`,
    background: `linear-gradient(145deg, rgba(${rgb}, 0.04) 0%, var(--bg-elevated) 60%)`,
    ...style,
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    if (!spotRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    spotRef.current.style.background = `radial-gradient(220px circle at ${e.clientX - rect.left}px ${e.clientY - rect.top}px, rgba(${rgb}, 0.13) 0%, transparent 70%)`;
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLElement>) => {
    const el = e.currentTarget as HTMLElement;
    el.style.border = `1px solid rgba(${rgb}, 0.45)`;
    el.style.boxShadow = `0 4px 28px rgba(${rgb}, 0.1)`;
    if (spotRef.current) spotRef.current.style.opacity = "1";
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLElement>) => {
    const el = e.currentTarget as HTMLElement;
    el.style.border = `1px solid rgba(${rgb}, 0.18)`;
    el.style.boxShadow = "none";
    if (spotRef.current) {
      spotRef.current.style.opacity = "0";
      spotRef.current.style.background = "none";
    }
  };

  const overlays = (
    <>
      <div ref={spotRef} aria-hidden className={s.spotlight} />
      <div
        aria-hidden
        className={s.cornerGlow}
        style={{ background: `radial-gradient(ellipse at top right, rgba(${rgb}, 0.07) 0%, transparent 70%)` }}
      />
    </>
  );

  const sharedProps = {
    className: s.card,
    style: dynamicStyle,
    onMouseMove: handleMouseMove,
    onMouseEnter: handleMouseEnter,
    onMouseLeave: handleMouseLeave,
  };

  if (href) {
    return <Link href={href} variant="unstyled" {...sharedProps}>{overlays}{children}</Link>;
  }

  return <div {...sharedProps}>{overlays}{children}</div>;
}
