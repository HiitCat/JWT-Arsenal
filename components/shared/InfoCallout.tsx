import { ReactNode } from "react";
import { Info, AlertTriangle, AlertOctagon, CheckCircle } from "lucide-react";

type Variant = "info" | "warning" | "danger" | "success";

const variantStyles: Record<Variant, { bg: string; border: string; icon: React.ElementType; color: string }> = {
  info:    { bg: "var(--info-tint)",     border: "var(--info-border)",           icon: Info,          color: "var(--info)" },
  warning: { bg: "var(--warning-tint)",  border: "var(--warning-border)",        icon: AlertTriangle, color: "var(--warning)" },
  danger:  { bg: "var(--danger-tint)",   border: "var(--danger-border-strong)",  icon: AlertOctagon,  color: "var(--danger)" },
  success: { bg: "var(--success-tint)",  border: "var(--success-border)",        icon: CheckCircle,   color: "var(--success)" },
};

export function InfoCallout({ variant = "info", title, children }: { variant?: Variant; title?: string; children: ReactNode }) {
  const { bg, border, icon: Icon, color } = variantStyles[variant];
  return (
    <div
      style={{
        background: bg,
        border: `1px solid ${border}`,
        borderRadius: "var(--radius)",
        padding: "16px",
        display: "flex",
        gap: "12px",
        marginBottom: "20px",
        "--list-marker-color": color,
      } as React.CSSProperties}
    >
      <Icon size={16} color={color} style={{ flexShrink: 0, marginTop: "1px" }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        {title && (
          <div style={{ fontWeight: 600, fontSize: "14px", color: "var(--text)", marginBottom: "4px" }}>
            {title}
          </div>
        )}
        <div style={{ fontSize: "14px", color: "var(--text-muted)", lineHeight: 1.6 }}>{children}</div>
      </div>
    </div>
  );
}
