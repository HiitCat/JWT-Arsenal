// PEM parsing and validation utilities

export function isPemPublicKey(pem: string): boolean {
  return (
    pem.includes("-----BEGIN PUBLIC KEY-----") ||
    pem.includes("-----BEGIN RSA PUBLIC KEY-----")
  );
}

export function isPemPrivateKey(pem: string): boolean {
  return (
    pem.includes("-----BEGIN PRIVATE KEY-----") ||
    pem.includes("-----BEGIN RSA PRIVATE KEY-----") ||
    pem.includes("-----BEGIN EC PRIVATE KEY-----")
  );
}

export function normalizePem(pem: string): string {
  // Strip extra whitespace, ensure proper line breaks
  const label = pem.match(/-----BEGIN ([^-]+)-----/)?.[1];
  if (!label) throw new Error("Invalid PEM: missing header");
  const base64 = pem
    .replace(/-----BEGIN [^-]+-----/g, "")
    .replace(/-----END [^-]+-----/g, "")
    .replace(/\s/g, "");
  const lines = base64.match(/.{1,64}/g) ?? [];
  return `-----BEGIN ${label}-----\n${lines.join("\n")}\n-----END ${label}-----\n`;
}

export function extractPemLabel(pem: string): string | null {
  return pem.match(/-----BEGIN ([^-]+)-----/)?.[1] ?? null;
}
