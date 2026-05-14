"use client";

import { useState, useCallback, useEffect } from "react";
import { Link } from "@/components/shared/Link";
import { Clock, CheckCircle, AlertCircle, ShieldCheck, ShieldX, ShieldQuestion } from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { JwtInput } from "@/components/jwt/JwtInput";
import { InfoCallout } from "@/components/shared/InfoCallout";
import { JsonView } from "@/components/shared/JsonView";
import { Icon } from "@/components/shared/Icons";
import { JwtParts, formatTimestamp, isExpired, STANDARD_CLAIMS } from "@/lib/jwt";
import { verifyHmacSignature } from "@/lib/crypto";
import { JWT_EXAMPLES } from "@/lib/jwtExamples";
import { TOPIC_COLORS, JWT_PART_COLORS } from "@/lib/colors";
import { Mono } from "@/components/shared/Mono";

const DEFAULT_EXAMPLE = JWT_EXAMPLES.find((example) => example.alg === "HS256") ?? JWT_EXAMPLES[0];

const EXPLOIT_PAGES = [
  { href: "/exploit/unverified-signature", label: "Unverified Signature", icon: Icon.Eye, color: TOPIC_COLORS.unverifiedSignature },
  { href: "/exploit/alg-none", label: "Algorithm None", icon: Icon.AlertTriangle, color: TOPIC_COLORS.algNone },
  { href: "/exploit/algorithm-confusion", label: "Algorithm Confusion", icon: Icon.Zap, color: TOPIC_COLORS.algorithmConfusion },
  { href: "/exploit/kid-injection", label: "KID Injection", icon: Icon.Key, color: TOPIC_COLORS.kidInjection },
  { href: "/exploit/jwk-injection", label: "JWK Injection", icon: Icon.FileKey, color: TOPIC_COLORS.jwkInjection },
  { href: "/exploit/jku-injection", label: "JKU Injection", icon: Icon.Globe, color: TOPIC_COLORS.jkuInjection },
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
  const now = Math.floor(Date.now() / 1000);
  const notYetValid = parsed
    ? typeof parsed.payload.nbf === "number" && now < (parsed.payload.nbf as number)
    : false;

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
            marginBottom: "16px",
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
            <div style={{ marginBottom: "16px" }}>
              <div
                style={{
                  padding: "10px 16px",
                  background: expired ? "var(--danger-tint)" : notYetValid ? "rgba(245,158,11,0.06)" : "var(--success-tint)",
                  border: `1px solid ${expired ? "var(--danger-border-strong)" : notYetValid ? "rgba(245,158,11,0.35)" : "var(--success-border)"}`,
                  borderRadius: "var(--radius)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  {expired
                    ? <AlertCircle size={15} color="var(--danger)" />
                    : notYetValid
                    ? <AlertCircle size={15} color="#f59e0b" />
                    : <CheckCircle size={15} color="var(--success)" />}
                  <span style={{ fontSize: "14px", fontWeight: 600, color: expired ? "var(--danger)" : notYetValid ? "#f59e0b" : "var(--success)", whiteSpace: "nowrap" }}>
                    {expired ? "Token is expired" : notYetValid ? "Token not yet valid" : "Token timing is valid"}
                  </span>
                  <TimingTimeline payload={parsed.payload} />
                </div>
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr",
                gap: "16px",
                marginBottom: "16px",
              }}
            >
              <Section title="Header" accent={JWT_PART_COLORS.header}>
                <JsonDisplay obj={parsed.header} />
                <div style={{ marginTop: "12px" }}>
                  <InfoRow label="Algorithm" value={String(parsed.header.alg ?? "-")} mono />
                  <InfoRow label="Type" value={String(parsed.header.typ ?? "-")} mono />
                  {parsed.header.kid != null && <InfoRow label="KID" value={String(parsed.header.kid)} mono />}
                  {parsed.header.jwk != null && <InfoRow label="JWK" value="embedded" mono />}
                  {parsed.header.jku != null && <InfoRow label="JKU" value={String(parsed.header.jku)} mono />}
                </div>
              </Section>

              <Section title="Payload" accent={JWT_PART_COLORS.payload}>
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

              <Section title="Signature" accent={JWT_PART_COLORS.signature}>
                <SignatureVerifier parsed={parsed} secret={secret} setSecret={setSecret} />
              </Section>
            </div>

            <div
              style={{
                background: "var(--bg-elevated)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius)",
                padding: "16px",
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
                      variant="unstyled"
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
          Asymmetric algorithm - signature verification requires the server's public key.
          Use{" "}
          <Link href="/exploit/algorithm-confusion">
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
            color: JWT_PART_COLORS.signature,
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
          <span style={{ color: JWT_PART_COLORS.header }}>base64UrlEncode(header)</span>
          <span style={{ color: "var(--text-muted)" }}> + &quot;.&quot; +</span>
          <br />
          <span style={{ color: JWT_PART_COLORS.payload }}>base64UrlEncode(payload)</span>
          <span style={{ color: "var(--text-muted)" }}>,</span>
          <br />
          <span style={{ color: JWT_PART_COLORS.signature }}>secret</span>
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

function TimingTimeline({ payload }: { payload: Record<string, unknown> }) {
  const now = Math.floor(Date.now() / 1000);
  const iat = typeof payload.iat === "number" ? payload.iat : null;
  const nbf = typeof payload.nbf === "number" ? payload.nbf : null;
  const exp = typeof payload.exp === "number" ? payload.exp : null;

  const claimTs = [iat, nbf, exp].filter((t): t is number => t !== null);
  if (claimTs.length === 0) return null;

  const allTs = [...claimTs, now];
  const minTs = Math.min(...allTs);
  const maxTs = Math.max(...allTs);
  const range = maxTs - minTs || 7200;
  const pad = range * 0.15;
  const start = minTs - pad;
  const total = maxTs + pad - start;

  const pct = (ts: number) => `${((ts - start) / total) * 100}%`;
  const pctN = (ts: number) => ((ts - start) / total) * 100;

  const isExpired = exp !== null && now > exp;
  const isNotYetValid = nbf !== null && now < nbf;
  const nowColor = isExpired ? "var(--danger)" : isNotYetValid ? "#f59e0b" : "var(--success)";

  const validStart = nbf ?? iat ?? start;
  const validEnd = exp ?? (maxTs + pad);
  const validStartPct = pctN(validStart);
  const validWidthPct = pctN(validEnd) - validStartPct;

  const markers: Array<{ ts: number; label: string; color: string }> = [
    iat !== null ? { ts: iat, label: "iat", color: "var(--text-muted)" } : null,
    nbf !== null && nbf !== iat ? { ts: nbf, label: "nbf", color: "#f59e0b" } : null,
    exp !== null ? { ts: exp, label: "exp", color: isExpired ? "var(--danger)" : "var(--success)" } : null,
  ].filter((m): m is { ts: number; label: string; color: string } => m !== null);

  const fmtTitle = (ts: number) => new Date(ts * 1000).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: false });

  // px layout: bar centered at CONTAINER_H/2
  const CONTAINER_H = 40;
  const BAR_H = 4;
  const BAR_TOP = (CONTAINER_H - BAR_H) / 2; // 18 — bar center = 20 = container center
  const TICK_TOP = BAR_TOP - 6;              // 12 — tick starts 6px above bar
  const TICK_H = BAR_H + 12;                // 16 — tick ends 8px below bar

  const fmtDate = (ts: number) =>
    new Date(ts * 1000).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit", hour12: false });

  return (
    <div style={{ flex: 1, minWidth: 0, position: "relative", height: `${CONTAINER_H}px`, marginLeft: "12px" }}>
      {/* Bar track */}
      <div style={{ position: "absolute", left: 0, right: 0, top: `${BAR_TOP}px`, height: `${BAR_H}px`, borderRadius: "2px", background: "rgba(128,128,128,0.18)" }}>
        <div style={{ position: "absolute", left: `${validStartPct}%`, width: `${Math.max(0, validWidthPct)}%`, top: 0, bottom: 0, background: "var(--success)", opacity: 0.28, borderRadius: "2px" }} />
        {exp !== null && (
          <div style={{ position: "absolute", left: pct(exp), right: 0, top: 0, bottom: 0, background: "var(--danger)", opacity: 0.22, borderRadius: "0 2px 2px 0" }} />
        )}
      </div>

      {/* Claim markers */}
      {markers.map((m) => (
        <div key={m.label} style={{ position: "absolute", left: pct(m.ts), top: 0, bottom: 0, transform: "translateX(-50%)", pointerEvents: "none" }}>
          <div style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", fontSize: "9px", fontWeight: 700, color: m.color, fontFamily: "var(--font-mono)", whiteSpace: "nowrap", lineHeight: 1 }}>{m.label}</div>
          <div style={{ position: "absolute", top: `${TICK_TOP}px`, left: "50%", transform: "translateX(-50%)", width: "1.5px", height: `${TICK_H}px`, background: m.color, borderRadius: "1px" }} />
          <div style={{ position: "absolute", bottom: 0, left: "50%", transform: "translateX(-50%)", fontSize: "9px", color: m.color, fontFamily: "var(--font-mono)", whiteSpace: "nowrap", lineHeight: 1, opacity: 0.8 }}>{fmtDate(m.ts)}</div>
        </div>
      ))}

      {/* Now indicator */}
      <div style={{ position: "absolute", left: pct(now), top: 0, bottom: 0, transform: "translateX(-50%)", pointerEvents: "none", zIndex: 1 }}>
        <div style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", fontSize: "9px", fontWeight: 700, color: nowColor, fontFamily: "var(--font-mono)", whiteSpace: "nowrap", lineHeight: 1 }}>now</div>
        <div style={{ position: "absolute", top: `${TICK_TOP - 1}px`, left: "50%", transform: "translateX(-50%)", width: 0, height: 0, borderLeft: "3px solid transparent", borderRight: "3px solid transparent", borderTop: `4px solid ${nowColor}` }} />
        <div style={{ position: "absolute", top: `${TICK_TOP + 3}px`, left: "50%", transform: "translateX(-50%)", width: "2px", height: `${TICK_H - 3}px`, background: nowColor, borderRadius: "1px" }} />
      </div>
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
