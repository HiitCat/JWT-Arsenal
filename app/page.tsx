"use client";

import React from "react";
import { Icon } from "@/components/shared/Icons";
import { PageContainer } from "@/components/layout/PageContainer";
import { GlowCard, hexToRgb } from "@/components/shared/GlowCard";
import { Link } from "@/components/shared/Link";
import { TOPIC_COLORS } from "@/lib/colors";

const techniques = [
  {
    href: "/exploit/unverified-signature",
    name: "Unverified Signature",
    description: "Server accepts tokens without verifying the signature - modify any claim freely.",
    icon: Icon.Eye,
    color: TOPIC_COLORS.unverifiedSignature,
  },
  {
    href: "/exploit/alg-none",
    name: "Algorithm None",
    description: 'Set alg to "none" and strip the signature - servers might accept unsigned tokens.',
    icon: Icon.AlertTriangle,
    color: TOPIC_COLORS.algNone,
  },
  {
    href: "/exploit/algorithm-confusion",
    name: "Algorithm Confusion",
    description: "Server uses RS256 but accepts HS256 - sign with the public key as HMAC secret.",
    icon: Icon.Zap,
    color: TOPIC_COLORS.algorithmConfusion,
  },
  {
    href: "/exploit/kid-injection",
    name: "KID Injection",
    description: "Inject path traversal or SQL into the kid header to control which key is used.",
    icon: Icon.Key,
    color: TOPIC_COLORS.kidInjection,
  },
  {
    href: "/exploit/jwk-injection",
    name: "JWK Injection",
    description: "Embed your own public JWK in the header - servers might use it to verify your forged token.",
    icon: Icon.FileKey,
    color: TOPIC_COLORS.jwkInjection,
  },
  {
    href: "/exploit/jku-injection",
    name: "JKU Injection",
    description: "Point JKU to an attacker-controlled JWKS endpoint to supply your own signing key.",
    icon: Icon.Globe,
    color: TOPIC_COLORS.jkuInjection,
  },
  {
    href: "/exploit/public-key-recovery",
    name: "Public Key Recovery",
    description: "Recover the RSA public key from two signatures, then perform algorithm confusion.",
    icon: Icon.Lock,
    color: TOPIC_COLORS.publicKeyRecovery,
  },
];

export default function HomePage() {
  return (
    <PageContainer>
      {/* Hero */}
      <div
        style={{
          padding: "56px 0 40px",
          borderBottom: "1px solid var(--border)",
          marginBottom: "48px",
          position: "relative",
        }}
      >
        <h1
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            fontSize: "40px",
            fontWeight: 700,
            lineHeight: 1.15,
            margin: "0 0 12px",
            fontFamily: "var(--font-mono)",
            letterSpacing: "-0.03em",
          }}
        >
          <span style={{ display: "inline-flex", color: "var(--accent)", flexShrink: 0 }}>
            <Icon.Logo size={32} />
          </span>
          <span
            style={{
              display: "inline-block",
              background: "var(--gradient-logo)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            JWT Arsenal
          </span>
        </h1>

        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            padding: "4px 12px",
            background: "var(--success-tint)",
            border: "1px solid var(--success-border)",
            borderRadius: "100px",
            fontSize: "12px",
            color: "var(--success)",
            fontWeight: 500,
            marginBottom: "16px",
          }}
        >
          <Icon.Lock size={11} />
          100% client-side · No data leaves your browser
        </div>

        <p
          style={{
            fontSize: "16px",
            color: "var(--text-muted)",
            maxWidth: "560px",
            lineHeight: 1.7,
            margin: "0 0 32px",
          }}
        >
          A client-side JWT exploitation toolkit for pentesters, bug bounty hunters, and CTF players.
          Debug tokens, forge exploits, and understand JWT vulnerabilities - all in your browser.
        </p>
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <Link
            href="/debug"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              height: "40px",
              padding: "0 20px",
              background: "var(--accent)",
              color: "var(--bg)",
              borderRadius: "var(--radius)",
              textDecoration: "none",
              fontSize: "14px",
              fontWeight: 600,
              boxShadow: "0 0 20px var(--accent-border-mid)",
            }}
          >
            <Icon.Search size={14} />
            Debug a JWT
          </Link>
          <Link
            href="/cheatsheet"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              height: "40px",
              padding: "0 16px",
              background: "transparent",
              color: "var(--text-muted)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius)",
              textDecoration: "none",
              fontSize: "14px",
              fontWeight: 500,
            }}
          >
            <Icon.Terminal size={14} />
            CLI Cheatsheet
          </Link>
          <Link
            href="/knowledge-base"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              height: "40px",
              padding: "0 16px",
              background: "transparent",
              color: "var(--text-muted)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius)",
              textDecoration: "none",
              fontSize: "14px",
              fontWeight: 500,
            }}
          >
            <Icon.BookOpen size={14} />
            Knowledge Base
          </Link>
        </div>
      </div>

      {/* Techniques grid */}
      <div style={{ marginBottom: "48px", borderBottom: "1px solid var(--border)", paddingBottom: "48px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
          <h2 style={{ fontSize: "20px", fontWeight: 600, color: "var(--text)", margin: 0 }}>
            Exploitation Techniques
          </h2>
          <span
            style={{
              fontSize: "11px",
              fontFamily: "var(--font-mono)",
              color: "var(--text-muted)",
              background: "var(--bg-elevated)",
              border: "1px solid var(--border)",
              padding: "2px 8px",
              borderRadius: "100px",
            }}
          >
            {techniques.length} attacks
          </span>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: "12px",
          }}
        >
          {techniques.map((t) => (
            <TechniqueCard key={t.href} {...t} />
          ))}
        </div>
      </div>

      {/* Why section */}
      <div
        style={{
          padding: "32px",
          background: "var(--bg-elevated)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius)",
          marginBottom: "32px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            width: "300px",
            height: "200px",
            background: "radial-gradient(ellipse at top right, var(--accent-subtle) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />
        <h2 style={{ fontSize: "20px", fontWeight: 600, color: "var(--text)", marginBottom: "16px" }}>
          Why JWT Arsenal?
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px", maxWidth: "100%" }}>
          <p style={{ fontSize: "14px", color: "var(--text-muted)", lineHeight: 1.7, margin: 0 }}>
            <Link href="https://jwt.io">jwt.io</Link>{" "} and <Link href="https://token.dev">token.dev</Link>{" "}are great for decoding, but they
            don't help you exploit.</p>
          <p style={{ fontSize: "14px", color: "var(--text-muted)", lineHeight: 1.7, margin: 0 }}>
            Every JWT exploitation tool you'll find is CLI-only -{" "}
            <Link href="https://github.com/ticarpi/jwt_tool">jwt_tool</Link>
            {", "}
            <Link href="https://github.com/hashcat/hashcat">hashcat</Link>, or custom Python scripts. There's no browser-based UI for forging attack-specific tokens.
          </p>
          <p style={{ fontSize: "14px", color: "var(--text-muted)", lineHeight: 1.7, margin: 0 }}>
            JWT Arsenal fills that gap. Every cryptographic operation runs in your browser using the Web
            Crypto API. No token, key, or payload ever leaves your machine.
          </p>
          <p style={{ fontSize: "14px", color: "var(--text-muted)", lineHeight: 1.7, margin: 0 }}>
            For operations too heavy for the browser (brute-force, GCD-based key recovery), JWT Arsenal
            provides ready-to-paste CLI commands in the{" "}
            <Link href="/cheatsheet">Cheatsheet</Link>
            {" "}and deep technical context in the{" "}
            <Link href="/knowledge-base">Knowledge Base</Link>.
          </p>
        </div>
      </div>

      {/* Debug CTA */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "24px 32px",
          background: "linear-gradient(135deg, var(--accent-faint) 0%, var(--accent-subtle) 100%)",
          border: "1px solid var(--accent-border)",
          borderRadius: "var(--radius)",
          flexWrap: "wrap",
          gap: "16px",
          boxShadow: "inset 0 1px 0 var(--surface-overlay-hover)",
        }}
      >
        <div>
          <div style={{ fontSize: "16px", fontWeight: 600, color: "var(--text)", marginBottom: "4px" }}>
            Start by debugging a token
          </div>
          <div style={{ fontSize: "14px", color: "var(--text-muted)" }}>
            Decode headers, claims, and timestamps - then send it to any exploit page.
          </div>
        </div>
        <Link
          href="/debug"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            height: "40px",
            padding: "0 20px",
            background: "var(--accent)",
            color: "var(--bg)",
            borderRadius: "var(--radius)",
            textDecoration: "none",
            fontSize: "14px",
            fontWeight: 600,
            flexShrink: 0,
            boxShadow: "0 0 16px var(--accent-border)",
          }}
        >
          Open Debugger <Icon.ChevronRight size={14} />
        </Link>
      </div>
    </PageContainer>
  );
}

function TechniqueCard({ href, name, description, icon: CardIcon, color }: {
  href: string;
  name: string;
  description: string;
  icon: (p: { size?: number }) => React.ReactElement;
  color: string;
}) {
  const rgb = hexToRgb(color);
  return (
    <GlowCard color={color} href={href} style={{ display: "flex", alignItems: "center", gap: "14px", padding: "20px" }}>
      <div style={{ width: "34px", height: "34px", borderRadius: "8px", background: `rgba(${rgb}, 0.12)`, border: `1px solid rgba(${rgb}, 0.25)`, display: "flex", alignItems: "center", justifyContent: "center", color, flexShrink: 0 }}>
        <CardIcon size={15} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <h3 style={{ fontSize: "14px", fontWeight: 600, color: "var(--text)", margin: "0 0 6px" }}>{name}</h3>
        <p style={{ fontSize: "12px", color: "var(--text-muted)", lineHeight: 1.65, margin: 0 }}>{description}</p>
      </div>
    </GlowCard>
  );
}
