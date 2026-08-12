<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Route architecture

- Organize `src/components` by feature instead of keeping a flat component
  directory: `auth`, `admin`, `organization`, `workspace`, `navigation`,
  `account`, `theme`, `providers`, and `shared`. Keep feature-specific
  subcomponents beside the route-facing component they support, and import
  them through their feature path rather than adding a broad barrel file.
- Public pages live under `src/app/(public)` and own the marketing and journal
  surfaces. Authentication pages live under `src/app/(auth)` at `/login` and
  `/signup`; the route group does not appear in URLs.
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
- `WorkspaceSwitcher` is the dedicated workspace-navigation control for the
  organization sidebar header. Keep the account menu focused on identity,
  appearance, account navigation, and sign-out.
- `AppSidebar` and `WorkspaceSidebarLayout` stay Server Components so their
  static navigation links can be included in the first RSC payload. Keep
  pathname, user, theme, and workspace-switching hooks inside their small
  client components (`UserMenu` and `WorkspaceSwitcher`).
- Keep static authentication framing in the server-rendered `AuthPage`; each
  auth route should render its own small client form inside a `Suspense`
  boundary. Keep the login and signup flows as separate routes instead of
  coupling them through a mode switcher. Likewise, do not mark a static parent
  client-only just because it renders a client island such as `ModeToggle`, a
  form, or a provider.
- The `/home/organizations` personal route lists organizations in a table and
  owns the future create-organization action. Keep `/home` itself free of a
  workspace selector.
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
- Treat dynamic route data as request-bound. Never read `params` or
  `searchParams` in the route component body before a `Suspense` boundary.
  Return a static page shell that wraps a child component in `Suspense`, then
  await the child component's `params` or read `useSearchParams()` inside that
  boundary. Apply the same pattern to all `[param]` pages, including public
  invitation and blog routes.
- Keep route pages as Server Components unless an interaction requires a
  client island. Do not add `memo` or `useMemo` without profiling evidence.

## Management UI

- Use the shared `@better-convex-stack/ui/components/dialog` for create, edit,
  invite, and destructive confirmation flows in organization and admin
  management surfaces. Keep the list or page shell mounted while an action is
  open so forms do not create layout shift.
- Keep management containers small and compositional. Move large list rows,
  loading states, and dialog forms into separate named files, and keep helpers
  and shared types in nearby `*-utils.ts` and `*-types.ts` modules. Treat 500
  lines as a refactoring signal rather than adding more conditionals to the
  container.
- Keep `DialogFooter` as a sibling after the padded form, never nested inside
  it. Give the form an `id` and use the external submit button's `form`
  attribute so every dialog has one consistent right and bottom inset.
- Keep data loading inside stable shells. Skeleton rows should match the final
  list geometry, and a pending Better Auth/Convex query should replace only
  the data region that is still loading rather than the whole page heading.
- Prefer plain action labels such as `New organization`, `Add member`,
  `Invite member`, `Save changes`, and `Remove member`. Avoid internal terms
  such as `provision` in user-facing controls.
