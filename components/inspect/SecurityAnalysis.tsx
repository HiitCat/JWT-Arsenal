"use client";

import { AlertCircle, Info, ShieldCheck, ShieldQuestion, ShieldX } from "lucide-react";
import { Link } from "@/components/shared/Link";
import { Icon } from "@/components/shared/Icons";
import { analyzeJwt, type SecurityFinding, type Severity } from "@/lib/securityAnalysis";
import { SEVERITY_COLORS } from "@/lib/colors";
import s from "@/styles/inspect/SecurityAnalysis.module.css";

const SEVERITY_COLOR: Record<Severity, string> = SEVERITY_COLORS;

const SEVERITY_LEVELS: Severity[] = ["critical", "high", "medium", "low", "info"];

const SEVERITY_ROW_BG: Record<Severity, string> = {
  critical: "18", high: "10", medium: "0c", low: "09", info: "06",
};

const SEVERITY_ICON_BG: Record<Severity, string> = {
  critical: "22", high: "1a", medium: "16", low: "14", info: "10",
};

const FINDING_EXPLOITS: Partial<Record<string, string>> = {
  "alg-none":           "/exploit/alg-none",
  "alg-symmetric":      "/exploit/secret-bruteforce",
  "alg-confusion-risk": "/exploit/algorithm-confusion",
  "jku-present":        "/exploit/jku-injection",
  "jwk-present":        "/exploit/jwk-injection",
  "kid-present":        "/exploit/kid-injection",
};

export function SecurityAnalysis({
  header,
  payload,
  rawJwt,
}: {
  header: Record<string, unknown>;
  payload: Record<string, unknown>;
  rawJwt: string;
}) {
  const findings = analyzeJwt(header, payload);
  const counts = findings.reduce((acc, f) => {
    acc[f.severity] = (acc[f.severity] ?? 0) + 1;
    return acc;
  }, {} as Partial<Record<Severity, number>>);

  return (
    <div className={s.wrapper}>
      <div className={s.header}>
        <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.05em", textTransform: "uppercase" }}>
          Security Analysis
        </span>
        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
          {findings.length === 0 ? (
            <span style={{ fontSize: "12px", color: "var(--success)", display: "flex", alignItems: "center", gap: "5px" }}>
              <ShieldCheck size={13} /> Clean
            </span>
          ) : (
            SEVERITY_LEVELS.filter(s => counts[s]).map(s => (
              <span key={s} style={{
                fontSize: "10px", fontWeight: 700, letterSpacing: "0.06em",
                color: SEVERITY_COLOR[s],
                border: `1px solid ${SEVERITY_COLOR[s]}55`,
                borderRadius: "4px", padding: "2px 7px",
                textTransform: "uppercase", whiteSpace: "nowrap",
              }}>
                {counts[s]} {s}
              </span>
            ))
          )}
        </div>
      </div>

      {findings.length === 0 ? (
        <div style={{ padding: "20px 16px", display: "flex", alignItems: "center", gap: "10px" }}>
          <ShieldCheck size={16} color="var(--success)" />
          <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>
            No obvious vulnerabilities detected in this token's header or payload.
          </span>
        </div>
      ) : (
        <div>
          {findings.map((f) => (
            <FindingRow key={f.id} finding={f} rawJwt={rawJwt} />
          ))}
        </div>
      )}
    </div>
  );
}

function FindingRow({ finding, rawJwt }: { finding: SecurityFinding; rawJwt: string }) {
  const color = SEVERITY_COLOR[finding.severity];
  const exploitBase = FINDING_EXPLOITS[finding.id];
  const exploitHref = exploitBase ? `${exploitBase}?jwt=${encodeURIComponent(rawJwt)}` : undefined;
  const SeverityIcon =
    finding.severity === "critical" || finding.severity === "high" ? ShieldX
    : finding.severity === "medium" ? AlertCircle
    : finding.severity === "low"    ? ShieldQuestion
    : Info;

  return (
    <div
      className={s.findingRow}
      style={{
        borderLeft: `3px solid ${color}`,
        background: `${color}${SEVERITY_ROW_BG[finding.severity]}`,
      }}
    >
      <div
        className={s.findingIcon}
        style={{
          background: `${color}${SEVERITY_ICON_BG[finding.severity]}`,
          border: `1px solid ${color}35`,
          color,
        }}
      >
        <SeverityIcon size={17} />
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "3px", flexWrap: "wrap" }}>
          <span style={{
            fontSize: "10px", fontWeight: 700, letterSpacing: "0.06em",
            color, border: `1px solid ${color}55`,
            borderRadius: "4px", padding: "1px 6px",
            textTransform: "uppercase", whiteSpace: "nowrap", flexShrink: 0,
          }}>
            {finding.severity}
          </span>
          <span style={{ fontSize: "13px", fontWeight: 500, color: "var(--text)" }}>
            {finding.title}
          </span>
        </div>
        <div style={{ fontSize: "12px", color: "var(--text-muted)", lineHeight: 1.6 }}>
          {finding.detail}
        </div>
      </div>

      {exploitHref && (
        <Link
          href={exploitHref}
          variant="unstyled"
          style={{
            flexShrink: 0,
            display: "flex", alignItems: "center", gap: "5px",
            height: "30px", padding: "0 11px",
            background: `${color}10`, border: `1px solid ${color}40`,
            borderRadius: "var(--radius)",
            fontSize: "12px", fontWeight: 500, color,
            whiteSpace: "nowrap",
            transition: "background 0.15s, border-color 0.15s",
          }}
          onMouseEnter={(e) => {
            const el = e.currentTarget as HTMLElement;
            el.style.background = `${color}20`;
            el.style.borderColor = `${color}80`;
          }}
          onMouseLeave={(e) => {
            const el = e.currentTarget as HTMLElement;
            el.style.background = `${color}10`;
            el.style.borderColor = `${color}40`;
          }}
        >
          Exploit <Icon.ChevronRight size={12} />
        </Link>
      )}
    </div>
  );
}
