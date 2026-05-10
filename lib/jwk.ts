// JWK helpers - build JWKS, strip private fields, etc.

import { jwkThumbprint } from "./crypto";

export function stripPrivateFields(jwk: JsonWebKey): JsonWebKey {
  const pub: JsonWebKey = { ...jwk };
  delete pub.d;
  delete pub.p;
  delete pub.q;
  delete pub.dp;
  delete pub.dq;
  delete pub.qi;
  pub.key_ops = ["verify"];
  return pub;
}

export async function buildJwksJson(publicJwk: JsonWebKey): Promise<string> {
  const kid = await jwkThumbprint(publicJwk);
  const key = { ...publicJwk, kid, use: "sig" };
  delete key.key_ops;
  return JSON.stringify({ keys: [key] }, null, 2);
}

export function isValidJwk(obj: unknown): obj is JsonWebKey {
  if (typeof obj !== "object" || obj === null) return false;
  const jwk = obj as Record<string, unknown>;
  return typeof jwk.kty === "string";
}

export function parseJwk(input: string): JsonWebKey {
  try {
    const parsed = JSON.parse(input);
    if (!isValidJwk(parsed)) throw new Error("Not a valid JWK object");
    return parsed as JsonWebKey;
  } catch {
    throw new Error("Invalid JWK JSON");
  }
}
