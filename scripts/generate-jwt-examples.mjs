import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { exportPKCS8, exportSPKI, generateKeyPair } from "jose";

const payload = {
  sub: "user_42",
  username: "alice",
  role: "user",
};

const hmacSecrets = {
  HS256: "arsenal-hs256-secret",
  HS384: "arsenal-hs384-secret",
  HS512: "arsenal-hs512-secret",
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

async function createHmacExample(alg) {
  return {
    label: alg,
    alg,
    secret: hmacSecrets[alg],
  };
}

async function createKeyPairExample(alg, options) {
  const { publicKey, privateKey } = await generateKeyPair(alg, {
    ...options,
    extractable: true,
  });

  return {
    label: alg,
    alg,
    publicKey: await exportSPKI(publicKey),
    privateKey: await exportPKCS8(privateKey),
  };
}

async function main() {
  const examples = [
    { label: "none", alg: "none", category: "unsigned" },
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
