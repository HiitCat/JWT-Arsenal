import { ExternalLink } from "lucide-react";

interface LinkProps {
  href: string;
  children: React.ReactNode;
  external?: boolean;
  style?: React.CSSProperties;
}

export function Link({ href, children, external, style }: LinkProps) {
  const isExternal = external ?? href.startsWith("http");
  return (
    <a
      href={href}
      {...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      style={{ color: "var(--accent)", display: "inline-flex", alignItems: "center", gap: "4px", ...style }}
    >
      {children}
      {isExternal && <ExternalLink size={11} />}
    </a>
  );
}
