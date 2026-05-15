import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta(
  "JWT Debugger",
  "Decode and debug any JWT instantly. View headers, claims, expiry, and send tokens directly to exploit tools - all client-side.",
  "/debug",
);

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
