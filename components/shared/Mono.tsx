import React from "react";
import s from "@/styles/shared/Mono.module.css";

export function Mono({ children }: { children: React.ReactNode }) {
  return <code className={s.mono}>{children}</code>;
}
