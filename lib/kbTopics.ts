export interface KbTopic {
  slug: string;
  title: string;
  description: string;
  color: string;
  exploitHref?: string;
  labPath?: string;
  labName?: string;
  readTime: string;
  tags: string[];
}

export const KB_TOPICS: KbTopic[] = [
  {
    slug: "jwt-structure",
    title: "JWT Structure & Internals",
    description: "How JWTs are encoded, which header fields matter to an attacker, and how the JOSE family of standards fits together.",
    color: "#a78bfa",
    readTime: "9 min",
    tags: ["RFC 7519", "Base64URL", "JOSE", "Internals"],
  },
  {
    slug: "unverified-signature",
    title: "Unverified Signature",
    description: "The server decodes the token but never calls the cryptographic verification function - any forged payload is accepted.",
    color: "#06b6d4",
    exploitHref: "/exploit/unverified-signature",
    labPath: "1-blind-trust",
    labName: "1 · Blind Trust",
    readTime: "7 min",
    tags: ["Critical", "No Crypto", "Microservices"],
  },
  {
    slug: "alg-none",
    title: "Algorithm None",
    description: 'RFC 7518 legitimises "none" as a valid algorithm. Vulnerable libraries accept unsigned tokens when the header says so.',
    color: "#f59e0b",
    exploitHref: "/exploit/alg-none",
    labPath: "2-voiding-the-rules",
    labName: "2 · Voiding the Rules",
    readTime: "8 min",
    tags: ["RFC 7518", "History", "8 Libraries"],
  },
  {
    slug: "algorithm-confusion",
    title: "Algorithm Confusion",
    description: "Switch alg from RS256 to HS256 - the library treats the RSA public key as the HMAC secret, which the attacker already knows.",
    color: "#84cc16",
    exploitHref: "/exploit/algorithm-confusion",
    labPath: "4-chameleon-hashes",
    labName: "4 · Chameleon Hashes",
    readTime: "11 min",
    tags: ["RS256→HS256", "Crypto", "Public Key"],
  },
  {
    slug: "kid-injection",
    title: "KID Injection",
    description: "The kid header selects which key to use. Unsanitised, it becomes a path traversal, SQL injection, or SSRF vector.",
    color: "#ef4444",
    exploitHref: "/exploit/kid-injection",
    labPath: "5-wrong-turn",
    labName: "5 · Wrong Turn",
    readTime: "9 min",
    tags: ["SQLi", "Path Traversal", "SSRF"],
  },
  {
    slug: "jwk-injection",
    title: "JWK Injection",
    description: "Embed your own RSA public key in the JWT header. A vulnerable server uses it to verify - against the attacker's own key.",
    color: "#ec4899",
    exploitHref: "/exploit/jwk-injection",
    labPath: "6-trojan-keys",
    labName: "6 · Trojan Keys",
    readTime: "8 min",
    tags: ["RFC 7515", "Self-Signed", "node-jose"],
  },
  {
    slug: "jku-injection",
    title: "JKU Injection",
    description: "Point jku at an attacker-controlled JWKS endpoint. The server fetches and trusts it for verification.",
    color: "#3b82f6",
    exploitHref: "/exploit/jku-injection",
    labPath: "7-puppet-master",
    labName: "7 · Puppet Master",
    readTime: "9 min",
    tags: ["SSRF", "JWKS", "Open Redirect"],
  },
  {
    slug: "public-key-recovery",
    title: "Public Key Recovery",
    description: "Recover the RSA public key from two signatures via GCD - without server access - then chain to algorithm confusion.",
    color: "#22c55e",
    exploitHref: "/exploit/public-key-recovery",
    labPath: "8-shadow-key",
    labName: "8 · Shadow Key",
    readTime: "10 min",
    tags: ["RSA Math", "GCD", "Attack Chain"],
  },
];

export const LAB_BASE = "https://github.com/HiitCat/JWT-SecLabs/tree/main";
