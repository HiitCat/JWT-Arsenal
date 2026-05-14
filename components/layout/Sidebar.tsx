"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { TOPIC_COLORS } from "@/lib/colors";
import { useEffect, useState } from "react";
import { Icon } from "@/components/shared/Icons";
import { Link } from "@/components/shared/Link";
import clsx from "clsx";
import s from "@/styles/layout/Sidebar.module.css";

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
    <aside className={clsx(s.sidebar, collapsed && s.collapsed)}>
      {/* Logo */}
      <div className={s.logoBar}>
        <div className={s.logoRow}>
          {!collapsed && (
            <Link href="/" variant="unstyled" className={s.logoLink} title="JWT Arsenal">
              <Icon.Logo size={16} />
              <span className={s.logoText}>JWT Arsenal</span>
            </Link>
          )}
          <button
            type="button"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            onClick={() => setCollapsed((v) => !v)}
            className={s.collapseBtn}
          >
            <span className={clsx(s.collapseBtnIcon, !collapsed && s.rotated)}>
              <Icon.ChevronRight size={14} />
            </span>
          </button>
        </div>
      </div>

      {/* Nav */}
      <nav className={s.nav}>
        <NavItem href="/inspect" icon={Icon.Search} label="Inspect Token" isActive={isActive("/inspect")} collapsed={collapsed} />
        <div className={s.divider} />

        <div className={s.exploitsSection}>
          {!collapsed && (
            <button className={s.sectionLabel} onClick={() => setExploitsOpen((o) => !o)}>
              Exploits
              <span className={clsx(s.chevron, !exploitsOpen && s.up)}>
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

        <div className={s.divider} />

        <div className={s.referenceSection}>
          {!collapsed && <div className={s.sectionLabelText}>Reference</div>}
          <NavItem href="/cheatsheet"     icon={Icon.Terminal} label="CLI Cheatsheet" isActive={isActive("/cheatsheet")}     collapsed={collapsed} hoverMode="reference" />
          <NavItem href="/knowledge-base" icon={Icon.BookOpen} label="Knowledge Base" isActive={isActive("/knowledge-base")} collapsed={collapsed} hoverMode="reference" />
          <NavItem href="/about"          icon={Icon.Info}     label="About"          isActive={isActive("/about")}          collapsed={collapsed} hoverMode="reference" />
        </div>
      </nav>

      {/* Footer */}
      <div className={s.footer} title={collapsed ? "100% client-side - No data leaves your browser" : undefined}>
        <span className={s.footerIcon}><Icon.Lock size={11} /></span>
        {!collapsed && (
          <span className={s.footerText}>
            100% client-side<br />
            No data leaves your browser
          </span>
        )}
      </div>
    </aside>
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
    <Link
      href={href}
      variant="unstyled"
      title={collapsed ? label : undefined}
      className={clsx(s.navItem, isActive && s.active, hoverMode === "reference" && s.reference)}
    >
      <span className={s.navIcon}>
        <NavIcon size={collapsed ? 14 : 16} />
      </span>
      {!collapsed && label}
    </Link>
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
    <Link
      href={href}
      variant="unstyled"
      title={collapsed ? label : undefined}
      className={s.exploitItem}
      style={{
        color: isActive ? "var(--text)" : "var(--text-muted)",
        background: isActive ? `rgba(${rgb}, 0.1)` : "transparent",
        borderLeftColor: !collapsed && isActive ? color : "transparent",
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
    </Link>
  );
}
