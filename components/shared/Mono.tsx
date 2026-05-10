import React from "react";

export function Mono({ children }: { children: React.ReactNode }) {
  return (
    <code style={{ fontFamily: "var(--font-mono)", fontSize: "13px", color: "var(--accent)", background: "var(--accent-faint)", padding: "1px 5px", borderRadius: "4px" }}>
      {children}
    </code>
  );
}
