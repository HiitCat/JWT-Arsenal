import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import { ExternalLink, Lock } from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { InfoCallout } from "@/components/shared/InfoCallout";
import "../globals.css";

export const metadata: Metadata = pageMeta(
  "About JWT Arsenal",
  "A 100% client-side JWT exploitation toolkit for security professionals. No data leaves your browser. Built for pentesters, CTF players, and bug bounty hunters.",
  "/about",
);

export default function AboutPage() {
  return (
    <PageContainer>
      <div style={{ paddingTop: "32px" }}>
        <div style={{ marginBottom: "32px" }}>
          <h1 style={{ fontSize: "32px", fontWeight: 600, color: "var(--text)", lineHeight: 1.2, margin: "0 0 8px" }}>
            About JWT Arsenal
          </h1>
          <p style={{ fontSize: "16px", color: "var(--text-muted)", margin: 0 }}>
            A client-side JWT exploitation toolkit for security professionals.
          </p>
        </div>

        {/* Legal disclaimer */}
        <div style={{ marginBottom: "32px" }}>
          <InfoCallout variant="danger" title="Legal Disclaimer - Read Before Use">
            <p style={{ margin: "0 0 8px" }}>
              JWT Arsenal is intended exclusively for:
            </p>
            <ul style={{ margin: 0, paddingLeft: "20px", lineHeight: 2 }}>
              <li><strong>Authorized penetration tests</strong> - you have written permission to test the target system</li>
              <li><strong>Bug bounty programs</strong> - within scope as defined by the program</li>
              <li><strong>CTF competitions</strong> - in sandboxed challenge environments</li>
              <li><strong>Security research</strong> - in controlled lab environments you own</li>
            </ul>
            <p style={{ margin: "12px 0 0" }}>
              Using this tool against systems you do not have explicit written authorization to test is illegal under the Computer Fraud and Abuse Act (CFAA), the Computer Misuse Act (UK), and equivalent laws worldwide. The author assumes no liability for misuse.
            </p>
          </InfoCallout>
        </div>

        {/* Privacy model */}
        <div
          style={{
            background: "var(--bg-elevated)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius)",
            padding: "24px",
            marginBottom: "24px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
            <Lock size={16} color="var(--success)" />
            <h2 style={{ fontSize: "20px", fontWeight: 600, color: "var(--text)", margin: 0 }}>
              Privacy Model
            </h2>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px", maxWidth: "640px" }}>
            <p style={{ fontSize: "14px", color: "var(--text-muted)", lineHeight: 1.7, margin: 0 }}>
              Every cryptographic operation in JWT Arsenal runs in your browser using the{" "}
              <a href="https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API" target="_blank" rel="noopener noreferrer" style={{ color: "var(--accent)" }}>
                Web Crypto API
              </a>. No JWT, key, payload, or URL is ever transmitted to any server.
            </p>
          </div>
        </div>

        {/* Credits */}
        <div
          style={{
            background: "var(--bg-elevated)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius)",
            padding: "24px",
          }}
        >
          <h2 style={{ fontSize: "20px", fontWeight: 600, color: "var(--text)", marginBottom: "16px" }}>
            Credits & References
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "14px", color: "var(--text-muted)", lineHeight: 1.7 }}>
            <p style={{ margin: 0 }}>
              The vulnerability concepts and attack techniques documented here draw from published security research:
            </p>
            <ul style={{ margin: 0, paddingLeft: "20px", lineHeight: 2.2 }}>
              <li>
                <a href="https://portswigger.net/web-security/jwt" target="_blank" rel="noopener noreferrer" style={{ color: "var(--accent)", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                  PortSwigger Web Security Academy - JWT attacks module <ExternalLink size={11} />
                </a>
              </li>
              <li>
                <a href="https://auth0.com/blog/critical-vulnerabilities-in-json-web-token-libraries/" target="_blank" rel="noopener noreferrer" style={{ color: "var(--accent)", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                  Auth0 / Tim McLean (2015) - Critical vulnerabilities in JWT libraries <ExternalLink size={11} />
                </a>
              </li>
              <li>
                <a href="https://github.com/silentsignal/rsa_sign2n" target="_blank" rel="noopener noreferrer" style={{ color: "var(--accent)", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                  silentsignal - rsa_sign2n key recovery tool <ExternalLink size={11} />
                </a>
              </li>
              <li>
                <a href="https://www.rfc-editor.org/rfc/rfc7515" target="_blank" rel="noopener noreferrer" style={{ color: "var(--accent)", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                  RFC 7515 (JWS) <ExternalLink size={11} />
                </a>
                {" · "}
                <a href="https://www.rfc-editor.org/rfc/rfc7517" target="_blank" rel="noopener noreferrer" style={{ color: "var(--accent)", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                  RFC 7517 (JWK) <ExternalLink size={11} />
                </a>
                {" · "}
                <a href="https://www.rfc-editor.org/rfc/rfc7518" target="_blank" rel="noopener noreferrer" style={{ color: "var(--accent)", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                  RFC 7518 (JWA) <ExternalLink size={11} />
                </a>
                {" · "}
                <a href="https://www.rfc-editor.org/rfc/rfc7519" target="_blank" rel="noopener noreferrer" style={{ color: "var(--accent)", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                  RFC 7519 (JWT) <ExternalLink size={11} />
                </a>
              </li>
            </ul>
            <p style={{ margin: 0 }}>
              All content is for educational and authorized testing purposes only.
            </p>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
