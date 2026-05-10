export const SITE_URL         = "https://jwtarsenal.com";
export const SITE_NAME        = "JWT Arsenal";
export const SITE_DESCRIPTION = "100% client-side JWT exploitation toolkit for pentesters, CTF players and bug bounty hunters. Forge, inspect and exploit JWT vulnerabilities directly in your browser.";
export const OG_IMAGE         = `${SITE_URL}/opengraph-image`;

/** Build a page-level title: "Page Name | JWT Arsenal" */
export function pageTitle(name: string) {
  return `${name} | ${SITE_NAME}`;
}

/** Build full Metadata object for a page */
export function pageMeta(title: string, description: string, path = "") {
  const url      = `${SITE_URL}${path}`;
  const fullTitle = pageTitle(title);
  return {
    title: fullTitle,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: fullTitle,
      description,
      url,
      siteName: SITE_NAME,
      type: "website" as const,
      images: [{
        url:       OG_IMAGE,
        secureUrl: OG_IMAGE,
        width:     1200,
        height:    630,
        alt:       fullTitle,
        type:      "image/png",
      }],
    },
    twitter: {
      card:        "summary_large_image" as const,
      title:       fullTitle,
      description,
      images: [{
        url: OG_IMAGE,
        alt: fullTitle,
      }],
    },
  };
}
