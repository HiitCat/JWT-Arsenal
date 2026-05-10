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
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: `${SITE_NAME} - Offensive JWT Toolkit`,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: `${SITE_NAME} - Offensive JWT Toolkit` }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} - Offensive JWT Toolkit`,
    description: SITE_DESCRIPTION,
    images: [OG_IMAGE],
  },
  icons: {
    icon: "/icon",
    shortcut: "/icon",
    apple: "/icon",
  },
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
      potentialAction: { "@type": "SearchAction", target: `${SITE_URL}/inspect?jwt={query}`, "query-input": "required name=query" },
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
        "JWT Inspection & Decoding",
        "Algorithm None (alg:none) Exploit",
        "Algorithm Confusion RS256→HS256",
        "JWK Header Injection",
        "JKU Parameter Injection",
        "KID Path Traversal & SQL Injection",
        "RSA Public Key Recovery",
        "100% Client-Side - No Server Required",
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
