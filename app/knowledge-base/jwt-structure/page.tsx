import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import { KbArticle, H2, H3, P, Mono, Ref, CodeBlock, InfoCallout } from "@/components/kb";

export const metadata: Metadata = pageMeta(
  "JWT Structure & Internals",
  "How JWTs are encoded, which header fields matter to an attacker, and how the JOSE family of standards fits together.",
  "/knowledge-base/jwt-structure",
);

export default function Page() {
  return (
    <KbArticle slug="jwt-structure">

      <H2>Three segments, one dot each</H2>
      <P>
        A JSON Web Token is a compact, URL-safe representation of claims transferred between two parties.
        Its wire format is exactly three Base64URL-encoded strings joined by dots:
      </P>
      <CodeBlock language="bash" label="JWT wire format" code={`eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9   ← Header
.eyJzdWIiOiJ1c2VyLTEyMyIsInJvbGUiOiJ1c2VyIn0  ← Payload
.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c   ← Signature`} />
      <P>
        Each segment is independently readable. The header and payload are <em>not encrypted</em> in a standard JWT (JWS) -
        they are only Base64URL-encoded, meaning anyone who intercepts the token can read its claims without any key material.
        Only the signature provides integrity; confidentiality requires JWE (JSON Web Encryption), an entirely separate standard.
      </P>

      <H2>Base64URL encoding</H2>
      <P>
        Standard Base64 uses <Mono>+</Mono>, <Mono>/</Mono>, and <Mono>=</Mono> padding - characters that require percent-encoding in URLs.
        Base64URL replaces them: <Mono>+</Mono>→<Mono>-</Mono>, <Mono>/</Mono>→<Mono>_</Mono>, and trailing <Mono>=</Mono> padding is omitted.
        This makes tokens safe to embed in HTTP headers, query parameters, and cookies without further escaping.
      </P>
      <CodeBlock language="python" label="Decoding any segment manually" code={`import base64, json

def b64url_decode(s):
    # Restore padding
    s += "=" * (-len(s) % 4)
    return base64.urlsafe_b64decode(s)

token = "eyJhbGciOiJSUzI1NiJ9.eyJzdWIiOiJhZG1pbiJ9.SIG"
header_b64, payload_b64, sig_b64 = token.split(".")

print(json.loads(b64url_decode(header_b64)))
# → {'alg': 'RS256'}
print(json.loads(b64url_decode(payload_b64)))
# → {'sub': 'admin'}
# sig_b64 decodes to raw bytes, not JSON`} />

      <H2>The header: every field is attacker-controlled</H2>
      <P>
        This is the most critical point for a security engineer: the header arrives as part of the token,
        signed by the token bearer themselves. Before signature verification occurs, the server must parse the header
        to know <em>which algorithm and key to use</em>. This creates a bootstrapping problem - and most JWT vulnerabilities
        live exactly here.
      </P>
      <CodeBlock language="json" label="Full header field reference" code={`{
  "alg": "RS256",      // DANGER: selects verification algorithm - attacker-controlled
  "typ": "JWT",        // token type - informational only
  "kid": "key-2024",   // DANGER: selects which key - path traversal / SQLi vector
  "jku": "https://...",// DANGER: URL for JWKS fetch - SSRF / open-redirect bypass
  "jwk": { ... },      // DANGER: embedded public key - attacker supplies their own
  "x5u": "https://...",// DANGER: URL for X.509 cert chain - same risk as jku
  "x5c": ["..."],      // inline cert chain - similar risk to jwk
  "x5t": "...",        // cert thumbprint - selects cert, similar risk to kid
  "crit": ["kid"]      // critical extensions - must be understood or token rejected
}`} />
      <InfoCallout variant="warning" title="The alg field is not a hint - it's a command">
        Vulnerable implementations use the <Mono>alg</Mono> value to decide which verification function to call,
        rather than enforcing a pre-configured expected algorithm. An attacker who can change <Mono>alg</Mono>
        to <Mono>none</Mono>, <Mono>HS256</Mono>, or any other value gains control over the entire verification path.
      </InfoCallout>

      <H2>Standard payload claims (RFC 7519)</H2>
      <P>
        The payload is a JSON object. RFC 7519 defines seven registered claim names, all optional.
        Applications typically add their own private claims (<Mono>role</Mono>, <Mono>email</Mono>, <Mono>tenant_id</Mono>, etc.).
        These private claims are the primary target of token forgery attacks.
      </P>
      <CodeBlock language="json" label="Registered claims" code={`{
  "iss": "https://auth.example.com",  // Issuer - who created the token
  "sub": "user-123",                   // Subject - who the token represents
  "aud": "api.example.com",            // Audience - intended recipient(s)
  "exp": 1735689600,                   // Expiration time (Unix timestamp) - MUST check
  "nbf": 1735603200,                   // Not Before - token invalid before this time
  "iat": 1735603200,                   // Issued At - when the token was created
  "jti": "550e8400-e29b-41d4-a716-..." // JWT ID - unique identifier, replay prevention
}`} />
      <P>
        Servers MUST validate <Mono>exp</Mono> - an expired token that passes signature verification should still be rejected.
        Servers SHOULD validate <Mono>aud</Mono> to prevent a valid token for service A being replayed at service B.
        The <Mono>jti</Mono> claim enables replay prevention by tracking consumed token IDs.
      </P>

      <H2>Signature computation</H2>
      <P>
        The signature covers exactly <Mono>base64url(header) + "." + base64url(payload)</Mono> - the
        "signing input". The signature does not cover any HTTP metadata (headers, path, IP address).
        If an attacker can modify the header or payload and recompute a valid signature,
        the server has no way to distinguish the forgery from a legitimate token.
      </P>
      <CodeBlock language="python" label="HS256 signature computation" code={`import hmac, hashlib, base64, json

def b64url(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).rstrip(b"=").decode()

header  = b64url(json.dumps({"alg":"HS256","typ":"JWT"}).encode())
payload = b64url(json.dumps({"sub":"admin","role":"admin"}).encode())

signing_input = f"{header}.{payload}".encode()
secret = b"your-256-bit-secret"

sig = hmac.new(secret, signing_input, hashlib.sha256).digest()
token = f"{header}.{payload}.{b64url(sig)}"
print(token)  # A valid HS256 JWT`} />

      <H3>RS256 - Asymmetric signing</H3>
      <P>
        For RS256 (RSASSA-PKCS1-v1_5 with SHA-256), the server holds a private key and signs with it.
        Any party with the public key - often published at <Mono>/.well-known/jwks.json</Mono> - can verify.
        The critical implication: the public key is known to attackers by design, which is the foundation
        of the algorithm confusion attack.
      </P>

      <H3>ES256 - ECDSA signing</H3>
      <P>
        ES256 uses P-256 with SHA-256. ECDSA signatures are non-deterministic: the same message signed twice
        produces different signatures due to a random nonce <em>k</em>. A critical property for the
        public key recovery attack - two different ECDSA signatures cannot be used for GCD-based recovery
        (unlike RSA). However, a weak RNG producing repeated <em>k</em> values is catastrophic and has led
        to private key recovery in real-world cases (the PlayStation 3 ECDSA failure being the canonical example).
      </P>

      <H2>The JOSE family of standards</H2>
      <P>
        JWT is one specification in the broader JOSE (JSON Object Signing and Encryption) family:
      </P>
      <CodeBlock language="bash" label="JOSE RFCs" code={`RFC 7515 - JWS (JSON Web Signature)       → signed tokens
RFC 7516 - JWE (JSON Web Encryption)       → encrypted tokens
RFC 7517 - JWK (JSON Web Key)              → key representation
RFC 7518 - JWA (JSON Web Algorithms)       → algorithm identifiers
RFC 7519 - JWT (JSON Web Token)            → claims format
RFC 7520 - JOSE cookbook                   → worked examples
RFC 8037 - EdDSA (Ed25519/Ed448 in JOSE)  → modern curve support`} />
      <P>
        A "JWT" is almost always a JWS with a JSON payload. JWE produces a token with 5 dot-separated
        segments and is rarely encountered in web application contexts - but when it is, it provides
        genuine confidentiality of the payload.
      </P>

      <H2>Token lifecycle and state</H2>
      <P>
        JWTs are stateless by design: the server need not consult a database to validate a token,
        because the signature is self-contained proof of authenticity. This has a major security implication:
        there is no built-in revocation mechanism. Once a token is issued, it is valid until its
        {" "}<Mono>exp</Mono> claim passes - unless the server maintains a denylist of <Mono>jti</Mono> values
        (negating most of the statelessness benefit) or rotates the signing key (invalidating all outstanding tokens).
      </P>
      <InfoCallout variant="info" title="Short expiry windows matter">
        A 1-hour expiry window means a compromised token is valid for up to 1 hour after compromise is detected.
        Short-lived tokens (5-15 minutes) combined with refresh token rotation are the recommended pattern for
        high-security applications.
      </InfoCallout>

      <div style={{ marginTop: "32px" }}>
        <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-muted)", marginBottom: "12px", textTransform: "uppercase", letterSpacing: "0.06em" }}>References</div>
        <ul className="refs-list" style={{ fontSize: "13px", color: "var(--text-muted)", lineHeight: 2 }}>
          <li><Ref href="https://www.rfc-editor.org/rfc/rfc7519">RFC 7519 - JSON Web Token (JWT)</Ref></li>
          <li><Ref href="https://www.rfc-editor.org/rfc/rfc7515">RFC 7515 - JSON Web Signature (JWS)</Ref></li>
          <li><Ref href="https://www.rfc-editor.org/rfc/rfc7518">RFC 7518 - JSON Web Algorithms (JWA)</Ref></li>
          <li><Ref href="https://portswigger.net/web-security/jwt">PortSwigger - JWT attacks</Ref></li>
          <li><Ref href="https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_for_Java_Cheat_Sheet.html">OWASP JWT Security Cheat Sheet</Ref></li>
        </ul>
      </div>

    </KbArticle>
  );
}
