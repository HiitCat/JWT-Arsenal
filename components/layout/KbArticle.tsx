"use client";

import React from "react";
import { KB_TOPICS, LAB_BASE, KbTopic } from "@/lib/kbTopics";
import { PageContainer } from "@/components/layout/PageContainer";
import { Icon } from "@/components/shared/Icons";
import { Link } from "@/components/shared/Link";
import clsx from "clsx";
import s from "@/styles/layout/KbArticle.module.css";

type IconFn = (p: { size?: number }) => React.ReactElement;
const TOPIC_ICONS: Record<string, IconFn> = {
  "jwt-structure":        Icon.Layers,
  "unverified-signature": Icon.Eye,
  "alg-none":             Icon.AlertTriangle,
  "algorithm-confusion":  Icon.Zap,
  "kid-injection":        Icon.Key,
  "jwk-injection":        Icon.FileKey,
  "jku-injection":        Icon.Globe,
  "public-key-recovery":  Icon.Lock,
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
      <div className={s.page}>

        {/* Breadcrumb */}
        <nav className={s.breadcrumb}>
          <Link href="/knowledge-base" variant="unstyled" className={s.breadcrumbLink}>
            <Icon.BookOpen size={12} /> Knowledge Base
          </Link>
          <span className={s.breadcrumbSep}>/</span>
          <span className={s.breadcrumbCurrent}>{topic.title}</span>
        </nav>

        {/* Article header */}
        <div className={s.articleHeader}>
          <div className={s.articleTitleRow}>
            <div style={{
              width: "44px", height: "44px", borderRadius: "10px", flexShrink: 0,
              background: `${topic.color}18`,
              border: `1px solid ${topic.color}35`,
              display: "flex", alignItems: "center", justifyContent: "center",
              color: topic.color,
            }}>
              <TopicIcon size={20} />
            </div>
            <h1 className={s.articleTitle} style={{ color: topic.color }}>{topic.title}</h1>
          </div>
          <p className={s.articleDesc}>{topic.description}</p>
          <div className={s.articleActions}>
            {topic.exploitHref && (
              <Link href={topic.exploitHref} variant="unstyled" className={clsx(s.actionBtn, s.actionBtnAccent)}>
                <Icon.Wand size={11} /> Open exploit tool
              </Link>
            )}
            {topic.labPath && (
              <Link href={`${LAB_BASE}/${topic.labPath}`} variant="unstyled" className={clsx(s.actionBtn, s.actionBtnMuted)}>
                <Icon.FlaskConical size={11} /> {topic.labName}
              </Link>
            )}
          </div>
        </div>

        {/* Article body */}
        <div
          className={clsx("kb-article-body", s.articleBody)}
          style={{ "--topic-color": topic.color } as React.CSSProperties}
        >
          {children}
        </div>

        {/* Prev / Next */}
        <div className={s.nav}>
          {prev ? (() => {
            const PrevIcon = TOPIC_ICONS[prev.slug];
            return (
              <Link
                href={`/knowledge-base/${prev.slug}`}
                variant="unstyled"
                className={s.navLink}
                style={{ background: `${prev.color}0d`, border: `1px solid ${prev.color}35` }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = `${prev.color}70`; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = `${prev.color}35`; }}
              >
                <span className={s.navArrow} style={{ color: prev.color }}>←</span>
                <span className={s.navLinkLabel}>{prev.title}</span>
                {PrevIcon && <span className={s.navIcon} style={{ color: prev.color }}><PrevIcon size={15} /></span>}
              </Link>
            );
          })() : <div className={s.navSpacer} />}

          {next ? (() => {
            const NextIcon = TOPIC_ICONS[next.slug];
            return (
              <Link
                href={`/knowledge-base/${next.slug}`}
                variant="unstyled"
                className={clsx(s.navLink, s.navLinkNext)}
                style={{ background: `${next.color}0d`, border: `1px solid ${next.color}35` }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = `${next.color}70`; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = `${next.color}35`; }}
              >
                {NextIcon && <span className={s.navIcon} style={{ color: next.color }}><NextIcon size={15} /></span>}
                <span className={clsx(s.navLinkLabel, s.navLinkLabelNext)}>{next.title}</span>
                <span className={s.navArrow} style={{ color: next.color }}>→</span>
              </Link>
            );
          })() : <div className={s.navSpacer} />}
        </div>
      </div>
    </PageContainer>
  );
}

export function H2({ children, id }: { children: React.ReactNode; id?: string }) {
  return <h2 id={id} className={s.h2}>{children}</h2>;
}

export function H3({ children, id }: { children: React.ReactNode; id?: string }) {
  return <h3 id={id} className={s.h3}>{children}</h3>;
}

export function P({ children }: { children: React.ReactNode }) {
  return <p className={s.p}>{children}</p>;
}

export function Ref({ href, children }: { href: string; children: React.ReactNode }) {
  return <Link href={href}>{children}</Link>;
}

export function ImpactBox({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className={s.impactBox} style={{ "--list-marker-color": "var(--danger)" } as React.CSSProperties}>
      <div className={s.impactTitle}>
        <Icon.Skull size={13} /> {title}
      </div>
      <div className={s.impactContent}>{children}</div>
    </div>
  );
}
