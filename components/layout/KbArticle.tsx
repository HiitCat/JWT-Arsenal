"use client";
import React from "react";
import { KB_TOPICS, LAB_BASE, KbTopic } from "@/lib/kbTopics";
import { PageContainer } from "@/components/layout/PageContainer";
import { Icon } from "@/components/shared/Icons";
import { Link as AppLink } from "@/components/shared/Link";

type IconFn = (p: { size?: number }) => React.ReactElement;
const TOPIC_ICONS: Record<string, IconFn> = {
  "jwt-structure":       Icon.Layers,
  "unverified-signature": Icon.Eye,
  "alg-none":            Icon.AlertTriangle,
  "algorithm-confusion": Icon.Zap,
  "kid-injection":       Icon.Key,
  "jwk-injection":       Icon.FileKey,
  "jku-injection":       Icon.Globe,
  "public-key-recovery": Icon.Lock,
};
export { Mono } from "@/components/shared/Mono";

interface KbArticleProps {
  slug: string;
  children: React.ReactNode;
}

export function KbArticle({ slug, children }: KbArticleProps) {
  const TopicIcon = TOPIC_ICONS[slug] ?? Icon.BookOpen;
  const idx = KB_TOPICS.findIndex((t) => t.slug === slug);
  const topic = KB_TOPICS[idx] as KbTopic;
  const prev = idx > 0 ? KB_TOPICS[idx - 1] : null;
  const next = idx < KB_TOPICS.length - 1 ? KB_TOPICS[idx + 1] : null;

  return (
    <PageContainer variant="article">
      <div style={{ paddingTop: "28px", paddingBottom: "64px" }}>

        {/* Breadcrumb */}
        <nav style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", color: "var(--text-muted)", marginBottom: "32px" }}>
          <a href="/knowledge-base" style={{ color: "var(--text-muted)", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "4px" }}>
            <Icon.BookOpen size={12} /> Knowledge Base
          </a>
          <span style={{ opacity: 0.4 }}>/</span>
          <span style={{ color: "var(--text)" }}>{topic.title}</span>
        </nav>

        {/* Article header */}
        <div style={{ marginBottom: "32px", paddingBottom: "28px", borderBottom: "1px solid var(--border)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "16px" }}>
            <div style={{
              width: "44px", height: "44px", borderRadius: "10px", flexShrink: 0,
              background: `${topic.color}18`,
              border: `1px solid ${topic.color}35`,
              display: "flex", alignItems: "center", justifyContent: "center",
              color: topic.color,
            }}>
              <TopicIcon size={20} />
            </div>
            <h1 style={{ fontSize: "32px", fontWeight: 700, color: topic.color, margin: 0, lineHeight: 1.2 }}>
              {topic.title}
            </h1>
          </div>
          <p style={{ fontSize: "16px", color: "var(--text-muted)", lineHeight: 1.7, margin: "0 0 20px", maxWidth: "680px" }}>
            {topic.description}
          </p>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {topic.exploitHref && (
              <a href={topic.exploitHref} style={{ display: "inline-flex", alignItems: "center", gap: "5px", height: "32px", padding: "0 12px", background: "var(--accent-tint)", border: "1px solid var(--accent-border-mid)", borderRadius: "var(--radius)", color: "var(--accent)", textDecoration: "none", fontSize: "12px", fontWeight: 500 }}>
                <Icon.Wand size={11} /> Open exploit tool
              </a>
            )}
            {topic.labPath && (
              <a href={`${LAB_BASE}/${topic.labPath}`} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: "5px", height: "32px", padding: "0 12px", background: "var(--bg-elevated)", border: "1px solid var(--border)", borderRadius: "var(--radius)", color: "var(--text-muted)", textDecoration: "none", fontSize: "12px", fontWeight: 500 }}>
                <Icon.FlaskConical size={11} /> {topic.labName}
              </a>
            )}
          </div>
        </div>

        {/* Article body */}
        <div
          className="kb-article-body"
          style={{
            "--topic-color": topic.color,
            background: "var(--bg-elevated)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius)",
            padding: "32px",
            marginBottom: "40px",
          } as React.CSSProperties}
        >
          {children}
        </div>

        {/* Prev / Next */}
        <div style={{ display: "flex", gap: "24px", marginTop: "64px", paddingTop: "32px", borderTop: "1px solid var(--border)" }}>
          {prev ? (() => { const PrevIcon = TOPIC_ICONS[prev.slug]; return (
            <a href={`/knowledge-base/${prev.slug}`} style={{ flex: 1, display: "flex", alignItems: "center", gap: "10px", padding: "14px 16px", background: `${prev.color}0d`, border: `1px solid ${prev.color}35`, borderRadius: "var(--radius)", textDecoration: "none", transition: "border-color 0.15s" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = `${prev.color}70`; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = `${prev.color}35`; }}>
              <span style={{ fontSize: "14px", color: prev.color, flexShrink: 0 }}>←</span>
              <span style={{ fontSize: "14px", fontWeight: 500, color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{prev.title}</span>
              {PrevIcon && <span style={{ color: prev.color, flexShrink: 0, display: "flex", alignItems: "center" }}><PrevIcon size={15} /></span>}
            </a>
          ); })() : <div style={{ flex: 1 }} />}
          {next ? (() => { const NextIcon = TOPIC_ICONS[next.slug]; return (
            <a href={`/knowledge-base/${next.slug}`} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "10px", padding: "14px 16px", background: `${next.color}0d`, border: `1px solid ${next.color}35`, borderRadius: "var(--radius)", textDecoration: "none", transition: "border-color 0.15s" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = `${next.color}70`; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = `${next.color}35`; }}>
              {NextIcon && <span style={{ color: next.color, flexShrink: 0, display: "flex", alignItems: "center" }}><NextIcon size={15} /></span>}
              <span style={{ fontSize: "14px", fontWeight: 500, color: "var(--text)", minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{next.title}</span>
              <span style={{ fontSize: "14px", color: next.color, flexShrink: 0 }}>→</span>
            </a>
          ); })() : <div style={{ flex: 1 }} />}
        </div>
      </div>
    </PageContainer>
  );
}

export function H2({ children, id }: { children: React.ReactNode; id?: string }) {
  return (
    <h2 id={id} style={{ fontSize: "20px", fontWeight: 700, color: "var(--topic-color, var(--text))", margin: "40px 0 16px", scrollMarginTop: "24px", lineHeight: 1.3 }}>
      {children}
    </h2>
  );
}

export function H3({ children, id }: { children: React.ReactNode; id?: string }) {
  return (
    <h3 id={id} style={{ fontSize: "16px", fontWeight: 600, color: "var(--topic-color, var(--text))", margin: "28px 0 12px", scrollMarginTop: "24px" }}>
      {children}
    </h3>
  );
}

export function P({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ fontSize: "14px", color: "var(--text-muted)", lineHeight: 1.8, margin: "0 0 16px" }}>
      {children}
    </p>
  );
}


export function Ref({ href, children }: { href: string; children: React.ReactNode }) {
  return <AppLink href={href}>{children}</AppLink>;
}

export function ImpactBox({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ padding: "16px 20px", background: "var(--danger-bg)", border: "1px solid var(--danger-border)", borderRadius: "var(--radius)", marginBottom: "20px", "--list-marker-color": "var(--danger)" } as React.CSSProperties}>
      <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--danger)", marginBottom: "10px", display: "flex", alignItems: "center", gap: "6px" }}>
        <Icon.Skull size={13} /> {title}
      </div>
      <div style={{ fontSize: "13px", color: "var(--text-muted)", lineHeight: 1.75 }}>{children}</div>
    </div>
  );
}
