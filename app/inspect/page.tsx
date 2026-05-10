"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { Clock, CheckCircle, AlertCircle, ShieldCheck, ShieldX, ShieldQuestion } from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { JwtInput } from "@/components/jwt/JwtInput";
import { InfoCallout } from "@/components/shared/InfoCallout";
import { JsonView } from "@/components/shared/JsonView";
import { Icon } from "@/components/shared/Icons";
import { JwtParts, formatTimestamp, isExpired, STANDARD_CLAIMS } from "@/lib/jwt";
import { verifyHmacSignature } from "@/lib/crypto";
import { JWT_EXAMPLES } from "@/lib/jwtExamples";
import "../globals.css";
import { Mono } from "@/components/shared/Mono";

const DEFAULT_EXAMPLE = JWT_EXAMPLES.find((example) => example.alg === "HS256") ?? JWT_EXAMPLES[0];

const EXPLOIT_PAGES = [
  { href: "/exploit/unverified-signature", label: "Unverified Signature", icon: Icon.Eye, color: "#06b6d4" },
  { href: "/exploit/alg-none", label: "Algorithm None", icon: Icon.AlertTriangle, color: "#f59e0b" },
  { href: "/exploit/algorithm-confusion", label: "Algorithm Confusion", icon: Icon.Zap, color: "#84cc16" },
  { href: "/exploit/kid-injection", label: "KID Injection", icon: Icon.Key, color: "#ef4444" },
  { href: "/exploit/jwk-injection", label: "JWK Injection", icon: Icon.FileKey, color: "#ec4899" },
  { href: "/exploit/jku-injection", label: "JKU Injection", icon: Icon.Globe, color: "#3b82f6" },
];

function hexToRgb(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r}, ${g}, ${b}`;
}

export default function InspectPage() {
  const [rawJwt, setRawJwt] = useState(DEFAULT_EXAMPLE.token);
  const [secret, setSecret] = useState(DEFAULT_EXAMPLE.secret ?? "");
  const [selectedExample, setSelectedExample] = useState(DEFAULT_EXAMPLE.label);
  const [parsed, setParsed] = useState<JwtParts | null>(null);

  const handleParsed = useCallback((parts: JwtParts | null) => {
    setParsed(parts);
  }, []);

  const handleExampleChange = useCallback((label: string) => {
    const example = JWT_EXAMPLES.find((candidate) => candidate.label === label);
    if (!example) return;
    setSelectedExample(example.label);
    setRawJwt(example.token);
    setSecret(example.secret ?? "");
  }, []);

  const expired = parsed ? isExpired(parsed.payload) : false;

  return (
    <PageContainer>
      <div style={{ paddingTop: "32px" }}>
        <div style={{ marginBottom: "32px" }}>
          <h1 style={{ fontSize: "32px", fontWeight: 600, color: "var(--text)", lineHeight: 1.2, margin: "0 0 8px" }}>
            Inspect Token
          </h1>
          <p style={{ fontSize: "16px", color: "var(--text-muted)", margin: 0 }}>
            Decode and analyze a JWT token without sending it anywhere.
          </p>
        </div>

        <div
          style={{
            background: "var(--bg-elevated)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius)",
            padding: "24px",
            marginBottom: "24px",
          }}
        >
          <div style={{ marginBottom: "16px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px", flexWrap: "wrap" }}>
            <span style={{ fontSize: "14px", fontWeight: 500, color: "var(--text)" }}>JWT Token</span>
            <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", color: "var(--text-muted)" }}>
              Generate example
              <select
                value={selectedExample}
                onChange={(e) => handleExampleChange(e.target.value)}
                style={{
                  height: "32px",
                  padding: "0 10px",
                  background: "var(--bg)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius)",
                  color: "var(--text)",
                  fontSize: "12px",
                  fontFamily: "var(--font-mono)",
                  outline: "none",
                }}
              >
                {JWT_EXAMPLES.map((example) => (
                  <option key={example.label} value={example.label}>
                    {example.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <JwtInput value={rawJwt} onChange={setRawJwt} onParsed={handleParsed} />
        </div>

        {parsed && (
          <>
            <div style={{ marginBottom: "24px" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "12px 16px",
                  background: expired ? "var(--danger-tint)" : "var(--success-tint)",
                  border: `1px solid ${expired ? "var(--danger-border-strong)" : "var(--success-border)"}`,
                  borderRadius: "var(--radius)",
                }}
              >
                {expired ? <AlertCircle size={15} color="var(--danger)" /> : <CheckCircle size={15} color="var(--success)" />}
                <span style={{ fontSize: "14px", fontWeight: 600, color: expired ? "var(--danger)" : "var(--success)" }}>
                  {expired ? "Token is expired" : "Token timing is valid"}
                </span>
                {typeof parsed.payload.exp === "number" && (
                  <span style={{ fontSize: "13px", color: "var(--text-muted)", marginLeft: "4px" }}>
                    - exp: {formatTimestamp(parsed.payload.exp)}
                  </span>
                )}
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr",
                gap: "16px",
                marginBottom: "24px",
              }}
            >
              <Section title="Header" accent="#e06c75">
                <JsonDisplay obj={parsed.header} />
                <div style={{ marginTop: "12px" }}>
                  <InfoRow label="Algorithm" value={String(parsed.header.alg ?? "-")} mono />
                  <InfoRow label="Type" value={String(parsed.header.typ ?? "-")} mono />
                  {parsed.header.kid != null && <InfoRow label="KID" value={String(parsed.header.kid)} mono />}
                  {parsed.header.jwk != null && <InfoRow label="JWK" value="embedded" mono />}
                  {parsed.header.jku != null && <InfoRow label="JKU" value={String(parsed.header.jku)} mono />}
                </div>
              </Section>

              <Section title="Payload" accent="#98c379">
                <JsonDisplay obj={parsed.payload} />
                <div style={{ marginTop: "12px" }}>
                  {(STANDARD_CLAIMS as readonly string[]).map((claim) => {
                    const val = parsed.payload[claim];
                    if (val === undefined) return null;
                    const isTs = ["exp", "iat", "nbf"].includes(claim);
                    return (
                      <InfoRow
                        key={claim}
                        label={claim}
                        value={isTs ? formatTimestamp(val) : String(val)}
                        mono={!isTs}
                        icon={isTs ? <Clock size={11} /> : undefined}
                        highlight={claim === "exp" && expired ? "danger" : undefined}
                      />
                    );
                  })}
                </div>
              </Section>

              <Section title="Signature" accent="#61afef">
                <SignatureVerifier parsed={parsed} secret={secret} setSecret={setSecret} />
              </Section>
            </div>

            <div
              style={{
                background: "var(--bg-elevated)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius)",
                padding: "24px",
              }}
            >
              <div style={{ fontSize: "14px", fontWeight: 500, color: "var(--text)", marginBottom: "16px" }}>
                Send to exploit page
              </div>
              <div
                style={{
                  display: "flex",
                  flexWrap: "nowrap",
                  gap: "8px",
                }}
              >
                {EXPLOIT_PAGES.map((p) => {
                  const rgb = hexToRgb(p.color);
                  return (
                    <Link
                      key={p.href}
                      href={`${p.href}?jwt=${encodeURIComponent(rawJwt)}`}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: "6px",
                        flex: "1 1 0",
                        minWidth: 0,
                        height: "36px",
                        padding: "0 12px",
                        background: `rgba(${rgb}, 0.06)`,
                        border: `1px solid rgba(${rgb}, 0.2)`,
                        borderRadius: "var(--radius)",
                        textDecoration: "none",
                        fontSize: "13px",
                        color: "var(--text-muted)",
                        whiteSpace: "nowrap",
                        transition: "background 0.15s, border-color 0.15s, color 0.15s",
                      }}
                      onMouseEnter={(e) => {
                        const el = e.currentTarget as HTMLElement;
                        el.style.background = `rgba(${rgb}, 0.14)`;
                        el.style.border = `1px solid rgba(${rgb}, 0.45)`;
                        el.style.color = p.color;
                      }}
                      onMouseLeave={(e) => {
                        const el = e.currentTarget as HTMLElement;
                        el.style.background = `rgba(${rgb}, 0.06)`;
                        el.style.border = `1px solid rgba(${rgb}, 0.2)`;
                        el.style.color = "var(--text-muted)";
                      }}
                    >
                      <span style={{ color: p.color, display: "inline-flex", flexShrink: 0 }}>
                        <p.icon size={13} />
                      </span>
                      <span style={{ flex: "1 1 auto", minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {p.label}
                      </span>
                      <Icon.ChevronRight size={11} />
                    </Link>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {!parsed && rawJwt && (
          <div
            style={{
              padding: "48px",
              textAlign: "center",
              color: "var(--text-muted)",
              fontSize: "14px",
              background: "var(--bg-elevated)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius)",
            }}
          >
            Could not parse this token - check it is a valid JWT.
          </div>
        )}
      </div>
    </PageContainer>
  );
}

function SignatureVerifier({
  parsed,
  secret,
  setSecret,
}: {
  parsed: JwtParts;
  secret: string;
  setSecret: (value: string) => void;
}) {
  const alg = String(parsed.header.alg ?? "");
  const isHmac = alg.startsWith("HS");
  const [result, setResult] = useState<boolean | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isHmac || !secret) return;

    let cancelled = false;

    async function runVerification() {
      setVerifying(true);
      setError(null);
      try {
        const bytes = new TextEncoder().encode(secret);
        const ok = await verifyHmacSignature(
          parsed.raw.header,
          parsed.raw.payload,
          parsed.raw.signature,
          bytes,
          alg
        );
        if (!cancelled) {
          setResult(ok);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Verification failed");
          setResult(null);
        }
      } finally {
        if (!cancelled) {
          setVerifying(false);
        }
      }
    }

    runVerification();

    return () => {
      cancelled = true;
    };
  }, [alg, isHmac, parsed.raw.header, parsed.raw.payload, parsed.raw.signature, secret]);

  const algFnName = alg === "HS384" ? "HMACSHA384" : alg === "HS512" ? "HMACSHA512" : "HMACSHA256";

  if (!isHmac) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        <div style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "4px" }}>
          Algorithm: <Mono>{alg || "unknown"}</Mono>
        </div>
        <InfoCallout variant="info">
          Asymmetric algorithm - signature verification requires the server&apos;s public key.
          Use{" "}
          <Link href="/exploit/algorithm-confusion" style={{ color: "var(--accent)" }}>
            Algorithm Confusion
          </Link>{" "}
          to work with RS256 tokens.
        </InfoCallout>
        <div style={{ fontSize: "11px", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
          Raw signature (Base64URL):
        </div>
        <p
          style={{
            margin: 0,
            fontFamily: "var(--font-mono)",
            fontSize: "11px",
            color: "#61afef",
            wordBreak: "break-all",
            lineHeight: 1.6,
            padding: "8px",
            background: "var(--bg)",
            borderRadius: "6px",
            border: "1px solid var(--border)",
          }}
        >
          {parsed.raw.signature || <em style={{ color: "var(--text-muted)" }}>empty</em>}
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      <div
        style={{
          padding: "12px",
          background: "var(--bg)",
          border: "1px solid var(--border)",
          borderRadius: "6px",
          fontFamily: "var(--font-mono)",
          fontSize: "11px",
          lineHeight: 1.9,
          color: "var(--text-muted)",
        }}
      >
        <span style={{ color: "var(--text-muted)" }}>{algFnName}(</span>
        <div style={{ paddingLeft: "14px" }}>
          <span style={{ color: "#e06c75" }}>base64UrlEncode(header)</span>
          <span style={{ color: "var(--text-muted)" }}> + &quot;.&quot; +</span>
          <br />
          <span style={{ color: "#98c379" }}>base64UrlEncode(payload)</span>
          <span style={{ color: "var(--text-muted)" }}>,</span>
          <br />
          <span style={{ color: "#61afef" }}>secret</span>
        </div>
        <span style={{ color: "var(--text-muted)" }}>)</span>
      </div>

      <div>
        <label style={{ display: "block", fontSize: "12px", fontWeight: 500, color: "var(--text-muted)", marginBottom: "6px" }}>
          Secret (UTF-8)
        </label>
        <input
          value={secret}
          onChange={(e) => { setSecret(e.target.value); }}
          placeholder="your-secret"
          style={{
            width: "100%",
            height: "40px",
            padding: "0 12px",
            background: "var(--bg)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius)",
            color: "var(--text)",
            fontFamily: "var(--font-mono)",
            fontSize: "12px",
            outline: "none",
          }}
          onFocus={(e) => { e.currentTarget.style.border = "1px solid var(--accent)"; }}
          onBlur={(e) => { e.currentTarget.style.border = "1px solid var(--border)"; }}
        />
        <div style={{ marginTop: "6px", fontSize: "11px", color: "var(--text-muted)" }}>
          Verification runs automatically when the secret changes.
        </div>
      </div>

      {secret && error && (
        <div style={{ fontSize: "12px", color: "var(--danger)", display: "flex", alignItems: "center", gap: "6px" }}>
          <ShieldX size={13} /> {error}
        </div>
      )}
      {secret && verifying && (
        <div style={{ fontSize: "12px", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "6px" }}>
          <ShieldQuestion size={13} /> Verifying...
        </div>
      )}
      {secret && result === true && !verifying && (
        <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--success)", display: "flex", alignItems: "center", gap: "6px" }}>
          <ShieldCheck size={14} /> Signature is valid - secret matches!
        </div>
      )}
      {secret && result === false && !error && !verifying && (
        <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--danger)", display: "flex", alignItems: "center", gap: "6px" }}>
          <ShieldX size={14} /> Signature is invalid - secret does not match.
        </div>
      )}
      {(!secret || (result === null && !error && !verifying)) && (
        <div style={{ fontSize: "12px", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "6px" }}>
          <ShieldQuestion size={13} /> Enter a secret to verify
        </div>
      )}
    </div>
  );
}

function Section({ title, accent, children }: { title: string; accent: string; children: React.ReactNode }) {
  return (
    <div
      style={{
        background: "var(--bg-elevated)",
        border: `1px solid ${accent}33`,
        borderRadius: "var(--radius)",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div style={{ padding: "10px 16px", borderBottom: `1px solid ${accent}22`, background: `${accent}0a` }}>
        <span style={{ fontSize: "12px", fontWeight: 700, color: accent, letterSpacing: "0.05em", textTransform: "uppercase" }}>{title}</span>
      </div>
      <div style={{ padding: "16px", flex: 1 }}>{children}</div>
    </div>
  );
}

function JsonDisplay({ obj }: { obj: Record<string, unknown> }) {
  return <JsonView value={JSON.stringify(obj, null, 2)} />;
}

function InfoRow({
  label,
  value,
  mono = false,
  icon,
  highlight,
}: {
  label: string;
  value: string;
  mono?: boolean;
  icon?: React.ReactNode;
  highlight?: "danger";
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "4px 0",
        borderBottom: "1px solid var(--border)",
        gap: "8px",
      }}
    >
      <span style={{ fontSize: "12px", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "4px", flexShrink: 0 }}>
        {icon}{label}
      </span>
      <span
        style={{
          fontSize: "12px",
          fontFamily: mono ? "var(--font-mono)" : undefined,
          color: highlight === "danger" ? "var(--danger)" : "var(--text)",
          textAlign: "right",
          wordBreak: "break-all",
          maxWidth: "60%",
        }}
      >
        {value}
      </span>
    </div>
  );
}
