"use client";
import React from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { Icon } from "@/components/shared/Icons";
import { KB_TOPICS } from "@/lib/kbTopics";
import { GlowCard, hexToRgb } from "@/components/shared/GlowCard";

const ICONS: Record<string, (p: { size?: number }) => React.ReactElement> = {
  "jwt-structure":        Icon.Layers,
  "unverified-signature": Icon.Eye,
  "alg-none":             Icon.AlertTriangle,
  "algorithm-confusion":  Icon.Zap,
  "kid-injection":        Icon.Key,
  "jwk-injection":        Icon.FileKey,
  "jku-injection":        Icon.Globe,
  "public-key-recovery":  Icon.Lock,
};

export default function KnowledgeBasePage() {
  return (
    <PageContainer>
      <div style={{ paddingTop: "40px", paddingBottom: "64px" }}>

        {/* Hero */}
        <div style={{ marginBottom: "48px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
            <span style={{ color: "var(--accent)" }}><Icon.BookOpen size={28} /></span>
            <h1 style={{ fontSize: "36px", fontWeight: 700, color: "var(--text)", margin: 0, lineHeight: 1.15 }}>
              Knowledge Base
            </h1>
          </div>
          <p style={{ fontSize: "16px", color: "var(--text-muted)", maxWidth: "600px", lineHeight: 1.75, margin: 0 }}>
            In-depth technical articles on JWT vulnerabilities - cryptographic mechanics,
            vulnerable code patterns, real-world bug bounty cases, and mitigations.
          </p>
        </div>

        {/* Topic grid */}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {KB_TOPICS.map((topic, i) => {
            const TopicIcon = ICONS[topic.slug] ?? Icon.BookOpen;
            const rgb = hexToRgb(topic.color);
            return (
              <GlowCard
                key={topic.slug}
                color={topic.color}
                href={`/knowledge-base/${topic.slug}`}
                style={{ display: "flex", alignItems: "center", gap: "20px", padding: "20px 24px" }}
              >
                {/* Number */}
                <span style={{ fontSize: "13px", fontFamily: "var(--font-mono)", color: "var(--text-muted)", opacity: 0.5, width: "24px", flexShrink: 0, textAlign: "right" }}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                {/* Icon */}
                <div style={{ width: "38px", height: "38px", borderRadius: "8px", background: `rgba(${rgb}, 0.1)`, border: `1px solid rgba(${rgb}, 0.22)`, display: "flex", alignItems: "center", justifyContent: "center", color: topic.color, flexShrink: 0 }}>
                  <TopicIcon size={16} />
                </div>
                {/* Text */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ fontSize: "15px", fontWeight: 600, color: "var(--text)", display: "block", marginBottom: "4px" }}>{topic.title}</span>
                  <p style={{ fontSize: "13px", color: "var(--text-muted)", margin: 0, lineHeight: 1.5 }}>{topic.description}</p>
                </div>
              </GlowCard>
            );
          })}
        </div>
      </div>
    </PageContainer>
  );
}
