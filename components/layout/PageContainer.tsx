import { ReactNode } from "react";
import s from "@/styles/layout/PageContainer.module.css";

interface PageContainerProps {
  children: ReactNode;
  variant?: "default" | "article";
}

export function PageContainer({ children, variant = "default" }: PageContainerProps) {
  const maxWidth = variant === "article" ? "var(--container-article-max)" : "var(--container-max)";
  return (
    <main className={s.main} style={{ maxWidth }}>
      {children}
    </main>
  );
}
