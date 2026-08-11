<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes - APIs, conventions, and file structure may
all differ from your training data. Before writing Next.js code, read the
relevant guide in `apps/web/node_modules/next/dist/docs/`. Heed deprecation
notices.
<!-- END:nextjs-agent-rules -->


<!-- web-architecture-start -->

# Web App Architecture

- **SaaS Page Multi-Views & Tabs**: Keep feature sub-routes or tab sections (like Profile, Security, Settings under Account) in a single synchronous page. Control the active section via URL search parameters (e.g. `?tab=profile`) inside a `"use client"` island. The client component reading `useSearchParams()` must be wrapped in a `<Suspense>` boundary to prevent Next.js build-time de-optimization.

<!-- web-architecture-end -->

<!-- react19-events-start -->

# React 19 event types

`@types/react` 19 deprecates `FormEvent` and `FormEventHandler` — they were never
real DOM events. Do not use them in new code or when touching existing handlers.

| Handler | Use instead |
|---------|-------------|
| `onSubmit` | `React.SubmitEvent` — `event.target` is typed as `HTMLFormElement` |
| `onChange` (inputs) | `React.ChangeEvent<HTMLInputElement>` (or the matching element) |
| `onInput` | `React.InputEvent` |
| Generic / unknown | `React.SyntheticEvent` |

For `FormData`, read from `event.target` on submit handlers, not
`event.currentTarget` (`SubmitEvent` only narrows `target`).

<!-- react19-events-end -->

<!-- standards-start -->

# Code standards (read first)

This file is the agent and contributor contract. Human-oriented overview:
[README.md](README.md).

| Topic | Document |
|-------|----------|
| Web routing, CRUD UX, SPA loading, auth layers | [docs/APP_ARCHITECTURE_STANDARDS.md](docs/APP_ARCHITECTURE_STANDARDS.md) |
| Reusable selectors, reference data, maintenance pages | [docs/REFERENCE_DATA_STANDARDS.md](docs/REFERENCE_DATA_STANDARDS.md) |
| Better Auth + Convex auth wiring | [docs/AUTH_SETUP.md](docs/AUTH_SETUP.md) |
| Production deploy (Vercel + Convex) | [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) |
| Implementation progress | [docs/TASKLIST.md](docs/TASKLIST.md) |

When standards conflict, prefer the more specific doc for that topic (for
example CRUD patterns in APP_ARCHITECTURE_STANDARDS, deploy steps in
DEPLOYMENT).

<!-- standards-end -->

<!-- convex-ai-start -->

This project uses [Convex](https://convex.dev) as its backend.

When working on Convex code, **always read
`convex/_generated/ai/guidelines.md` first** for important guidelines on
how to correctly use Convex APIs and patterns. The file contains rules that
override what you may have learned about Convex from training data.

Convex agent skills for common tasks can be installed by running
`npx convex ai-files install`.

<!-- convex-ai-end -->
