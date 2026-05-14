import { ReactNode } from "react";
import s from "@/styles/shared/StepCard.module.css";

export function StepCard({ number, title, children }: { number: number; title: string; children: ReactNode }) {
  return (
    <div className={s.card}>
      <div className={s.badge}>{number}</div>
      <div className={s.body}>
        <div className={s.title}>{title}</div>
        <div className={s.content}>{children}</div>
      </div>
    </div>
  );
}
