"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { TOPIC_COLORS } from "@/lib/colors";
import { useEffect, useState } from "react";
import { Icon } from "@/components/shared/Icons";

const exploits = [
  { href: "/exploit/unverified-signature", label: "Unverified Signature", icon: Icon.Eye,           color: TOPIC_COLORS.unverifiedSignature },
  { href: "/exploit/alg-none",             label: "Algorithm None",       icon: Icon.AlertTriangle, color: TOPIC_COLORS.algNone },
  { href: "/exploit/algorithm-confusion",  label: "Algorithm Confusion",  icon: Icon.Zap,           color: TOPIC_COLORS.algorithmConfusion },
  { href: "/exploit/kid-injection",        label: "KID Injection",        icon: Icon.Key,           color: TOPIC_COLORS.kidInjection },
  { href: "/exploit/jwk-injection",        label: "JWK Injection",        icon: Icon.FileKey,       color: TOPIC_COLORS.jwkInjection },
  { href: "/exploit/jku-injection",        label: "JKU Injection",        icon: Icon.Globe,         color: TOPIC_COLORS.jkuInjection },
  { href: "/exploit/public-key-recovery",  label: "Public Key Recovery",  icon: Icon.Lock,          color: TOPIC_COLORS.publicKeyRecovery },
];

function hexToRgb(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r}, ${g}, ${b}`;
}

export function Sidebar() {
  const pathname = usePathname();
  const [exploitsOpen, setExploitsOpen] = useState(true);
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem("jwt-arsenal-sidebar-collapsed") === "true";
  });

  const isActive = (href: string) => pathname === href || pathname === href + "/";

  useEffect(() => {
    window.localStorage.setItem("jwt-arsenal-sidebar-collapsed", String(collapsed));
  }, [collapsed]);

  return (
    <aside
      style={{
        width: collapsed ? "68px" : "var(--sidebar-width)",
        minWidth: collapsed ? "68px" : "var(--sidebar-width)",
        background: "var(--bg-elevated)",
        borderRight: "1px solid var(--border)",
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        position: "sticky",
        top: 0,
        overflowY: "auto",
        transition: "width 0.18s ease, min-width 0.18s ease",
      }}
    >
      {/* Logo */}
      <div style={{ padding: collapsed ? "16px 10px" : "20px 16px 16px", borderBottom: "1px solid var(--border)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: collapsed ? "center" : "space-between", gap: "8px" }}>
          {!collapsed && (
            <a
              href="/"
              title="JWT Arsenal"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-start",
                gap: "12px",
                textDecoration: "none",
                minWidth: 0,
                flex: 1,
              }}
            >
              <Icon.Logo size={16} />
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontWeight: 700,
                  fontSize: "14px",
                  background: "var(--gradient-logo)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  letterSpacing: "-0.02em",
                }}
              >
                JWT Arsenal
              </span>
            </a>
          )}
          <button
            type="button"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            onClick={() => setCollapsed((value) => !value)}
            style={{
              width: collapsed ? "44px" : "28px",
              height: collapsed ? "44px" : "28px",
              borderRadius: "var(--radius)",
              border: "1px solid var(--border)",
              background: "transparent",
              color: "var(--text-muted)",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              flexShrink: 0,
              position: "relative",
            }}
          >
            <span
              style={{
                display: "inline-flex",
                position: "absolute",
                inset: 0,
                alignItems: "center",
                justifyContent: "center",
                transform: collapsed ? "rotate(0deg)" : "rotate(180deg)",
                transition: "transform 0.15s ease",
              }}
            >
              <Icon.ChevronRight size={14} />
            </span>
          </button>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "10px 8px" }}>
        <NavItem href="/inspect" icon={Icon.Search} label="Inspect Token" isActive={isActive("/inspect")} collapsed={collapsed} />
        <SectionDivider collapsed={collapsed} />

        {/* Exploits section */}
        <div style={{ marginTop: "8px" }}>
          {!collapsed && (
            <button
              onClick={() => setExploitsOpen((o) => !o)}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "6px 8px",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                color: "var(--text-muted)",
                fontSize: "10px",
                fontWeight: 700,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
              }}
            >
              Exploits
              <span
                style={{
                  display: "inline-flex",
                  transform: exploitsOpen ? "rotate(0deg)" : "rotate(-90deg)",
                  transition: "transform 0.15s",
                }}
              >
                <Icon.ChevronDown size={12} />
              </span>
            </button>
          )}
          {(collapsed || exploitsOpen) && (
            <div style={{ marginTop: "2px" }}>
              {exploits.map((e) => (
                <ExploitNavItem
                  key={e.href}
                  href={e.href}
                  icon={e.icon}
                  label={e.label}
                  color={e.color}
                  isActive={isActive(e.href)}
                  collapsed={collapsed}
                />
              ))}
            </div>
          )}
        </div>
        <SectionDivider collapsed={collapsed} />

        {/* Reference */}
        <div style={{ marginTop: "16px" }}>
          {!collapsed && (
            <div
              style={{
                padding: "6px 8px",
                color: "var(--text-muted)",
                fontSize: "10px",
                fontWeight: 700,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
              }}
            >
              Reference
            </div>
          )}
          <NavItem href="/cheatsheet"     icon={Icon.Terminal}  label="CLI Cheatsheet"  isActive={isActive("/cheatsheet")} collapsed={collapsed} hoverMode="reference" />
          <NavItem href="/knowledge-base" icon={Icon.BookOpen}  label="Knowledge Base"  isActive={isActive("/knowledge-base")} collapsed={collapsed} hoverMode="reference" />
          <NavItem href="/about"          icon={Icon.Info}      label="About"           isActive={isActive("/about")} collapsed={collapsed} hoverMode="reference" />
        </div>
      </nav>

      {/* Footer badge */}
      <div
        style={{
          padding: collapsed ? "12px 10px" : "12px 16px",
          borderTop: "1px solid var(--border)",
          display: "flex",
          alignItems: "center",
          gap: "6px",
          justifyContent: collapsed ? "center" : "flex-start",
        }}
        title={collapsed ? "100% client-side - No data leaves your browser" : undefined}
      >
        <span style={{ color: "var(--accent)" }}><Icon.Lock size={11} /></span>
        {!collapsed && (
          <span style={{ fontSize: "11px", color: "var(--text-muted)", lineHeight: 1.4 }}>
            100% client-side
            <br />
            No data leaves your browser
          </span>
        )}
      </div>
    </aside>
  );
}

function SectionDivider({ collapsed }: { collapsed: boolean }) {
  return (
    <div
      style={{
        height: "1px",
        margin: collapsed ? "12px 6px" : "12px 8px",
        background: "var(--border)",
        opacity: 0.8,
      }}
    />
  );
}

function NavItem({
  href,
  icon: NavIcon,
  label,
  isActive,
  collapsed,
  hoverMode = "default",
}: {
  href: string;
  icon: (p: { size?: number }) => React.ReactElement;
  label: string;
  isActive: boolean;
  collapsed: boolean;
  hoverMode?: "default" | "reference";
}) {
  return (
    <a
      href={href}
      title={collapsed ? label : undefined}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: collapsed ? "center" : "flex-start",
        gap: collapsed ? 0 : "8px",
        padding: collapsed ? "0" : "7px 8px",
        width: collapsed ? "44px" : undefined,
        height: collapsed ? "44px" : undefined,
        boxSizing: "border-box",
        borderRadius: "var(--radius)",
        textDecoration: "none",
        color: isActive ? "var(--text)" : "var(--text-muted)",
        background: isActive ? "var(--accent-tint)" : "transparent",
        fontSize: collapsed ? "13px" : "14px",
        fontWeight: collapsed ? 400 : 500,
        marginBottom: "1px",
        transition: "color 0.1s, background 0.1s",
        borderWidth: collapsed ? "0" : "0 0 0 2px",
        borderStyle: "solid",
        borderColor: collapsed ? "transparent" : isActive ? "var(--accent)" : "transparent",
        boxShadow: collapsed && isActive ? "inset 0 0 0 1px var(--accent-border-soft)" : undefined,
      }}
      onMouseEnter={(e) => {
        if (!isActive && !collapsed && hoverMode === "reference") {
          (e.currentTarget as HTMLElement).style.background = "var(--surface-overlay-hover)";
          (e.currentTarget as HTMLElement).style.color = "var(--text)";
        }
      }}
      onMouseLeave={(e) => {
        if (!isActive && !collapsed && hoverMode === "reference") {
          (e.currentTarget as HTMLElement).style.background = "transparent";
          (e.currentTarget as HTMLElement).style.color = "var(--text-muted)";
        }
      }}
    >
      <span style={{ color: isActive ? "var(--accent)" : "var(--text-muted)", display: "inline-flex" }}>
        <NavIcon size={collapsed ? 14 : 16} />
      </span>
      {!collapsed && label}
    </a>
  );
}

function ExploitNavItem({
  href,
  icon: NavIcon,
  label,
  color,
  isActive,
  collapsed,
}: {
  href: string;
  icon: (p: { size?: number }) => React.ReactElement;
  label: string;
  color: string;
  isActive: boolean;
  collapsed: boolean;
}) {
  const rgb = hexToRgb(color);
  return (
    <a
      href={href}
      title={collapsed ? label : undefined}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: collapsed ? "center" : "flex-start",
        gap: collapsed ? 0 : "8px",
        padding: collapsed ? "0" : "6px 8px",
        width: collapsed ? "44px" : undefined,
        height: collapsed ? "44px" : undefined,
        boxSizing: "border-box",
        borderRadius: "var(--radius)",
        textDecoration: "none",
        color: isActive ? "var(--text)" : "var(--text-muted)",
        background: isActive ? `rgba(${rgb}, 0.1)` : "transparent",
        fontSize: collapsed ? "13px" : "14px",
        fontWeight: collapsed ? 400 : 500,
        marginBottom: "1px",
        transition: "color 0.1s, background 0.1s",
        borderWidth: collapsed ? "0" : "0 0 0 2px",
        borderStyle: "solid",
        borderColor: collapsed ? "transparent" : isActive ? color : "transparent",
        boxShadow: collapsed && isActive ? `inset 0 0 0 1px rgba(${rgb}, 0.35)` : undefined,
      }}
      onMouseEnter={(e) => {
        if (!isActive) {
          (e.currentTarget as HTMLElement).style.background = `rgba(${rgb}, 0.06)`;
          (e.currentTarget as HTMLElement).style.color = "var(--text)";
        }
      }}
      onMouseLeave={(e) => {
        if (!isActive) {
          (e.currentTarget as HTMLElement).style.background = "transparent";
          (e.currentTarget as HTMLElement).style.color = "var(--text-muted)";
        }
      }}
    >
      <span style={{ color: isActive ? color : `rgba(${rgb}, 0.6)`, display: "inline-flex", flexShrink: 0 }}>
        <NavIcon size={collapsed ? 13 : 15} />
      </span>
      {!collapsed && label}
    </a>
  );
}
