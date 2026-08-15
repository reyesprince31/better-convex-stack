# Contributing to Better Convex Stack

Thank you for your interest in contributing to **Better Convex Stack**! This project is an open-source, production-ready full-stack template combining Next.js, Convex, Better-Auth, Cloudflare R2, and a shared Turborepo UI design system.

We welcome contributions of all kinds: bug fixes, feature proposals, documentation improvements, and UI enhancements.

---

## Quick Navigation

- [Development Prerequisites](#development-prerequisites)
- [Local Setup](#local-setup)
- [Monorepo Architecture](#monorepo-architecture)
- [Development Workflow & Stacked PRs](#development-workflow--stacked-prs)
- [Code Standards & Conventions](#code-standards--conventions)
- [Verification Checklist](#verification-checklist)
- [Reporting Issues](#reporting-issues)

---

## Development Prerequisites

- **Node.js**: `v20.x` or later (LTS recommended)
- **pnpm**: `v10.x` or later (`npm install -g pnpm`)
- **GitHub CLI**: `gh` (`winget install GitHub.cli` or `brew install gh`) with `gh stack` extension

---

## Local Setup

1. **Fork and clone the repository**:

   ```bash
   git clone https://github.com/<your-username>/better-convex-stack.git
   cd better-convex-stack
   ```

2. **Install dependencies**:

   ```bash
   pnpm install
   ```

3. **Initialize Convex Backend**:

   ```bash
   pnpm run dev:setup
   ```

   Follow the prompts to log in to Convex and configure your development deployment.

4. **Configure Environment Variables**:
   Copy `.env.example` to `.env` in `apps/web`:

   ```bash
   cp apps/web/.env.example apps/web/.env
   ```

   _(Optional: For Cloudflare R2 file uploads)_, set your R2 credentials in Convex:

   ```bash
   npx convex env set R2_BUCKET <bucket-name>
   npx convex env set R2_TOKEN <api-token>
   npx convex env set R2_ACCESS_KEY_ID <access-key>
   npx convex env set R2_SECRET_ACCESS_KEY <secret-key>
   npx convex env set R2_ENDPOINT https://<account-id>.r2.cloudflarestorage.com
   ```

5. **Start the development server**:
   ```bash
   pnpm run dev
   ```
   Open [http://localhost:3001](http://localhost:3001) in your browser.

---

## Monorepo Architecture

```
better-convex-stack/
├── apps/
│   ├── web/               # Next.js 16 web application (App Router, Turbopack)
│   └── fumadocs/          # Documentation portal
├── packages/
│   ├── backend/           # Convex functions, schema, components & Better Auth
│   ├── ui/                # Shared shadcn/ui primitives and design system tokens
│   ├── env/               # Shared type-safe environment variable schema
│   └── config/            # Shared TypeScript & tool configurations
└── docs/                  # Architecture, deployment, and security standards
```

---

## Development Workflow & Stacked PRs

We follow a **stacked PR workflow** using [`gh stack`](https://github.com/github/gh-stack) to keep pull requests atomic, easy to review, and safely decoupled.

### 1. Create a Stacked Feature Branch

```bash
# Add a new branch on top of the current stack
gh stack add feat/my-awesome-feature
```

### 2. Make Atomic Commits

Keep commits focused and well-scoped using conventional commit prefixes:

- `feat(...)`: New user-facing feature or backend capability
- `fix(...)`: Bug fix
- `refactor(...)`: Code restructuring without behavioral change
- `style(...)`: Formatting or UI polish
- `docs(...)`: Documentation updates

```bash
git commit -m "feat(backend): add organization webhook listener"
```

### 3. Submit PR Stack

```bash
gh stack submit
```

---

## Code Standards & Conventions

### 1. React 19 Event Types

In React 19 / `@types/react` 19, `FormEvent` is deprecated:

- Use `React.SubmitEvent` for form submission handlers.
- Read form data from `event.target` (typed as `HTMLFormElement`).
- Use `React.ChangeEvent<HTMLInputElement>` for input changes.

### 2. Management Dialog Standard

All CRUD creation, editing, invitation, and removal flows must use the shared `@better-convex-stack/ui/components/dialog`:

- Keep the page and list views mounted; open flows inside dialogs.
- Dialog structure: `DialogHeader`, padded form (`px-5 pt-5 sm:px-6 sm:pt-6`), and sibling `DialogFooter` with external submit button connected via `form="form-id"`.

### 3. Convex Auth & Security

- Never trust client-supplied user IDs or admin flags.
- Always resolve the current user on the backend with `authComponent.safeGetAuthUser(ctx)`.
- Always verify permissions before mutating user or organization records.
- See [docs/CONVEX_AUTH_SECURITY_STANDARDS.md](docs/CONVEX_AUTH_SECURITY_STANDARDS.md) for full security rules.

---

## Verification Checklist

Before submitting your pull request, run the verification suite locally:

```bash
# 1. Type check all packages
pnpm run check-types

# 2. Lint & format checks (Oxlint & Oxfmt)
pnpm run check

# 3. Production build test
pnpm run build
```

---

## Reporting Issues

- **Bug Reports**: Open an issue on GitHub describing the bug, reproduction steps, and screenshots or logs if applicable.
- **Feature Requests**: Open a discussion or issue explaining the use case and proposed developer UX.

Thank you for helping make Better Convex Stack better for everyone! 🚀
