import NextLink from "next/link";
import type React from "react";
import { ExternalLink } from "lucide-react";

interface LinkProps extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href"> {
  href: string;
  external?: boolean;
  showExternalIcon?: boolean;
  variant?: "inline" | "unstyled";
}

export function Link({
  href,
  children,
  external,
  showExternalIcon = true,
  variant = "inline",
  style,
  target,
  rel,
  ...props
}: LinkProps) {
  const isExternal = external ?? /^[a-z][a-z\d+.-]*:/.test(href);
  const linkStyle = variant === "inline"
    ? { color: "var(--accent)", display: "inline-flex", alignItems: "center", gap: "4px", ...style }
    : style;

  if (!isExternal) {
    return (
      <NextLink
        href={href}
        style={linkStyle}
        {...props}
      >
        {children}
      </NextLink>
    );
  }

  return (
    <a
      href={href}
      target={target ?? "_blank"}
      rel={rel ?? "noopener noreferrer"}
      style={linkStyle}
      {...props}
    >
      {children}
      {showExternalIcon && variant === "inline" && <ExternalLink size={11} />}
    </a>
  );
}
