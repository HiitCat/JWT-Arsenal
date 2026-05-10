import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta(
  "JWT Inspector",
  "Decode and inspect any JWT instantly. View headers, claims, expiry, and send tokens directly to exploit tools - all client-side.",
  "/inspect",
);

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
