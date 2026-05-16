import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import { KbArticle, H2, H3, P, Mono, Ref, ImpactBox, CodeBlock, InfoCallout } from "@/components/kb";

export const metadata: Metadata = pageMeta(
  "JWK Header Injection",
  "Embed your own RSA public key in the JWT header. A vulnerable server uses it to verify - against the attacker's own key.",
  "/knowledge-base/jwk-injection",
);

export default function Page() {
  return (
    <KbArticle slug="jwk-injection">

      <H2>Embedded keys in the RFC</H2>
      <P>
        RFC 7515 §4.1.3 defines the <Mono>jwk</Mono> (JSON Web Key) header parameter as:
        <em>"The public key that corresponds to the key used to digitally sign the JWS."</em>
        The intent is for the token to be self-describing - a recipient can fetch the public key
        directly from the token without contacting any external endpoint.
      </P>
      <P>
        The vulnerability arises when a library or application uses the embedded JWK
        directly for signature verification without checking it against a trusted key store.
        Since the attacker controls the token - including its header - they can embed any
        public key they choose, sign the token with the matching private key, and the server
        will successfully verify the signature using the attacker's own key.
      </P>

      <H2>The forged token structure</H2>
      <CodeBlock language="json" label="Forged token header with embedded attacker JWK" code={`{
  "alg": "RS256",
  "typ": "JWT",
  "jwk": {
    "kty": "RSA",
    "use": "sig",
    "alg": "RS256",
    "kid": "attacker-key-2024",
    "n":   "sdfG7kPqoK8zRx...",   // attacker's public key modulus (base64url)
    "e":   "AQAB"                  // public exponent (65537)
  }
}`} />
      <P>
        The payload contains whatever claims the attacker wants (<Mono>role: "admin"</Mono>, arbitrary <Mono>sub</Mono>, etc.).
        The signature is computed using the attacker's RSA private key. A vulnerable server:
      </P>
      <ul className="refs-list" style={{ fontSize: "14px", color: "var(--text-muted)", lineHeight: 1.9, marginBottom: "20px" }}>
        <li>Parses the header and extracts the <Mono>jwk</Mono> field</li>
        <li>Imports the embedded public key</li>
        <li>Verifies the signature using that key</li>
        <li>The signature is valid - it was signed by the corresponding private key</li>
        <li>The server accepts the forged token as legitimate</li>
      </ul>

      <H2>node-jose and CVE-2018-0114</H2>
      <P>
        The most widely-cited real-world instance is <Mono>node-jose</Mono> versions prior to 0.11.0,
        disclosed in 2018. <Mono>node-jose</Mono> is the JOSE implementation used internally by many
        enterprise products, notably several Cisco applications. The vulnerable code path:
      </P>
      <CodeBlock language="js" label="Vulnerable node-jose code path" code={`const jose = require('node-jose');

// VULNERABLE: key is extracted from the token header itself
async function verifyToken(token) {
  // node-jose < 0.11.0 trusted the embedded JWK without validation
  const key = await jose.JWK.asKey(
    JSON.parse(atob(token.split('.')[0])).jwk  // ← attacker-controlled
  );
  const result = await jose.JWS.createVerify(key).verify(token);
  return result.payload;
}

// Attacker supplies a token with their own key in the header.
// jose.JWK.asKey() imports it.
// jose.JWS.createVerify(key).verify(token) - verifies against attacker's key → pass.`} />
      <CodeBlock language="js" label="Secure - verify against a trusted keystore" code={`const jose = require('node-jose');

// Build a keystore from pre-configured trusted keys ONLY
const keystore = jose.JWK.createKeyStore();
await keystore.add(trustedPublicKeyJwk);  // server-side trusted key

async function verifyToken(token) {
  // createVerify(keystore) IGNORES any embedded jwk/jku header params
  // and only uses keys from the trusted store
  const result = await jose.JWS.createVerify(keystore).verify(token);
  return result.payload;
}`} />

      <InfoCallout variant="warning" title="Cisco Security Advisory cisco-sa-20190513-securelogin">
        CVE-2018-0114 affected Cisco products using node-jose as their JOSE implementation.
        This included authentication components in Cisco products that accepted self-signed JWTs.
        The advisory rated it Critical (CVSS 10.0 in some configurations) as it allowed
        complete authentication bypass.
      </InfoCallout>

      <H2>EC key variant</H2>
      <P>
        The same attack works with ECDSA (ES256). The attacker generates an EC keypair,
        embeds the public EC key as the <Mono>jwk</Mono> claim with <Mono>kty: "EC"</Mono>,
        and signs with the private EC key. The JWK format for EC keys:
      </P>
      <CodeBlock language="json" label="EC public key embedded in header" code={`{
  "alg": "ES256",
  "jwk": {
    "kty": "EC",
    "crv": "P-256",
    "x": "f83OJ3D2xF1Bg8vub9tLe1gHMzV76e8Tus9uPHvRVEU",
    "y": "x_FEzRu9m36HLN_tue659LNpXW6pCyStikYjKIWI5a0"
  }
}`} />

      <H2>Detection</H2>
      <P>
        To test a target, generate a fresh RSA or EC keypair in JWT Arsenal, forge a token with an arbitrary
        payload and your public key embedded in the header, then send it:
      </P>
      <CodeBlock language="bash" label="Quick test with jwt_tool" code={`# jwt_tool's -X i flag performs JWK injection automatically:
python3 jwt_tool.py <JWT> -X i

# To inject with a specific claim:
python3 jwt_tool.py <JWT> -X i -I -pc sub -pv admin`} />

      <ImpactBox title="CVE-2018-0114 and beyond">
        <ul className="refs-list" style={{ lineHeight: 2 }}>
          <li><Mono>node-jose &lt; 0.11.0</Mono> - CVSS 10.0 in Cisco product context</li>
          <li>Affected Cisco Prime Infrastructure, Cisco Enterprise Network Function Virtualization Infrastructure Software, and others</li>
          <li>Pattern still appears in custom JWT parsers that extract the JWK before validating the signature</li>
          <li>Also found in some OIDC client libraries that support key discovery via <Mono>jwk</Mono> header</li>
        </ul>
      </ImpactBox>

      <H2>Mitigations</H2>
      <ul className="refs-list" style={{ fontSize: "14px", color: "var(--text-muted)", lineHeight: 2, marginBottom: "24px" }}>
        <li>Never use the <Mono>jwk</Mono> header field as the source of the verification key - always use a server-side trusted key store</li>
        <li>If the library supports "keystore mode" vs "auto-key mode," always use keystore mode</li>
        <li>Validate that any key material used for verification matches a pre-configured trusted key by key ID or thumbprint</li>
        <li>Consider stripping or rejecting tokens that contain <Mono>jwk</Mono>, <Mono>jku</Mono>, or <Mono>x5u</Mono> header claims before processing</li>
        <li>Keep JWT libraries up to date - this class of bug is typically fixed in library updates</li>
      </ul>

      <div>
        <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-muted)", marginBottom: "12px", textTransform: "uppercase", letterSpacing: "0.06em" }}>References</div>
        <ul className="refs-list" style={{ fontSize: "13px", color: "var(--text-muted)", lineHeight: 2 }}>
          <li><Ref href="https://portswigger.net/web-security/jwt/exploiting#injecting-self-signed-jwts-via-the-jwk-parameter">PortSwigger - Injecting self-signed JWTs via the jwk parameter</Ref></li>
          <li><Ref href="https://www.rfc-editor.org/rfc/rfc7515#section-4.1.3">RFC 7515 §4.1.3 - jwk (JSON Web Key) Header Parameter</Ref></li>
          <li><Ref href="https://tools.cisco.com/security/center/content/CiscoSecurityAdvisory/cisco-sa-20190513-securelogin">Cisco Advisory cisco-sa-20190513-securelogin (CVE-2018-0114)</Ref></li>
          <li><Ref href="https://github.com/nicowillis/CVE-2018-0114">CVE-2018-0114 PoC</Ref></li>
        </ul>
      </div>

    </KbArticle>
  );
}
