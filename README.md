# JWT Arsenal

A 100% client-side JWT offensive toolkit for pentesters, bug bounty hunters, and CTF players.

> **Legal**: Use only against systems you have explicit written authorization to test. CTF environments, authorized pentests, and security research only.

## Features

- **Inspect** - Decode any JWT: header, payload, signature, timing claims
- **Unverified Signature** - Forge tokens the server accepts without signature verification
- **Algorithm None** - Strip the signature; test all casing variants (`none`, `None`, `NONE`, `nOnE`)
- **Algorithm Confusion** - RS256 → HS256 using the public key as HMAC secret
- **KID Injection** - Path traversal or SQL injection via the `kid` header
- **JWK Injection** - Embed attacker-controlled public key in the JWT header
- **JKU Injection** - Point `jku` to attacker-controlled JWKS endpoint
- **Public Key Recovery** - CLI guide for `rsa_sign2n` + algorithm confusion workflow
- **CLI Cheatsheet** - Ready-to-paste hashcat, john, jwt_tool commands

All cryptographic operations run in the browser via Web Crypto API. No token, key, or payload is ever transmitted to any server. No analytics, no CDN, no external dependencies at runtime.

## Tech Stack

- Next.js 14 (App Router, `output: 'export'`)
- TypeScript strict
- Tailwind CSS
- Web Crypto API
- `jose`, `lucide-react`, `@fontsource`

## Getting Started

```bash
npm install
npm run dev
# → http://localhost:3000
```

## Build

```bash
npm run build
# Outputs static files to /out
```

## Deploy

### Vercel

Push to GitHub and import the repository in Vercel. No environment variables needed.

### Cloudflare Pages

```bash
npm run build
# Upload the /out directory to Cloudflare Pages
```

### Self-hosted (static)

```bash
npm run build
# Serve the /out directory with any static file server:
npx serve out
```

## Project Structure

```
app/                     # Next.js App Router pages
├── page.tsx             # Home - technique grid
├── inspect/             # JWT decoder
├── exploit/             # 7 exploitation technique pages
│   ├── unverified-signature/
│   ├── alg-none/
│   ├── algorithm-confusion/
│   ├── kid-injection/
│   ├── jwk-injection/
│   ├── jku-injection/
│   └── public-key-recovery/
├── cheatsheet/          # CLI command reference
└── about/               # Legal disclaimer + credits

lib/                     # Cryptographic utilities
├── jwt.ts               # Encode/decode/forge helpers
├── crypto.ts            # Web Crypto API wrappers (RSA, HMAC)
├── pem.ts               # PEM parsing/validation
└── jwk.ts               # JWK helpers + JWKS generation

components/
├── layout/              # Sidebar, PageContainer, ExploitLayout
├── jwt/                 # JwtInput, JwtOutput, PayloadEditor, KeyInput
└── shared/              # CodeBlock, InfoCallout, StepCard
```

## No Secrets

The project contains no `.env` file, no API keys, no secrets of any kind. All operations are client-side.
