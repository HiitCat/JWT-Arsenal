import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import {
  SignJWT,
  exportPKCS8,
  exportSPKI,
  generateKeyPair,
} from "jose";

const payload = {
  sub: "1234567890",
  name: "John Doe",
  admin: true,
  iat: 1516239022,
};

const hmacSecrets = {
  HS256: "jwt-arsenal-hs256-secret-example-32-bytes-min",
  HS384: "jwt-arsenal-hs384-secret-example-that-is-long-enough-for-demo",
  HS512: "jwt-arsenal-hs512-secret-example-that-is-deliberately-much-longer-for-demo-use",
};

function encodeBase64UrlJson(value) {
  return Buffer.from(JSON.stringify(value), "utf8")
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function formatObject(value, indent = 2) {
  return JSON.stringify(value, null, indent);
}

async function createNoneToken() {
  return `${encodeBase64UrlJson({ alg: "none", typ: "JWT" })}.${encodeBase64UrlJson(payload)}.`;
}

async function createHmacExample(alg) {
  const secret = new TextEncoder().encode(hmacSecrets[alg]);

  // Re-import the intended UTF-8 demo secret so the inspect page can verify it directly.
  const importedKey = await crypto.subtle.importKey(
    "raw",
    secret,
    { name: "HMAC", hash: alg.replace("HS", "SHA-") },
    false,
    ["sign"]
  );

  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg, typ: "JWT" })
    .sign(importedKey);

  return {
    label: alg,
    alg,
    token,
    secret: hmacSecrets[alg],
  };
}

async function createKeyPairExample(alg, options) {
  const { publicKey, privateKey } = await generateKeyPair(alg, {
    ...options,
    extractable: true,
  });
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg, typ: "JWT" })
    .sign(privateKey);

  return {
    label: alg,
    alg,
    token,
    publicKey: await exportSPKI(publicKey),
    privateKey: await exportPKCS8(privateKey),
  };
}

async function main() {
  const examples = [
    {
      label: "none",
      alg: "none",
      token: await createNoneToken(),
      category: "unsigned",
    },
    { ...(await createHmacExample("HS256")), category: "hmac" },
    { ...(await createHmacExample("HS384")), category: "hmac" },
    { ...(await createHmacExample("HS512")), category: "hmac" },
    { ...(await createKeyPairExample("RS256", { modulusLength: 2048 })), category: "rsa" },
    { ...(await createKeyPairExample("RS384", { modulusLength: 2048 })), category: "rsa" },
    { ...(await createKeyPairExample("RS512", { modulusLength: 2048 })), category: "rsa" },
    { ...(await createKeyPairExample("PS256", { modulusLength: 2048 })), category: "pss" },
    { ...(await createKeyPairExample("PS384", { modulusLength: 2048 })), category: "pss" },
    { ...(await createKeyPairExample("PS512", { modulusLength: 2048 })), category: "pss" },
    { ...(await createKeyPairExample("ES256", { crv: "P-256" })), category: "ec" },
    { ...(await createKeyPairExample("ES384", { crv: "P-384" })), category: "ec" },
    { ...(await createKeyPairExample("ES512", { crv: "P-521" })), category: "ec" },
    { ...(await createKeyPairExample("EdDSA", { crv: "Ed25519" })), category: "okp" },
  ];

  const output = `export type JwtExample = {
  label: string;
  alg: string;
  category: "unsigned" | "hmac" | "rsa" | "pss" | "ec" | "okp";
  token: string;
  secret?: string;
  publicKey?: string;
  privateKey?: string;
  jwk?: Record<string, unknown>;
};

export const JWT_EXAMPLES: JwtExample[] = ${formatObject(examples)};
`;

  const target = resolve("lib/jwtExamples.ts");
  await mkdir(dirname(target), { recursive: true });
  await writeFile(target, output, "utf8");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
