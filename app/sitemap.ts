import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";
import { KB_TOPICS } from "@/lib/kbTopics";

export const dynamic = "force-static";

const now = new Date();

const exploitSlugs = [
  "unverified-signature",
  "alg-none",
  "algorithm-confusion",
  "kid-injection",
  "jwk-injection",
  "jku-injection",
  "public-key-recovery",
];

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: SITE_URL,                           lastModified: now, changeFrequency: "weekly",  priority: 1.0 },
    { url: `${SITE_URL}/debug`,                lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/knowledge-base`,       lastModified: now, changeFrequency: "weekly",  priority: 0.9 },
    { url: `${SITE_URL}/cheatsheet`,           lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/about`,               lastModified: now, changeFrequency: "monthly", priority: 0.5 },

    ...KB_TOPICS.map((t) => ({
      url:             `${SITE_URL}/knowledge-base/${t.slug}`,
      lastModified:    now,
      changeFrequency: "monthly" as const,
      priority:        0.85,
    })),

    ...exploitSlugs.map((slug) => ({
      url:             `${SITE_URL}/exploit/${slug}`,
      lastModified:    now,
      changeFrequency: "monthly" as const,
      priority:        0.8,
    })),
  ];
}
