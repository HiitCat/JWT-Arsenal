export type Severity = "critical" | "high" | "medium" | "low" | "info";

export interface SecurityFinding {
  id: string;
  severity: Severity;
  title: string;
  detail: string;
}

const SEVERITY_ORDER: Record<Severity, number> = {
  critical: 0, high: 1, medium: 2, low: 3, info: 4,
};

const SENSITIVE_KEY_PATTERNS = [
  "password", "passwd", "secret", "credit_card", "ssn", "cvv", "pin",
  "social_security", "private_key", "privatekey", "token", "api_key", "apikey",
];

export function analyzeJwt(
  header: Record<string, unknown>,
  payload: Record<string, unknown>
): SecurityFinding[] {
  const findings: SecurityFinding[] = [];
  const alg = String(header.alg ?? "");
  const now = Math.floor(Date.now() / 1000);

  // --- Algorithm ---

  if (!alg || ["none", "None", "NONE", "nOnE"].includes(alg)) {
    findings.push({
      id: "alg-none", severity: "critical",
      title: 'Algorithm "none" - unsigned token',
      detail: "The token carries no cryptographic signature. Any payload modification is accepted by servers that do not enforce algorithm validation.",
    });
  } else if (alg.startsWith("HS")) {
    findings.push({
      id: "alg-symmetric", severity: "medium",
      title: `Symmetric algorithm (${alg})`,
      detail: `HMAC secrets can be brute-forced offline (hashcat mode 16500).`,
    });
  } else if (["RS256", "RS384", "RS512", "ES256", "ES384", "ES512", "PS256", "PS384", "PS512"].includes(alg)) {
    const hmacAlg = `HS${alg.slice(2)}`;
    findings.push({
      id: "alg-confusion-risk", severity: "high",
      title: `Algorithm confusion risk (${alg} -> ${hmacAlg})`,
      detail: `Change alg to "${hmacAlg}" and re-sign with the server's RSA public key as HMAC secret. Servers that accept any algorithm value from the token will verify and accept the forged token.`,
    });
  }

  // --- Expiration & timing ---

  const exp = typeof payload.exp === "number" ? payload.exp : null;
  const iat = typeof payload.iat === "number" ? payload.iat : null;
  const nbf = typeof payload.nbf === "number" ? payload.nbf : null;

  if (exp === null) {
    findings.push({
      id: "no-exp", severity: "high",
      title: "No expiration claim (exp)",
      detail: "A stolen token remains valid indefinitely. Without exp, revocation requires a server-side denylist for every issued token.",
    });
  } else {
    if (exp < now) {
      findings.push({
        id: "expired", severity: "info",
        title: "Token is expired",
        detail: `Expired ${new Date(exp * 1000).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })}. Servers with lenient time validation or broken clock checks may still accept it.`,
      });
    }

    const lifetimeSec = exp - (iat ?? now);
    const lifetimeDays = lifetimeSec / 86400;
    if (lifetimeDays > 30) {
      findings.push({
        id: "long-lived", severity: "medium",
        title: `Token lifetime is ${Math.round(lifetimeDays)} days`,
        detail: "Prefer short-lived tokens (<24h) combined with refresh tokens. A long window gives attackers more time to use a stolen token before it expires.",
      });
    }
  }

  if (iat !== null && iat > now + 60) {
    findings.push({
      id: "iat-future", severity: "medium",
      title: `Issued-at (iat) is ${Math.round((iat - now) / 60)} minutes in the future`,
      detail: "A future iat may indicate token manipulation or deliberate clock skew. Servers that do not validate iat against server time will accept it.",
    });
  }

  if (nbf !== null && exp !== null && nbf > exp) {
    findings.push({
      id: "nbf-after-exp", severity: "high",
      title: "nbf is set after exp - token can never be valid",
      detail: "The not-before time is later than the expiration time, making this token logically invalid in any time window. Some parsers ignore this inconsistency and accept the token anyway.",
    });
  }

  // --- Missing standard claims ---

  if (!("iss" in payload)) {
    findings.push({
      id: "no-iss", severity: "low",
      title: "No issuer claim (iss)",
      detail: "Without iss, a token issued by one authority can be presented to another. Servers should reject tokens that do not match the expected issuer.",
    });
  }

  if (!("aud" in payload)) {
    findings.push({
      id: "no-aud", severity: "low",
      title: "No audience claim (aud)",
      detail: "A token without aud can be replayed against any service in the same ecosystem. Add aud to bind the token to its intended recipient.",
    });
  }

  if (!("sub" in payload)) {
    findings.push({
      id: "no-sub", severity: "info",
      title: "No subject claim (sub)",
      detail: "sub identifies the principal the token was issued for. Most authorization systems expect it and may behave unpredictably without it.",
    });
  }

  if (!("jti" in payload)) {
    findings.push({
      id: "no-jti", severity: "info",
      title: "No token ID (jti)",
      detail: "Without a unique jti, the server cannot implement single-use semantics or per-token revocation. Replay attacks are possible if the token is not short-lived.",
    });
  }

  // --- Sensitive data in payload ---

  for (const key of Object.keys(payload)) {
    if (SENSITIVE_KEY_PATTERNS.some(p => key.toLowerCase().includes(p))) {
      findings.push({
        id: `sensitive-${key}`, severity: "high",
        title: `Sensitive field in payload: "${key}"`,
        detail: "JWT payloads are base64url-encoded, not encrypted. Anyone in possession of the token can decode and read this value without any key material.",
      });
    }
  }

  // --- Header injection vectors ---

  if (header.jku) {
    findings.push({
      id: "jku-present", severity: "high",
      title: "JKU header present",
      detail: `jku: "${String(header.jku)}". Vulnerable servers fetch this URL to retrieve the signing key. Replace it with an attacker-controlled JWKS endpoint hosting a crafted key pair.`,
    });
  }

  if (header.jwk) {
    findings.push({
      id: "jwk-present", severity: "high",
      title: "Embedded JWK in header",
      detail: "A public key is embedded in the token header. Vulnerable servers verify against this inline key - generate your own RSA pair, embed the public key, sign with the private key.",
    });
  }

  if (header.x5u) {
    findings.push({
      id: "x5u-present", severity: "high",
      title: "X5U header present",
      detail: `x5u: "${String(header.x5u)}". Same attack surface as JKU but for X.509 certificate chains - redirect to an attacker-controlled URL serving a crafted certificate.`,
    });
  }

  if (header.x5c) {
    findings.push({
      id: "x5c-present", severity: "high",
      title: "Embedded X5C certificate chain",
      detail: "An X.509 certificate chain is embedded in the header. Servers that use the embedded certificate for verification without validating it against a trusted CA are vulnerable to certificate injection.",
    });
  }

  if (header.kid !== undefined) {
    findings.push({
      id: "kid-present", severity: "medium",
      title: "KID header present",
      detail: `kid: "${String(header.kid)}". If the server passes this value unsanitized to a file read, database query, or URL fetch, it becomes a path traversal, SQL injection, or SSRF vector.`,
    });
  }

  if (header.crit) {
    findings.push({
      id: "crit-present", severity: "info",
      title: "Critical extensions (crit) declared",
      detail: `crit: ${JSON.stringify(header.crit)}. The server must understand and process all listed extensions. Unknown extensions must cause rejection - servers that ignore crit silently may be exploitable.`,
    });
  }

  return findings.sort((a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity]);
}

