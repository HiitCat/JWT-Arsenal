import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import { KbArticle, H2, H3, P, Mono, Ref, ImpactBox, CodeBlock, InfoCallout } from "@/components/kb";

export const metadata: Metadata = pageMeta(
  "Unverified Signature",
  "The server decodes the token but never calls the cryptographic verification function - any forged payload is accepted.",
  "/knowledge-base/unverified-signature",
);

export default function Page() {
  return (
    <KbArticle slug="unverified-signature">

      <H2>Root cause</H2>
      <P>
        Every JWT library ships two distinct functions: one that <em>decodes</em> a token (Base64URL decode + JSON parse),
        and one that <em>verifies</em> it (decode + signature check). The vulnerability appears when application code
        calls the decode-only function in a context that assumes the token has been validated.
        The signature is ignored entirely - the server processes whatever claims the token contains.
      </P>
      <P>
        This sounds like an obvious mistake, but it recurs constantly because:
      </P>
      <ul className="refs-list" style={{ fontSize: "14px", color: "var(--text-muted)", lineHeight: 1.9, marginBottom: "20px" }}>
        <li>Libraries make decode functions convenient and prominently documented for debugging</li>
        <li>Developers copy-paste example code that uses decode for simplicity</li>
        <li>Microservice architectures create trust boundaries where "the gateway already verified it"</li>
        <li>Testing always uses tokens created by the same server - so signature validity is always incidentally true</li>
      </ul>

      <H2>Vulnerable patterns by language</H2>

      <H3>Node.js - jsonwebtoken</H3>
      <CodeBlock language="js" label="Vulnerable" code={`const jwt = require('jsonwebtoken');

// jwt.decode() returns the payload WITHOUT verifying the signature.
// It accepts any well-formed JWT including forged ones.
const decoded = jwt.decode(req.headers.authorization.split(' ')[1]);
const userId = decoded.sub;  // attacker controls this`} />
      <CodeBlock language="js" label="Secure" code={`const jwt = require('jsonwebtoken');

// jwt.verify() throws if signature is invalid or token is expired.
// Always pass an explicit algorithms array.
const decoded = jwt.verify(
  req.headers.authorization.split(' ')[1],
  process.env.JWT_SECRET,
  { algorithms: ['HS256'] }
);
const userId = decoded.sub;  // cryptographically proven`} />

      <H3>Python - PyJWT</H3>
      <CodeBlock language="python" label="Vulnerable" code={`import jwt

# options={"verify_signature": False} disables ALL verification.
# This pattern is documented as "for debugging" but appears in production.
payload = jwt.decode(
    token,
    options={"verify_signature": False}
)
# Also vulnerable: algorithms=[] (empty list tricks some versions)`} />
      <CodeBlock language="python" label="Secure" code={`import jwt

payload = jwt.decode(
    token,
    secret_key,
    algorithms=["HS256"],       # non-empty allowlist
    audience="api.example.com"  # validate aud claim
)
# Raises jwt.InvalidSignatureError on tampered token
# Raises jwt.ExpiredSignatureError on expired token`} />

      <H3>Java - jjwt</H3>
      <CodeBlock language="bash" label="Vulnerable (Java)" code={`// Jwts.parserBuilder() without signedWith() → no signature check
Claims claims = Jwts.parserBuilder()
    .build()
    .parseClaimsJwt(token)   // parseClaimsJwt, not parseClaimsJws
    .getBody();
// Any unsigned or forged token passes`} />
      <CodeBlock language="bash" label="Secure (Java)" code={`Claims claims = Jwts.parserBuilder()
    .setSigningKey(secretKey)          // required
    .requireAudience("api.example.com")
    .build()
    .parseClaimsJws(token)   // parseClaimsJws (signed)
    .getBody();`} />

      <H2>The microservice trap</H2>
      <P>
        The most prevalent production variant is not a developer mistake on a single service,
        but an architectural assumption. A typical pattern:
      </P>
      <CodeBlock language="bash" label="Vulnerable microservice architecture" code={`Client → API Gateway (verifies JWT) → Auth headers stripped
                                    ↓
                             Internal Service A
                             Internal Service B  ← also receives original JWT
                             Internal Service C    and re-decodes it without verify

# The gateway verifies once. Internal services assume the gateway
# already validated and call jwt.decode() for convenience.
# An attacker with access to the internal network (or via SSRF)
# can call internal services directly with forged tokens.`} />
      <P>
        This pattern has been exploited in bug bounty programs targeting large SaaS platforms.
        The vulnerability surface is the internal services, not the public-facing gateway.
      </P>

      <InfoCallout variant="warning" title="Zero-trust internal traffic">
        Internal services should verify JWT signatures even when behind an API gateway.
        A compromised upstream service, an SSRF vulnerability, or a misconfigured network route
        can all deliver attacker-controlled tokens to a service that skips verification.
      </InfoCallout>

      <H2>Detection techniques</H2>
      <P>
        Testing for this vulnerability requires crafting a token with a tampered payload and an invalid signature,
        then observing whether the server accepts it.
      </P>
      <CodeBlock language="python" label="Crafting a test token with a broken signature" code={`import base64, json

def b64url(data):
    if isinstance(data, str):
        data = data.encode()
    return base64.urlsafe_b64encode(data).rstrip(b"=").decode()

# Take an existing valid token and change a claim
header  = b64url(json.dumps({"alg": "HS256", "typ": "JWT"}))
payload = b64url(json.dumps({"sub": "admin", "role": "admin", "exp": 9999999999}))
fake_sig = b64url(b"invalidsignature")

forged = f"{header}.{payload}.{fake_sig}"
print(forged)

# Send to server. If 200 → unverified signature.
# If 401 → server validates signatures (good).`} />

      <ImpactBox title="Real-world impact">
        <ul className="refs-list" style={{ lineHeight: 2 }}>
          <li>Reported on HackerOne with payouts ranging $500-$25,000 depending on impact scope</li>
          <li>Most critical when <Mono>role</Mono>, <Mono>admin</Mono>, or <Mono>permissions</Mono> claims control authorization decisions</li>
          <li>Common in internal tooling built quickly without security review, then exposed via developer portals</li>
          <li>Node.js <Mono>jsonwebtoken</Mono>: easy to call <Mono>decode()</Mono> vs <Mono>verify()</Mono> - accounts for the majority of bug reports in this category</li>
        </ul>
      </ImpactBox>

      <H2>Mitigations</H2>
      <ul className="refs-list" style={{ fontSize: "14px", color: "var(--text-muted)", lineHeight: 2, marginBottom: "24px" }}>
        <li>Always call the <em>verify</em> function, never just decode - enforce this via code review or linting</li>
        <li>Pass an explicit <Mono>algorithms</Mono> allowlist - reject tokens with unexpected algorithm values</li>
        <li>Validate <Mono>exp</Mono>, <Mono>aud</Mono>, and <Mono>iss</Mono> claims after signature verification</li>
        <li>Internal services must verify signatures independently - never trust "the gateway already checked it"</li>
        <li>Consider a shared middleware library that enforces correct verification, removing the choice from individual service developers</li>
      </ul>

      <div>
        <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-muted)", marginBottom: "12px", textTransform: "uppercase", letterSpacing: "0.06em" }}>References</div>
        <ul className="refs-list" style={{ fontSize: "13px", color: "var(--text-muted)", lineHeight: 2 }}>
          <li><Ref href="https://portswigger.net/web-security/jwt">PortSwigger - JWT attacks module</Ref></li>
          <li><Ref href="https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_for_Java_Cheat_Sheet.html">OWASP JWT Security Cheat Sheet</Ref></li>
          <li><Ref href="https://www.rfc-editor.org/rfc/rfc7519#section-10">RFC 7519 §10 - Security Considerations</Ref></li>
        </ul>
      </div>

    </KbArticle>
  );
}
