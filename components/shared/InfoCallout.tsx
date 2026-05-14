import { ReactNode } from "react";
import { Info, AlertTriangle, AlertOctagon, CheckCircle } from "lucide-react";
import clsx from "clsx";
import s from "@/styles/shared/InfoCallout.module.css";

type Variant = "info" | "warning" | "danger" | "success";

const variantConfig: Record<Variant, { icon: React.ElementType; color: string }> = {
  info:    { icon: Info,          color: "var(--info)" },
  warning: { icon: AlertTriangle, color: "var(--warning)" },
  danger:  { icon: AlertOctagon,  color: "var(--danger)" },
  success: { icon: CheckCircle,   color: "var(--success)" },
};

export function InfoCallout({ variant = "info", title, children }: { variant?: Variant; title?: string; children: ReactNode }) {
  const { icon: Icon, color } = variantConfig[variant];
  return (
    <div
      className={clsx(s.callout, s[variant])}
      style={{ "--list-marker-color": color } as React.CSSProperties}
    >
      <Icon size={16} color={color} className={s.icon} />
      <div className={s.body}>
        {title && <div className={s.calloutTitle}>{title}</div>}
        <div className={s.calloutContent}>{children}</div>
      </div>
    </div>
  );
}
