import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta(
  "Knowledge Base",
  "In-depth technical articles on JWT vulnerabilities - cryptographic mechanics, vulnerable code patterns, real-world bug bounty cases, and mitigations.",
  "/knowledge-base",
);

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
