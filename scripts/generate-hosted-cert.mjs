// Generates a self-signed X.509 certificate from the hosted RSA keypair
// and writes it to public/attacker.crt
// Run: node scripts/generate-hosted-cert.mjs

import { writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Same keypair as HOSTED_PRIVATE_KEY_JWK in jku-injection/page.tsx
const HOSTED_PRIVATE_KEY_JWK = {
  key_ops: ["sign"], ext: true, kty: "RSA", alg: "RS256",
  n: "rHidgESfqG_BZfrZCRpNObC9cKVaHzUo-p_jM6yK3InsO4vjjktl2EIKFM-3symCtmNOdSfIqRZt5fOQqHsj-qRgf01Mee4zAv5zXWmwR1XxUI0_wwCgqFEgbgjxJQYVu6BVuuFVaQt3YzBxgk7LPKGzP2ezUG-s5epe5THqnG17NGzugxpYly8ztpouMdd757ivVhtFY4eR8MbOLs5IX7zMJklTZPaLDX2UooW-IqwZRQIXJn_WW9caw9L5woA3vMXrzWAkKox3iX1838cXe9J_IOZjn6frMpA4hoq6xElL6dbQNyLMedM-lsOMVt2_8Qgk2vPCxI-0lQn2oxPDJw",
  e: "AQAB",
  d: "DLH0JfTnK6bOPYtxXlIpTQ3NY_VH5PQsyAXs22jf78vXL6rkXRz_qiNySoXfp7hufq5goA8FniygekSraTtnMpPW5ofyESePabEBHOciqp2Q3bUH9HqfWMRf9rmBxo_kGaN7q_3aI5lMeGigck8KdrQQVaJ0eH8_4syVn5lFA66MOQ54XNI-HnApK_82n5_I215isMTlBm22KlryXa6K86uoI9XY768SPL-zRMC5F0S5FPx_R4MOyX8muRs7ATo5RxWZbkrpCvN31y54vJNrrQ8jzTvTDyheYPBVuEMTHTX-VeNH7PbMnroRgxeDNmCjrEwTGVitPO-eobbj3hmJQQ",
  p: "61lKnnyzpyImVSAadj2ZEhn_-tNNHj8AlnJ0MVxExc06-Bs8aSFwu8xwZEkCNfdbh4cw7uuNQS_SR6bhK09ZcH6ZzvIPrq6oJR9bfL-cGDtkEh2TowHAQdO7gH2juBc9c9MpmTzd74EuPoej0c3VtVc0cCPZ74SwSE2Fyi0l7hM",
  q: "u5rijkIfo2k9G-0V3jmHaMmEKieM4-NtRBZAG02bTqkU8V0YH-MmnBsqDpMKOg22cPX8O_iYPr9x67kSs-Q6LKOyqnKlZym3LBCkw62-uZncVkex1a-Nyf2tu2ZCiGRj9gZ1Sn5erSELuij3fKnxAdkY8EnK72VmPRWNN6iWaR0",
  dp: "4yzs73FWBUXclJ0JjgtFn4iDZH3k2gZcrdzLNf5n0Dub6XR46s5BwLXF47fpr2gW7QrdfDLZxgvAQjPe9GyC3CkIlQ9pfefQHQ1YxWE77tQdc7MjGN0O1TvpqU0d5Qxh4FT7uZRcct1SYz-RLWswF_yWfIzOyPpfI1vZgl_0Vgs",
  dq: "PlI-jrmCnxtXtI425ILB69p9sC9BS3cClkq58xf9zsy2a1PcrsMb0WHov7yy-gQSJkZhC18S3E1mv8LUZrQbazbaJGs_bRzbf6TrxyFRqYBmRLc-aVkPRhmifA2Fbp_C4TjV__Ao7WR769SuGlit-kovUauB4bMSmpotNl8n0DU",
  qi: "VEUxbS2qcvXGSJfcIJ_S0lN4ZdcXecIz1msEoNU4WHdJPJ8st3_kilWdS9omPjJ-8l1mpv5-rZYuVvKCkIV8_a8XbadzDsPrrFT9y1C23ElBa9qgbakb6-WT5VEzqB5GVrmGaMn_1qZo3ybBod8t59RAOJcmFkJEwWsNGMJksxU",
};

// ── ASN.1 DER helpers ────────────────────────────────────────────────────────

function concatU8(arrays) {
  const total = arrays.reduce((n, a) => n + a.length, 0);
  const out = new Uint8Array(total);
  let offset = 0;
  for (const a of arrays) { out.set(a, offset); offset += a.length; }
  return out;
}

function derLen(len) {
  if (len < 128) return new Uint8Array([len]);
  const b = [];
  let n = len;
  while (n > 0) { b.unshift(n & 0xff); n >>= 8; }
  return new Uint8Array([0x80 | b.length, ...b]);
}

function tlv(tag, v) {
  return concatU8([new Uint8Array([tag]), derLen(v.length), v]);
}

const derSeqOf  = (parts) => tlv(0x30, concatU8(parts));
const derOid    = (b)     => tlv(0x06, new Uint8Array(b));
const derUtf8   = (s)     => tlv(0x0c, new TextEncoder().encode(s));
const derNull   = ()      => new Uint8Array([0x05, 0x00]);
const derBitStr = (v)     => tlv(0x03, concatU8([new Uint8Array([0x00]), v]));
const derSetOf  = (parts) => tlv(0x31, concatU8(parts));

function derPosInt(b) {
  const v = (b[0] & 0x80) ? concatU8([new Uint8Array([0x00]), b]) : b;
  return tlv(0x02, v);
}

function derSmallInt(n) {
  return tlv(0x02, new Uint8Array([n]));
}

function derUtcTime(d) {
  const p = (n) => n.toString().padStart(2, "0");
  const y = d.getUTCFullYear().toString().slice(-2);
  const s = `${y}${p(d.getUTCMonth()+1)}${p(d.getUTCDate())}${p(d.getUTCHours())}${p(d.getUTCMinutes())}${p(d.getUTCSeconds())}Z`;
  return tlv(0x17, new TextEncoder().encode(s));
}

const OID_SHA256_RSA = [0x2a, 0x86, 0x48, 0x86, 0xf7, 0x0d, 0x01, 0x01, 0x0b];
const OID_CN         = [0x55, 0x04, 0x03];

function certAlgId() {
  return derSeqOf([derOid(OID_SHA256_RSA), derNull()]);
}

function certName(cn) {
  return derSeqOf([derSetOf([derSeqOf([derOid(OID_CN), derUtf8(cn)])])]);
}

// ── Main ─────────────────────────────────────────────────────────────────────

const crypto = globalThis.crypto;

const privateKey = await crypto.subtle.importKey(
  "jwk", HOSTED_PRIVATE_KEY_JWK,
  { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
  true, ["sign"]
);

const publicKey = await crypto.subtle.importKey(
  "jwk",
  { kty: "RSA", n: HOSTED_PRIVATE_KEY_JWK.n, e: HOSTED_PRIVATE_KEY_JWK.e, ext: true },
  { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
  true, ["verify"]
);

const spki = new Uint8Array(await crypto.subtle.exportKey("spki", publicKey));

const now    = new Date();
// 10-year validity - long enough not to need frequent regeneration
const exp    = new Date(now.getTime() + 10 * 365 * 24 * 60 * 60 * 1000);
const serial = crypto.getRandomValues(new Uint8Array(8));
const alg    = certAlgId();
const name   = certName("jwtarsenal.com");

const tbs = derSeqOf([
  tlv(0xa0, derSmallInt(2)),
  derPosInt(serial),
  alg,
  name,
  derSeqOf([derUtcTime(now), derUtcTime(exp)]),
  name,
  spki,
]);

const tbsBuf = tbs.buffer.slice(tbs.byteOffset, tbs.byteOffset + tbs.byteLength);
const sigBytes = new Uint8Array(await crypto.subtle.sign("RSASSA-PKCS1-v1_5", privateKey, tbsBuf));

const certDer = derSeqOf([tbs, alg, derBitStr(sigBytes)]);
const certB64 = Buffer.from(certDer).toString("base64");
const certPem = `-----BEGIN CERTIFICATE-----\n${certB64.match(/.{1,64}/g).join("\n")}\n-----END CERTIFICATE-----\n`;

const outPath = join(__dirname, "..", "public", "attacker.crt");
writeFileSync(outPath, certPem);
console.log(`Written to ${outPath}`);
console.log(`Validity: ${now.toISOString()} -> ${exp.toISOString()}`);
