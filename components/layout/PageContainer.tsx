import { ReactNode } from "react";

interface PageContainerProps {
  children: ReactNode;
  variant?: "default" | "article";
}

export function PageContainer({ children, variant = "default" }: PageContainerProps) {
  const maxWidth = variant === "article" ? "var(--container-article-max)" : "var(--container-max)";
  return (
    <main
      style={{
        flex: 1,
        maxWidth,
        width: "100%",
        padding: "32px var(--container-px)",
        margin: "0 auto",
      }}
    >
      {children}
    </main>
  );
}
