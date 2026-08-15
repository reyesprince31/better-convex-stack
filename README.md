<div align="center">

# ⚡ Better Convex Stack

**The modern, production-ready SaaS template built with Next.js 16, Convex, Better Auth, and Cloudflare R2.**

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat&logo=next.js)](https://nextjs.org/)
[![Convex](https://img.shields.io/badge/Convex-1.44-ff4f00?style=flat&logo=convex)](https://convex.dev/)
[![Better Auth](https://img.shields.io/badge/Better_Auth-Latest-blue?style=flat)](https://better-auth.com/)
[![Cloudflare R2](https://img.shields.io/badge/Cloudflare_R2-Storage-F38020?style=flat&logo=cloudflare)](https://developers.cloudflare.com/r2/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Oxlint](https://img.shields.io/badge/Linted_with-Oxlint-cyan?style=flat)](https://oxc.rs/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

</div>

---

## 🌟 Overview

**Better Convex Stack** is a full-stack, open-source boilerplate engineered for developers who want to launch production-grade, real-time web applications and SaaS platforms without rebuilding authentication, multi-tenancy, storage, or admin control rooms from scratch.

---

## 🚀 Key Features

- **⚡ Next.js 16 (App Router & Turbopack)**: Blazing-fast page loads with Partial Prerendering (PPR), React Server Components, and optimized client islands.
- **🔥 Convex Reactive Backend**: Real-time subscriptions, end-to-end type safety, server functions, scheduled crons, and modular components.
- **🔐 Better Auth + Convex Adapter**: Complete authentication suite with email/password, social logins, session management, and organization multi-tenancy.
- **📦 Cloudflare R2 Storage (`@convex-dev/r2`)**: Direct-to-storage presigned uploads with zero egress fees, reactive metadata syncing, and automatic orphan file cleanup.
- **🏢 Multi-Tenant Workspaces & RBAC**: Organization switching, team invitations, member management, and granular permission roles.
- **👑 Admin Console & User Entitlements**: Built-in control room for managing users, updating subscription tiers (`free`, `pro`, `enterprise`), publishing announcement banners, and viewing system health.
- **🎨 Shared UI Design System (`@better-convex-stack/ui`)**: Modular Turborepo UI workspace powered by shadcn/ui and Tailwind CSS with crisp Orbit design language and light/dark theme support.
- **🏎️ Ultra-Fast Tooling**: Turborepo task pipeline with [Oxlint](https://oxc.rs/) and [Oxfmt](https://oxc.rs/) for sub-second type checking, linting, and formatting.

---

## 🏗️ Monorepo Structure

```
better-convex-stack/
├── apps/
│   ├── web/                     # Next.js 16 web application
│   └── fumadocs/                # Documentation & knowledge base
├── packages/
│   ├── backend/                 # Convex backend schema, mutations, queries & R2
│   ├── ui/                      # Shared shadcn/ui components, dialogs, avatars
│   ├── env/                     # Shared type-safe environment schema
│   └── config/                  # Shared ESLint/Oxlint, Prettier, TypeScript configs
└── docs/                        # Architecture guides, deployment, and security standards
```

---

## ⚡ Quick Start

### 1. Prerequisites

- **Node.js**: `v20.x` or later
- **pnpm**: `v10.x` or later (`npm install -g pnpm`)

### 2. Clone & Install

```bash
git clone https://github.com/reyesprince31/better-convex-stack.git
cd better-convex-stack
pnpm install
```

### 3. Initialize Convex Backend

```bash
pnpm run dev:setup
```

This command initializes your Convex development deployment and generates backend types automatically.

### 4. Configure Environment Variables

Copy `.env.example` in `apps/web`:

```bash
cp apps/web/.env.example apps/web/.env
```

_(Optional: Cloudflare R2)_ — To enable cloud file storage, set your R2 credentials in Convex:

```bash
npx convex env set R2_BUCKET <bucket-name>
npx convex env set R2_TOKEN <cloudflare-api-token>
npx convex env set R2_ACCESS_KEY_ID <access-key>
npx convex env set R2_SECRET_ACCESS_KEY <secret-key>
npx convex env set R2_ENDPOINT https://<account-id>.r2.cloudflarestorage.com
```

### 5. Start Developing

```bash
pnpm run dev
```

Open [http://localhost:3001](http://localhost:3001) in your browser.

---

## 🛠️ Available Scripts

| Command                | Description                                           |
| :--------------------- | :---------------------------------------------------- |
| `pnpm run dev`         | Starts Next.js and Convex concurrently                |
| `pnpm run dev:web`     | Runs the Next.js web application only                 |
| `pnpm run dev:setup`   | Initializes and connects a new Convex backend project |
| `pnpm run check-types` | Type-checks all monorepo packages across Turbo cache  |
| `pnpm run check`       | Runs Oxlint and Oxfmt across all files                |
| `pnpm run build`       | Builds production bundles for all apps                |

---

## 🤝 Contributing & Collaborators

We welcome contributions from the community! Check out our [**Contributing Guide (CONTRIBUTING.md)**](CONTRIBUTING.md) for details on:

- Monorepo development guidelines
- Stacked PR workflow with `gh stack`
- React 19 event types & management dialog conventions
- Convex Auth & security standards

---

## 📄 License

Distributed under the **MIT License**. See [LICENSE](LICENSE) for more information.
