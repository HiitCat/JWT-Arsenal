import { TOPIC_COLORS } from "./colors";

export interface KbTopic {
  slug: string;
  title: string;
  description: string;
  color: string;
  exploitHref?: string;
  labPath?: string;
  labName?: string;
}

export const KB_TOPICS: KbTopic[] = [
  {
    slug: "jwt-structure",
    title: "JWT Structure & Internals",
    description: "How JWTs are encoded, which header fields matter to an attacker, and how the JOSE family of standards fits together.",
    color: TOPIC_COLORS.jwtStructure,
  },
  {
    slug: "unverified-signature",
    title: "Unverified Signature",
    description: "The server decodes the token but never calls the cryptographic verification function - any forged payload is accepted.",
    color: TOPIC_COLORS.unverifiedSignature,
    exploitHref: "/exploit/unverified-signature",
    labPath: "1-blind-trust",
    labName: "1 · Blind Trust",
  },
  {
    slug: "alg-none",
    title: "Algorithm None",
    description: 'RFC 7518 legitimises "none" as a valid algorithm. Vulnerable libraries accept unsigned tokens when the header says so.',
    color: TOPIC_COLORS.algNone,
    exploitHref: "/exploit/alg-none",
    labPath: "2-voiding-the-rules",
    labName: "2 · Voiding the Rules",
  },
  {
    slug: "algorithm-confusion",
    title: "Algorithm Confusion",
    description: "Switch alg from RS256 to HS256 - the library treats the RSA public key as the HMAC secret, which the attacker already knows.",
    color: TOPIC_COLORS.algorithmConfusion,
    exploitHref: "/exploit/algorithm-confusion",
    labPath: "4-chameleon-hashes",
    labName: "4 · Chameleon Hashes",
  },
  {
    slug: "kid-injection",
    title: "KID Injection",
    description: "The kid header selects which key to use. Unsanitised, it becomes a path traversal, SQL injection, or SSRF vector.",
    color: TOPIC_COLORS.kidInjection,
    exploitHref: "/exploit/kid-injection",
    labPath: "5-wrong-turn",
    labName: "5 · Wrong Turn",
  },
  {
    slug: "jwk-injection",
    title: "JWK Injection",
    description: "Embed your own RSA public key in the JWT header. A vulnerable server uses it to verify - against the attacker's own key.",
    color: TOPIC_COLORS.jwkInjection,
    exploitHref: "/exploit/jwk-injection",
    labPath: "6-trojan-keys",
    labName: "6 · Trojan Keys",
  },
  {
    slug: "jku-injection",
    title: "JKU Injection",
    description: "Point jku at an attacker-controlled JWKS endpoint. The server fetches and trusts it for verification.",
    color: TOPIC_COLORS.jkuInjection,
    exploitHref: "/exploit/jku-injection",
    labPath: "7-puppet-master",
    labName: "7 · Puppet Master"
  },
  {
    slug: "public-key-recovery",
    title: "Public Key Recovery",
    description: "Recover the RSA public key from two signatures via GCD - without server access - then chain to algorithm confusion.",
    color: TOPIC_COLORS.publicKeyRecovery,
    exploitHref: "/exploit/public-key-recovery",
    labPath: "8-shadow-key",
    labName: "8 · Shadow Key",
  },
];

export const LAB_BASE = "https://github.com/HiitCat/JWT-SecLabs/tree/main";
