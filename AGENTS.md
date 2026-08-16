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

| Handler             | Use instead                                                        |
| ------------------- | ------------------------------------------------------------------ |
| `onSubmit`          | `React.SubmitEvent` — `event.target` is typed as `HTMLFormElement` |
| `onChange` (inputs) | `React.ChangeEvent<HTMLInputElement>` (or the matching element)    |
| `onInput`           | `React.InputEvent`                                                 |
| Generic / unknown   | `React.SyntheticEvent`                                             |

For `FormData`, read from `event.target` on submit handlers, not
`event.currentTarget` (`SubmitEvent` only narrows `target`).

<!-- react19-events-end -->

<!-- standards-start -->

# Code standards (read first)

This file is the agent and contributor contract. Human-oriented overview:
[README.md](README.md).

| Topic                                                 | Document                                                                 |
| ----------------------------------------------------- | ------------------------------------------------------------------------ |
| Web routing, CRUD UX, SPA loading, auth layers        | [docs/APP_ARCHITECTURE_STANDARDS.md](docs/APP_ARCHITECTURE_STANDARDS.md) |
| Reusable selectors, reference data, maintenance pages | [docs/REFERENCE_DATA_STANDARDS.md](docs/REFERENCE_DATA_STANDARDS.md)     |
| Better Auth + Convex auth wiring                      | [docs/AUTH_SETUP.md](docs/AUTH_SETUP.md)                                 |
| Production deploy (Vercel + Convex)                   | [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)                                 |
| Implementation progress                               | [docs/TASKLIST.md](docs/TASKLIST.md)                                     |

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

Before changing authentication, invitations, organizations, admin functions,
rate limits, audit logs, or destructive Convex mutations, **always read and
follow [docs/CONVEX_AUTH_SECURITY_STANDARDS.md](docs/CONVEX_AUTH_SECURITY_STANDARDS.md)**.
Its completion gate is required for every matching change.

<!-- convex-ai-end -->

<!-- management-dialog-standard-start -->

# Data Management UI Standard

Use the shared `@better-convex-stack/ui/components/dialog` for every flow that
creates, updates, invites, assigns, or removes data. This applies to workspace,
member, organization, admin, and future CRUD surfaces.

- Keep the page, list, and toolbar mounted. Open forms and destructive
  confirmations from stable buttons inside a dialog instead of inserting forms
  into page flow.
- Compose dialogs with `Dialog`, `DialogContent`, `DialogHeader`,
  `DialogTitle`, `DialogDescription`, `DialogFooter`, and `DialogClose`.
- Structure every data-entry dialog as `DialogHeader`, a padded form, and a
  sibling `DialogFooter`. Never nest `DialogFooter` inside a form: a padded form
  plus a padded footer creates a double right/bottom inset. Give the form a
  stable `id` and connect its external submit button with `form="..."`.
- Keep feature containers focused on data orchestration. If a component grows
  beyond roughly 500 lines or owns multiple flows, extract presentation into
  named subcomponent files (for example list, row, loading, and dialog files)
  and move reusable formatting, parsing, and validation helpers into a nearby
  `*-utils.ts` or `*-types.ts` file. The container should compose those pieces,
  not define a second UI system inline.
- Pad form content with `px-5 pt-5 sm:px-6 sm:pt-6`; leave the form bottom
  open so the shared `DialogFooter` owns the single horizontal and bottom inset.
  Keep that footer padding intact. The shared footer owns protected `!px-5
!py-5 sm:!px-6 sm:!py-6` spacing for every dialog. Do not use `p-0`, negative
  margins, or `border-t-0` on a footer unless a deliberate edge-to-edge
  treatment is documented and visually verified.
- Use real native button semantics through the shared `Button` component, and
  use `render` only when a control is intentionally rendered as a link or
  another compatible element.
- Use clear action labels: `New organization`, `Add member`, `Invite member`,
  `Save changes`, and `Remove member`. Avoid internal implementation terms in
  visible copy.
- Keep loading inside the stable shell. Use skeletons that match the final
  geometry and replace only the data region that is still pending.
- After changing a shared dialog or data-management flow, run the UI/web type
  checks, oxlint, and the production web build.

<!-- management-dialog-standard-end -->

<!-- folder-driven-feature-architecture-start -->

# Folder-Driven Feature Architecture

Group feature logic into dedicated domain folders across backend and frontend instead of single monolithic files.

## 1. Backend (`packages/backend/convex/<feature>/`)

Structure each backend feature as a dedicated folder:

- `<feature>/tools.ts` — External tools and integration helpers (Zod schemas).
- `<feature>/threads.ts` (or `queries.ts`/`mutations.ts`) — Database operations with explicit `args` and `returns` validators. Use `.withIndex()` and bound reads (`.take(n)` or `.paginate()`).
- `<feature>/actions.ts` — External API calls and LLM model runs.
- `<feature>/index.ts` — Central domain re-export.
- Keep `convex/<feature>.ts` as a 1-line root re-export (`export * from "./<feature>/index"`) for backward-compatible `api.<feature>.*` calls.

## 2. Frontend (`apps/web/src/components/<feature>/`)

Keep component architecture flat, clean, and beginner-friendly:

- `*-interface.tsx` — Feature page orchestrator (Convex queries/actions, auth session, state).
- Main view panels (e.g. list, window/content, inspector/details).
- `*-types.ts` & `*-utils.ts` — Local domain interfaces and pure formatting helpers.

<!-- folder-driven-feature-architecture-end -->
