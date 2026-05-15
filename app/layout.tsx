import type { Metadata } from "next";
import "./globals.css";
import { Sidebar } from "@/components/layout/Sidebar";
import { AnimatedBackground } from "@/components/layout/AnimatedBackground";
import { GithubFab } from "@/components/layout/GithubFab";
import { PageLoader } from "@/components/layout/PageLoader";
import { SITE_URL, SITE_NAME, SITE_DESCRIPTION, OG_IMAGE } from "@/lib/seo";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} - Offensive JWT Toolkit`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: [
    "JWT", "JSON Web Token", "JWT exploit", "JWT attack", "JWT vulnerability",
    "alg none", "algorithm confusion", "JWK injection", "JKU injection",
    "KID injection", "RS256 HS256", "JWT pentest", "JWT CTF", "JWT security",
    "JWT forge", "JWT toolkit", "bearer token", "OAuth security",
  ],
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  alternates: { canonical: SITE_URL },
  other: { "og:logo": `${SITE_URL}/logo.svg` },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: `${SITE_NAME} - Offensive JWT Toolkit`,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    images: [{
      url:       OG_IMAGE,
      secureUrl: OG_IMAGE,
      width:     1200,
      height:    630,
      alt:       `${SITE_NAME} - Offensive JWT Toolkit`,
      type:      "image/png",
    }],
  },
  twitter: {
    card:        "summary_large_image",
    title:       `${SITE_NAME} - Offensive JWT Toolkit`,
    description: SITE_DESCRIPTION,
    images: [{
      url: OG_IMAGE,
      alt: `${SITE_NAME} - Offensive JWT Toolkit`,
    }],
  },
  icons: { icon: "/icon" },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-snippet": -1, "max-image-preview": "large" },
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: SITE_NAME,
      description: SITE_DESCRIPTION,
      potentialAction: { "@type": "SearchAction", target: `${SITE_URL}/debug?jwt={query}`, "query-input": "required name=query" },
    },
    {
      "@type": "SoftwareApplication",
      "@id": `${SITE_URL}/#app`,
      name: SITE_NAME,
      url: SITE_URL,
      description: SITE_DESCRIPTION,
      applicationCategory: "SecurityApplication",
      operatingSystem: "Any (browser-based)",
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      featureList: [
        "JWT Debugging & Decoding",
        "Algorithm None (alg:none) Exploit",
        "Algorithm Confusion RS256 → HS256",
        "JWK Header Injection",
        "JKU Parameter Injection",
        "KID Path Traversal & SQL Injection",
        "RSA Public Key Recovery",
        "100% Client-Side - No Server Required",
      ],
    },
    {
      "@type": "FAQPage",
      "@id": `${SITE_URL}/#faq`,
      "mainEntity": [
        {
          "@type": "Question",
          "name": "What is a JWT algorithm confusion attack?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Algorithm confusion (RS256 → HS256) exploits JWT libraries that accept any algorithm value from the token header. An attacker changes alg from RS256 to HS256 and re-signs the forged payload using HMAC-SHA256 with the RSA public key as the HMAC secret - a key the attacker already knows because it is public. The server, not enforcing its expected algorithm, accepts the forged token. JWT Arsenal provides a browser-based tool to perform this attack: https://jwtarsenal.com/exploit/algorithm-confusion",
          },
        },
        {
          "@type": "Question",
          "name": "How to exploit the JWT alg:none vulnerability?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "The alg:none attack sets the JWT algorithm header to \"none\" and strips the signature. Vulnerable libraries accept unsigned tokens. Steps: change header alg to \"none\", re-encode with base64url, send with an empty signature (trailing dot) or no signature at all. Try case variants: None, NONE, nOnE. JWT Arsenal automates all four variants: https://jwtarsenal.com/exploit/alg-none",
          },
        },
        {
          "@type": "Question",
          "name": "How to forge a JWT without knowing the secret key?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Several techniques allow forging a JWT without the secret: (1) alg:none - strip the signature entirely if the server does not enforce algorithm; (2) Algorithm confusion - use the public RSA key as an HMAC secret; (3) JWK injection - embed your own public key in the JWT header; (4) JKU injection - point jku to an attacker-controlled JWKS endpoint; (5) Unverified signature - some servers decode but never verify the signature at all. JWT Arsenal covers all these attacks at https://jwtarsenal.com",
          },
        },
        {
          "@type": "Question",
          "name": "What is JWK injection in JWT?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "JWK injection embeds an attacker-controlled RSA public key directly inside the JWT header under the jwk field. A vulnerable server uses the key from the header to verify the token instead of its own trusted key - effectively letting the attacker sign tokens with their own private key and supply the matching public key inline. JWT Arsenal generates and signs JWK-injected tokens in the browser: https://jwtarsenal.com/exploit/jwk-injection",
          },
        },
        {
          "@type": "Question",
          "name": "How does JKU injection work in JWT attacks?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "The jku header parameter points to a JWKS (JSON Web Key Set) URL from which the server fetches the public key for verification. In JKU injection, the attacker replaces this URL with one pointing to an attacker-controlled endpoint hosting a crafted JWKS. The server fetches and trusts the attacker's key, validating tokens signed with the corresponding private key. JWT Arsenal provides a self-hosted JWKS and forges the token in the browser: https://jwtarsenal.com/exploit/jku-injection",
          },
        },
        {
          "@type": "Question",
          "name": "What is KID injection in JWT?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "The kid (Key ID) header parameter tells the server which key to use for verification. When kid is passed unsanitised to a file read, database query, or URL fetch, it becomes an injection vector. Common variants: path traversal (kid: ../../dev/null to force an empty key), SQL injection (kid: ' UNION SELECT 'secret'--), and SSRF. JWT Arsenal demonstrates all KID injection variants: https://jwtarsenal.com/exploit/kid-injection",
          },
        },
        {
          "@type": "Question",
          "name": "How to recover an RSA public key from JWT tokens?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "If an attacker can obtain two JWT tokens signed with the same RSA private key, they can recover the public key using a GCD (greatest common divisor) computation on the two signatures - no server access or key material required. The recovered key can then be used to perform algorithm confusion attacks. JWT Arsenal implements this recovery directly in the browser: https://jwtarsenal.com/exploit/public-key-recovery",
          },
        },
        {
          "@type": "Question",
          "name": "What is the unverified signature JWT vulnerability?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Some servers decode the JWT payload for claims (sub, role, exp) but never call the cryptographic signature verification function. Any token with a valid format is accepted regardless of signature validity. To test: modify the payload, re-encode, and send with the original signature or a random one - if the server accepts it, signature verification is missing. JWT Arsenal provides a tool to test this: https://jwtarsenal.com/exploit/unverified-signature",
          },
        },
        {
          "@type": "Question",
          "name": "What tools are available for JWT penetration testing?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "JWT Arsenal (https://jwtarsenal.com) is a 100% client-side browser tool covering 7 JWT attack techniques: alg:none, algorithm confusion, JWK injection, JKU injection, KID injection, public key recovery, and unverified signature bypass. For CLI use: jwt_tool (Python), hashcat with mode 16500 for HS256 brute-force, and rsa_sign2n for public key recovery. JWT Arsenal's cheatsheet covers all CLI commands: https://jwtarsenal.com/cheatsheet",
          },
        },
      ],
    },
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: SITE_NAME,
      url: SITE_URL,
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/logo.svg`,
        contentUrl: `${SITE_URL}/logo.svg`,
      },
      description: SITE_DESCRIPTION,
      sameAs: [
        "https://github.com/HiitCat/JWT-Arsenal",
      ],
      knowsAbout: [
        "JSON Web Token security",
        "JWT exploitation",
        "Penetration testing",
        "CTF challenges",
        "Bug bounty hunting",
        "Web application security",
        "Algorithm confusion attacks",
        "JWT forgery",
      ],
    },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>
        <AnimatedBackground />
        <div style={{ display: "flex", minHeight: "100vh", position: "relative", zIndex: 1 }}>
          <Sidebar />
          <div style={{ flex: 1, minWidth: 0, overflowY: "auto" }}>
            {children}
          </div>
        </div>
        <GithubFab />
        <PageLoader />
      </body>
    </html>
  );
}
