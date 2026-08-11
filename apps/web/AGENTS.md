<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Route architecture

- Public pages live under `src/app/(public)` and own their marketing, journal,
  and authentication navigation. The `(public)` group does not appear in URLs.
- Authenticated SaaS pages live under `src/app/(protected)`: `/home` is the
  personal workspace, `/home/[orgSlug]` is an organization workspace, and
  `/admin` is the admin console.
- Keep the personal route group synchronous and header-based in
  `home/(personal)/layout.tsx`. Organization and admin routes each own a
  synchronous sidebar layout backed by the generated shadcn sidebar
  primitives.
- Keep workspace switching in a small client island, and keep route shells,
  loading states, and page content separate. Add a route-local `loading.tsx`
  when a workspace transition needs a shaped skeleton instead of the generic
  protected fallback.
- Mock workspace data lives in `src/lib/mock-workspace.ts`. Keep pages,
  navigation, and resource views consuming that typed boundary so Convex
  queries can replace the loaders later without reshaping the UI.
- The account menu derives admin navigation from the Better Auth user role:
  show the admin console link only for `role === "admin"`, and show a Home
  link while inside `/admin`. This is navigation affordance only; the server
  `requireAdmin` guard remains authoritative.
- `src/proxy.ts` performs an optimistic cookie check for fast redirects only.
  The protected layout and `requireAdmin` helper remain the authoritative
  Better Auth/Convex checks; never rely on proxy alone for authorization.
- Keep `cacheComponents` and `partialPrefetching` enabled in `next.config.ts`.
  Prefer `loading.tsx`, `Suspense`, `use cache`, and prefetched `Link`s for
  instant navigation. `export const instant = false` is an explicit last
  resort, not a default route setting.
- Keep route pages as Server Components unless an interaction requires a
  client island. Do not add `memo` or `useMemo` without profiling evidence.
