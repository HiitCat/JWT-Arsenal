/**
 * Regenerates lib/jwtExamples.ts with fresh RSA/EC/EdDSA keypairs.
 * Run manually when rotating keys: node scripts/generate-jwt-examples.mjs
 * Not part of the production build.
 */
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { exportPKCS8, exportSPKI, generateKeyPair } from "jose";

const HMAC_SECRETS = {
  HS256: "arsenal-hs256-secret",
  HS384: "arsenal-hs384-secret",
  HS512: "arsenal-hs512-secret",
};

async function buildKeyPairEntry(alg, options, category) {
  const { publicKey, privateKey } = await generateKeyPair(alg, { ...options, extractable: true });
  return { label: alg, alg, category, publicKey: await exportSPKI(publicKey), privateKey: await exportPKCS8(privateKey) };
}

async function main() {
  const configs = [
    { label: "none",  alg: "none",  category: "unsigned" },
    { label: "HS256", alg: "HS256", category: "hmac", secret: HMAC_SECRETS.HS256 },
    { label: "HS384", alg: "HS384", category: "hmac", secret: HMAC_SECRETS.HS384 },
    { label: "HS512", alg: "HS512", category: "hmac", secret: HMAC_SECRETS.HS512 },
    await buildKeyPairEntry("RS256", { modulusLength: 2048 }, "rsa"),
    await buildKeyPairEntry("RS384", { modulusLength: 2048 }, "rsa"),
    await buildKeyPairEntry("RS512", { modulusLength: 2048 }, "rsa"),
    await buildKeyPairEntry("PS256", { modulusLength: 2048 }, "pss"),
    await buildKeyPairEntry("PS384", { modulusLength: 2048 }, "pss"),
    await buildKeyPairEntry("PS512", { modulusLength: 2048 }, "pss"),
    await buildKeyPairEntry("ES256", { crv: "P-256" }, "ec"),
    await buildKeyPairEntry("ES384", { crv: "P-384" }, "ec"),
    await buildKeyPairEntry("ES512", { crv: "P-521" }, "ec"),
    await buildKeyPairEntry("EdDSA", { crv: "Ed25519" }, "okp"),
  ];

  const output = `import { SignJWT, importPKCS8 } from "jose";

export type JwtExample = {
  label: string;
  alg: string;
  category: "unsigned" | "hmac" | "rsa" | "pss" | "ec" | "okp";
  secret?: string;
  publicKey?: string;
  privateKey?: string;
  jwk?: Record<string, unknown>;
};

const EXAMPLE_PAYLOAD = { sub: "user_42", username: "alice", role: "user" };

function b64url(obj: unknown): string {
  return btoa(JSON.stringify(obj)).replace(/=/g, "").replace(/\\+/g, "-").replace(/\\//g, "_");
}

export async function generateExampleToken(example: JwtExample): Promise<string> {
  const payload = { ...EXAMPLE_PAYLOAD, iat: Math.floor(Date.now() / 1000) - 15 * 60 };

  if (example.category === "unsigned") {
    return \`\${b64url({ alg: "none", typ: "JWT" })}.\${b64url(payload)}.\`;
  }

  const jwt = new SignJWT(payload as Record<string, unknown>)
    .setProtectedHeader({ alg: example.alg, typ: "JWT" });

  if (example.category === "hmac") {
    return jwt.sign(new TextEncoder().encode(example.secret!));
  }

  return jwt.sign(await importPKCS8(example.privateKey!, example.alg));
}

export const JWT_EXAMPLE_CONFIGS: JwtExample[] = ${JSON.stringify(configs, null, 2)};
`;

  const target = resolve("lib/jwtExamples.ts");
  await mkdir(dirname(target), { recursive: true });
  await writeFile(target, output, "utf8");
  console.log("lib/jwtExamples.ts regenerated with fresh keypairs.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
