"use client";
import React, { useId } from "react";
import { ReactNode } from "react";

type P = { size?: number; stroke?: number };

const B = ({ children, size = 16, stroke = 2 }: P & { children: ReactNode }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={stroke}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {children}
  </svg>
);

export const Icon = {
  Logo: function LogoSphere({ size = 22 }: { size?: number }) {
    const uid = useId().replace(/:/g, "-");
    const clip = `${uid}c`, body = `${uid}b`, band = `${uid}bd`, gloss = `${uid}g`, rim = `${uid}r`;
    return (
      <svg width={size} height={size} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <clipPath id={clip}><circle cx="50" cy="50" r="48"/></clipPath>
          <radialGradient id={body} cx="36%" cy="28%" r="70%" gradientUnits="objectBoundingBox">
            <stop offset="0%" stopColor="#cef060"/>
            <stop offset="22%" stopColor="#86cc12"/>
            <stop offset="58%" stopColor="#3a7a00"/>
            <stop offset="100%" stopColor="#163500"/>
          </radialGradient>
          <linearGradient id={band} x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#9ed800" stopOpacity="0.8"/>
            <stop offset="35%" stopColor="#ccf000"/>
            <stop offset="65%" stopColor="#c4ea00"/>
            <stop offset="100%" stopColor="#8ec800" stopOpacity="0.65"/>
          </linearGradient>
          <radialGradient id={gloss} cx="34%" cy="27%" r="40%">
            <stop offset="0%" stopColor="white" stopOpacity="0.72"/>
            <stop offset="45%" stopColor="white" stopOpacity="0.16"/>
            <stop offset="100%" stopColor="white" stopOpacity="0"/>
          </radialGradient>
          <radialGradient id={rim} cx="50%" cy="50%" r="50%">
            <stop offset="64%" stopColor="black" stopOpacity="0"/>
            <stop offset="100%" stopColor="black" stopOpacity="0.42"/>
          </radialGradient>
        </defs>
        <circle cx="50" cy="50" r="48" fill={`url(#${body})`}/>
        <path clipPath={`url(#${clip})`} d="M -4 74 C 8 62 26 55 44 48 C 58 42 72 34 100 28 L 104 50 C 76 56 62 63 48 70 C 28 79 10 85 -4 92 Z" fill={`url(#${band})`}/>
        <circle cx="50" cy="50" r="48" fill={`url(#${gloss})`} clipPath={`url(#${clip})`}/>
        <circle cx="50" cy="50" r="48" fill={`url(#${rim})`} clipPath={`url(#${clip})`}/>
      </svg>
    );
  },
  Copy:          (p: P) => <B {...p}><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></B>,
  Check:         (p: P) => <B {...p}><path d="M20 6 9 17l-5-5"/></B>,
  Send:          (p: P) => <B {...p}><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></B>,
  Zap:           (p: P) => <B {...p}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></B>,
  Key:           (p: P) => <B {...p}><circle cx="7.5" cy="15.5" r="5.5"/><path d="m21 2-9.6 9.6"/><path d="m15.5 7.5 3 3L22 7l-3-3"/></B>,
  Lock:          (p: P) => <B {...p}><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></B>,
  Unlock:        (p: P) => <B {...p}><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/></B>,
  Shield:        (p: P) => <B {...p}><path d="M20 13c0 5-3.5 7.5-8 9-4.5-1.5-8-4-8-9V5l8-3 8 3z"/></B>,
  Skull:         (p: P) => <B {...p}><circle cx="9" cy="12" r="1"/><circle cx="15" cy="12" r="1"/><path d="M8 20v2h8v-2"/><path d="M12.5 17l-.5-1-.5 1h1z"/><path d="M16 20a2 2 0 0 0 1.56-3.25 8 8 0 1 0-11.12 0A2 2 0 0 0 8 20"/></B>,
  Github:        (p: P) => <B {...p}><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/></B>,
  Search:        (p: P) => <B {...p}><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></B>,
  ChevronRight:  (p: P) => <B {...p}><path d="m9 18 6-6-6-6"/></B>,
  ChevronDown:   (p: P) => <B {...p}><path d="m6 9 6 6 6-6"/></B>,
  ArrowRight:    (p: P) => <B {...p}><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></B>,
  Terminal:      (p: P) => <B {...p}><polyline points="4 17 10 11 4 5"/><line x1="12" x2="20" y1="19" y2="19"/></B>,
  Code:          (p: P) => <B {...p}><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></B>,
  AlertTriangle: (p: P) => <B {...p}><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></B>,
  Info:          (p: P) => <B {...p}><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></B>,
  Hash:          (p: P) => <B {...p}><line x1="4" x2="20" y1="9" y2="9"/><line x1="4" x2="20" y1="15" y2="15"/><line x1="10" x2="8" y1="3" y2="21"/><line x1="16" x2="14" y1="3" y2="21"/></B>,
  Link:          (p: P) => <B {...p}><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></B>,
  Wand:          (p: P) => <B {...p}><path d="M15 4V2"/><path d="M15 16v-2"/><path d="M8 9h2"/><path d="M20 9h2"/><path d="M17.8 11.8 19 13"/><path d="M15 9h.01"/><path d="M17.8 6.2 19 5"/><path d="m3 21 9-9"/><path d="M12.2 6.2 11 5"/></B>,
  BookOpen:      (p: P) => <B {...p}><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></B>,
  CheckCircle:   (p: P) => <B {...p}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></B>,
  XCircle:       (p: P) => <B {...p}><circle cx="12" cy="12" r="10"/><line x1="15" x2="9" y1="9" y2="15"/><line x1="9" x2="15" y1="9" y2="15"/></B>,
  Eye:           (p: P) => <B {...p}><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></B>,
  Sparkles:      (p: P) => <B {...p}><path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3z"/></B>,
  Layers:        (p: P) => <B {...p}><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></B>,
  GitBranch:     (p: P) => <B {...p}><line x1="6" x2="6" y1="3" y2="15"/><circle cx="18" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M18 9a9 9 0 0 1-9 9"/></B>,
  Download:      (p: P) => <B {...p}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></B>,
  Refresh:       (p: P) => <B {...p}><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M3 21v-5h5"/></B>,
  Menu:          (p: P) => <B {...p}><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></B>,
  X:             (p: P) => <B {...p}><path d="M18 6 6 18"/><path d="m6 6 12 12"/></B>,
  Cloud:         (p: P) => <B {...p}><path d="M17.5 19a4.5 4.5 0 1 0 0-9h-1.8A7 7 0 1 0 4 15.7"/></B>,
  Boxes:         (p: P) => <B {...p}><path d="M2.97 12.92A2 2 0 0 0 2 14.63v3.24a2 2 0 0 0 .97 1.71l3 1.8a2 2 0 0 0 2.06 0L12 19v-5.5l-5-3-4.03 2.42Z"/><path d="m7 16.5-4.74-2.85"/><path d="m7 16.5 5-3"/><path d="M7 16.5v5.17"/><path d="M12 13.5V19l3.97 2.38a2 2 0 0 0 2.06 0l3-1.8a2 2 0 0 0 .97-1.71v-3.24a2 2 0 0 0-.97-1.71L17 10.5l-5 3Z"/><path d="m17 16.5-5-3"/><path d="m17 16.5 4.74-2.85"/><path d="M17 16.5v5.17"/><path d="M7.97 4.42A2 2 0 0 0 7 6.13v4.37l5 3 5-3V6.13a2 2 0 0 0-.97-1.71l-3-1.8a2 2 0 0 0-2.06 0l-3 1.8Z"/><path d="M12 8 7.26 5.15"/><path d="m12 8 4.74-2.85"/><path d="M12 13.5V8"/></B>,
  Filter:        (p: P) => <B {...p}><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></B>,
  FileKey:       (p: P) => <B {...p}><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><circle cx="10" cy="16" r="2"/><path d="m16 10-4.5 4.5"/><path d="m15 11 1 1"/></B>,
  Globe:         (p: P) => <B {...p}><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></B>,
  ExternalLink:  (p: P) => <B {...p}><path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/></B>,
  FlaskConical:  (p: P) => <B {...p}><path d="M14 2v6l3 9a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1l3-9V2"/><path d="M6 2h12"/></B>,
};
