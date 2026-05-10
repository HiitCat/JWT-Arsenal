<div align="center">

<img src="public/logo.svg" alt="JWT Arsenal Logo" width="72" />

# JWT Arsenal

**The open-source JWT exploitation toolkit - built for the browser.**

[![Live](https://img.shields.io/badge/live-jwtarsenal.com-84cc16?style=flat-square&logo=cloudflare&logoColor=white)](https://jwtarsenal.com)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![License](https://img.shields.io/badge/license-MIT-a78bfa?style=flat-square)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-06b6d4?style=flat-square)](CONTRIBUTING.md)

Forge, inspect, and exploit JWT vulnerabilities **entirely in your browser**.  
No backend. No data leaves your machine. No setup required.

**[→ Open the app](https://jwtarsenal.com)** · [Knowledge Base](https://jwtarsenal.com/knowledge-base) · [Cheatsheet](https://jwtarsenal.com/cheatsheet)

</div>

---

## 🎯 What is JWT Arsenal?

JWT Arsenal is a client-side security toolkit for **pentesters**, **CTF players**, and **bug bounty hunters** who need to test JWT implementations - fast. Every cryptographic operation runs locally in your browser using the Web Crypto API and [jose](https://github.com/panva/jose). Nothing is ever sent to a server.

The project also ships a **Knowledge Base** with deep technical articles on each attack - RFC references, vulnerable code patterns, real-world bug bounty examples, and mitigations - so you understand the attack, not just the button that fires it.

---

## ✨ Features

### 🔍 JWT Inspector
Paste any token for an instant breakdown - decoded header, payload, raw signature bytes, algorithm info, and expiration status. Your first stop on any JWT engagement.

### ⚔️ Exploit Tools

| Tool | Attack |
|------|--------|
| 🔓 **Unverified Signature** | Server decodes the token but never verifies the signature |
| 🚫 **Algorithm None** | Strip the signature using `alg: "none"` - all casing variants tested |
| ⚡ **Algorithm Confusion** | Switch RS256 → HS256, sign with the public key as HMAC secret |
| 🔑 **KID Injection** | Path traversal, SQL injection, and null-byte payloads via the `kid` header |
| 📄 **JWK Injection** | Embed your own RSA public key in the JWT header |
| 🌐 **JKU Injection** | Point `jku` to an attacker-controlled JWKS endpoint |
| 🔬 **Public Key Recovery** | Recover RSA keys from two signatures via GCD, chain to algorithm confusion |

### 📚 Knowledge Base
8 in-depth technical articles - from the JOSE RFC family to real PortSwigger Research findings - with working code examples in Python and JavaScript.

### 📋 CLI Cheatsheet
Ready-to-copy commands for `hashcat` (GPU cracking), `jwt_tool`, `rsa_sign2n`, and Python snippets for operations too compute-heavy for the browser.

---

## 🔒 Privacy First

- **Zero backend** - static export served from a CDN, no server-side code
- **Zero telemetry** - no analytics SDK, no event tracking, no fingerprinting
- **Zero network calls at runtime** - all crypto runs via the browser's native Web Crypto API
- Safely paste real tokens from live engagements without worrying about logs

---

## 🚀 Getting Started

### Prerequisites

- Node.js ≥ 20
- npm ≥ 9

### Run locally

```bash
# Clone the repo
git clone https://github.com/your-username/jwt-arsenal.git
cd jwt-arsenal

# Install dependencies
npm install

# Start the dev server
npm run dev
# → http://localhost:3000
```

### Build for production

```bash
npm run build
# Static output is generated in ./out
# Deploy the ./out folder anywhere - no server needed
```

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | [Next.js 16](https://nextjs.org) - App Router, `output: 'export'` |
| **Language** | TypeScript 5 (strict mode) |
| **Crypto** | [jose](https://github.com/panva/jose) + native Web Crypto API |
| **UI** | Radix UI primitives + custom design system |
| **Fonts** | Inter + JetBrains Mono (self-hosted via Fontsource) |
| **Hosting** | Cloudflare Pages |

No backend framework. No database. No secrets. Nothing to maintain server-side.

---

## 📁 Project Structure

```
jwt-arsenal/
├── app/
│   ├── page.tsx               # Homepage - technique grid
│   ├── inspect/               # JWT inspector
│   ├── exploit/               # Exploit tool pages (one per attack)
│   │   ├── alg-none/
│   │   ├── algorithm-confusion/
│   │   ├── jku-injection/
│   │   ├── jwk-injection/
│   │   ├── kid-injection/
│   │   ├── public-key-recovery/
│   │   └── unverified-signature/
│   ├── knowledge-base/        # Technical articles (8 topics)
│   ├── cheatsheet/            # CLI command reference
│   └── about/                 # Legal + project info
│
├── components/
│   ├── layout/                # Sidebar, KbArticle, PageLoader, GithubFab…
│   ├── jwt/                   # JwtInput, JwtOutput, PayloadEditor, KeyInput
│   └── shared/                # GlowCard, CodeBlock, Icons, InfoCallout…
│
└── lib/
    ├── crypto.ts              # RSA/HMAC/ECDSA browser crypto wrappers
    ├── jwt.ts                 # JWT encode/decode/forge helpers
    ├── kbTopics.ts            # Knowledge Base metadata
    └── seo.ts                 # pageMeta() helper + site constants
```

---

## 🤝 Contributing

Contributions are welcome - new exploit modules, knowledge base articles, bug fixes, UI improvements, translations. All are appreciated.

### How to contribute

1. **Fork** the repository and clone it locally
2. Create a **feature branch**: `git checkout -b feat/my-improvement`
3. Make your changes and verify the build: `npm run build`
4. Open a **Pull Request** with a clear description of what you changed and why

### Adding a new exploit tool

1. Create `app/exploit/<slug>/page.tsx` - use `ExploitLayout` as the wrapper
2. Add a `layout.tsx` in the same folder exporting `metadata` via `pageMeta()`
3. Register the route in `app/sitemap.ts`
4. Optionally write a Knowledge Base article in `app/knowledge-base/<slug>/page.tsx`

### Adding a Knowledge Base article

1. Add the topic metadata to `lib/kbTopics.ts` (title, description, color, tags…)
2. Create `app/knowledge-base/<slug>/page.tsx` using `KbArticle`, `H2`, `P`, `CodeBlock`
3. Export `metadata` via `pageMeta()` at the top of the file

---

## 🗺️ Roadmap

The project is actively maintained. Planned additions:

- [ ] ES256 / ECDSA support across all exploit tools
- [ ] Token history - persist inspected tokens in `localStorage`
- [ ] One-click ephemeral JWKS server for JKU testing (via a serverless function)
- [ ] Batch mode - test multiple tokens in a single pass
- [ ] Dark / light theme toggle
- [ ] Additional KB articles - `x5u`, `x5c`, JWT confusion chains, ECDSA nonce reuse
- [ ] Translations - French 🇫🇷

Have an idea? [Open an issue](https://github.com/your-username/jwt-arsenal/issues) - all suggestions are welcome.

---

## ⚠️ Legal Disclaimer

JWT Arsenal is designed for **authorized security testing, CTF competitions, and educational use only**.  
Do not use this tool against systems you do not own or have explicit written permission to test.  
The authors accept no liability for misuse. See [about](https://jwtarsenal.com/about) for the full disclaimer.

---

## 📄 License

[MIT](LICENSE) - free to use, modify, and distribute.

---

<div align="center">

Built with 🧪 for the security community.

If JWT Arsenal saved you time on an engagement or CTF, consider starring the repo - it helps others find the project. ⭐

</div>
