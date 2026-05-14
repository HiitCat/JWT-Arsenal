import type { Metadata } from "next";
import type { ReactNode } from "react";
import { pageMeta } from "@/lib/seo";
import { Lock, Zap, Globe, BookOpen, Heart, Code2 } from "lucide-react";
import { Link } from "@/components/shared/Link";

export const metadata: Metadata = pageMeta(
  "About JWT Arsenal",
  "A 100% client-side JWT exploitation toolkit for security professionals. No data leaves your browser. Built for pentesters, CTF players, and bug bounty hunters.",
  "/about",
);
import { PageContainer } from "@/components/layout/PageContainer";
import { InfoCallout } from "@/components/shared/InfoCallout";

function Section({ title, icon, children }: { title: string; icon: ReactNode; children: ReactNode }) {
  return (
    <div style={{
      background: "var(--bg-elevated)",
      border: "1px solid var(--border)",
      borderRadius: "var(--radius)",
      padding: "28px",
      marginBottom: "20px",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
        <span style={{ color: "var(--accent)" }}>{icon}</span>
        <h2 style={{ fontSize: "18px", fontWeight: 600, color: "var(--text)", margin: 0 }}>{title}</h2>
      </div>
      {children}
    </div>
  );
}

function Tag({ children }: { children: ReactNode }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center",
      fontSize: "12px", fontWeight: 500,
      color: "var(--accent)",
      background: "var(--accent-tint)",
      border: "1px solid var(--accent-border-mid)",
      borderRadius: "100px",
      padding: "3px 10px",
    }}>
      {children}
    </span>
  );
}


export default function AboutPage() {
  return (
    <PageContainer>
      <div style={{ paddingTop: "40px", paddingBottom: "64px" }}>

        {/* Hero */}
        <div style={{ marginBottom: "48px" }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "20px" }}>
            <Tag>Open Source</Tag>
            <Tag>100% Client-Side</Tag>
            <Tag>No Backend</Tag>
            <Tag>Free Forever</Tag>
          </div>
          <h1 style={{ fontSize: "36px", fontWeight: 700, color: "var(--text)", lineHeight: 1.15, margin: "0 0 16px" }}>
            About JWT Arsenal
          </h1>
          <p style={{ fontSize: "17px", color: "var(--text-muted)", lineHeight: 1.8, margin: 0, maxWidth: "640px" }}>
            A toolkit built out of frustration - tired of copy-pasting Python scripts and switching between
            five different tabs during a JWT pentest. Everything you need, directly in the browser, no setup required.
          </p>
        </div>

        {/* Why */}
        <Section title="Why this project exists" icon={<Zap size={18} />}>
          <div style={{ display: "flex", flexDirection: "column", gap: "14px", fontSize: "14px", color: "var(--text-muted)", lineHeight: 1.8 }}>
            <p style={{ margin: 0 }}>
              JWT vulnerabilities are everywhere - misconfigurations in algorithm handling, key injection, unsigned token acceptance.
              They show up in bug bounty programs, CTF challenges, and real-world pentests constantly.
              Yet every time, the workflow is the same: open jwt.io to decode, switch to a Python script to forge,
              paste the token into Burp, repeat.
            </p>
            <p style={{ margin: 0 }}>
              JWT Arsenal was built to collapse that entire workflow into one place.
              You paste a token, tweak the payload, pick an attack, and get a forged token - all without leaving the tab,
              without installing anything, and without sending your client's tokens to a third-party server.
            </p>
            <p style={{ margin: 0 }}>
              The Knowledge Base exists because understanding <em>why</em> an attack works matters as much as executing it.
              Each article covers the cryptographic mechanics, the RFC that defines the behaviour,
              and the vulnerable code pattern - so you can identify the flaw yourself, not just press a button.
            </p>
          </div>
        </Section>

        {/* Privacy */}
        <Section title="Privacy & security model" icon={<Lock size={18} />}>
          <div style={{ display: "flex", flexDirection: "column", gap: "14px", fontSize: "14px", color: "var(--text-muted)", lineHeight: 1.8 }}>
            <p style={{ margin: 0 }}>
              This is a static site. There is no server, no API, no database. The entire application is
              HTML, CSS, and JavaScript served from a CDN. All cryptographic operations run locally
              via the browser's native{" "}
              <Link href="https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API">Web Crypto API</Link>.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              {[
                ["No tokens transmitted", "JWTs and keys never leave your machine"],
                ["No analytics tracking", "No fingerprinting, no event collection"],
                ["No accounts required", "Nothing to sign up for, ever"],
                ["No external requests", "Zero runtime network calls"],
              ].map(([title, desc]) => (
                <div key={title} style={{
                  padding: "14px 16px",
                  background: "var(--bg)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius)",
                }}>
                  <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--accent)", marginBottom: "4px" }}>✓ {title}</div>
                  <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>{desc}</div>
                </div>
              ))}
            </div>
            <p style={{ margin: 0 }}>
              You can safely paste real tokens from live engagements. Nothing is logged, cached, or stored anywhere
              outside of your browser's local memory.
            </p>
          </div>
        </Section>

        {/* Open Source */}
        <Section title="Open source & contributions" icon={<Code2 size={18} />}>
          <div style={{ display: "flex", flexDirection: "column", gap: "14px", fontSize: "14px", color: "var(--text-muted)", lineHeight: 1.8 }}>
            <p style={{ margin: 0 }}>
              JWT Arsenal is fully open source under the MIT license. The code is on GitHub - readable,
              forkable, improvable. If you spot a bug, want to add a new attack module, or want to contribute
              a Knowledge Base article, pull requests are welcome.
            </p>
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              <a
                href="https://github.com/HiitCat/jwt-arsenal"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "inline-flex", alignItems: "center", gap: "8px",
                  height: "36px", padding: "0 16px",
                  background: "var(--bg)", border: "1px solid var(--border)",
                  borderRadius: "var(--radius)", color: "var(--text)",
                  textDecoration: "none", fontSize: "13px", fontWeight: 500,
                }}
              >
                <Code2 size={14} /> View on GitHub
              </a>
              <a
                href="https://github.com/HiitCat/jwt-arsenal/issues/new"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "inline-flex", alignItems: "center", gap: "8px",
                  height: "36px", padding: "0 16px",
                  background: "var(--accent-tint)", border: "1px solid var(--accent-border-mid)",
                  borderRadius: "var(--radius)", color: "var(--accent)",
                  textDecoration: "none", fontSize: "13px", fontWeight: 500,
                }}
              >
                Report an issue
              </a>
            </div>
          </div>
        </Section>

        {/* Stack */}
        <Section title="Tech stack" icon={<Globe size={18} />}>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "14px", color: "var(--text-muted)" }}>
            {[
              ["Next.js 16", "App Router with static export - no server needed at runtime"],
              ["TypeScript", "Strict mode throughout"],
              ["jose", "RFC-compliant JWT / JOSE library for browser cryptography"],
              ["Web Crypto API", "Native browser API for RSA, HMAC, and ECDSA operations"],
              ["Cloudflare Pages", "Global CDN, zero cold starts, free tier with unlimited bandwidth"],
            ].map(([name, desc]) => (
              <div key={name} style={{ display: "flex", gap: "12px", alignItems: "baseline" }}>
                <span style={{
                  fontFamily: "var(--font-mono)", fontSize: "12px",
                  color: "var(--accent)", minWidth: "140px", flexShrink: 0,
                }}>{name}</span>
                <span style={{ lineHeight: 1.6 }}>{desc}</span>
              </div>
            ))}
          </div>
        </Section>

        {/* References */}
        <Section title="Research & references" icon={<BookOpen size={18} />}>
          <ul style={{ margin: 0, paddingLeft: "18px", display: "flex", flexDirection: "column", gap: "10px", fontSize: "14px", listStyleType: "disc", color: "var(--accent)" }}>
            {[
              ["PortSwigger Web Security Academy - JWT attacks", "https://portswigger.net/web-security/jwt"],
              ["Tim McLean (2015) - Critical vulnerabilities in JWT libraries", "https://auth0.com/blog/critical-vulnerabilities-in-json-web-token-libraries/"],
              ["PortSwigger Research - Bleichenbacher-style RSA key recovery", "https://portswigger.net/research/authentication-bypass-via-jwt-claim-misinterpretation"],
              ["silentsignal - rsa_sign2n public key recovery tool", "https://github.com/silentsignal/rsa_sign2n"],
              ["RFC 7515 - JSON Web Signature (JWS)", "https://www.rfc-editor.org/rfc/rfc7515"],
              ["RFC 7517 - JSON Web Key (JWK)", "https://www.rfc-editor.org/rfc/rfc7517"],
              ["RFC 7518 - JSON Web Algorithms (JWA)", "https://www.rfc-editor.org/rfc/rfc7518"],
              ["RFC 7519 - JSON Web Token (JWT)", "https://www.rfc-editor.org/rfc/rfc7519"],
              ["OWASP JWT Security Cheat Sheet", "https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_for_Java_Cheat_Sheet.html"],
            ].map(([label, href]) => (
              <li key={label}>
                <Link href={href}>{label}</Link>
              </li>
            ))}
          </ul>
        </Section>

        {/* Legal */}
        <InfoCallout variant="danger" title="Legal Disclaimer - Read Before Use">
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <p style={{ margin: 0 }}>
              JWT Arsenal is intended exclusively for <strong>authorized penetration tests</strong>,{" "}
              <strong>bug bounty programs</strong> (within scope), <strong>CTF competitions</strong>,
              and <strong>security research in lab environments you own</strong>.
            </p>
            <p style={{ margin: 0 }}>
              Using this tool against systems without explicit written authorization is illegal under the CFAA,
              the Computer Misuse Act, and equivalent laws worldwide.
              The author accepts no liability for misuse.
            </p>
          </div>
        </InfoCallout>

        {/* Footer note */}
        <div style={{
          marginTop: "32px", textAlign: "center",
          fontSize: "13px", color: "var(--text-muted)", opacity: 0.6,
          display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
        }}>
          <Heart size={12} style={{ color: "var(--danger)" }} />
          Built for the security community - use it responsibly.
        </div>

      </div>
    </PageContainer>
  );
}
