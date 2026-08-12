# Convex + Better Auth Security Standard

Apply every rule in this document when changing authentication, invitations,
organizations, admin functions, rate limits, audit logs, or destructive Convex
mutations.

## Identity and deployment configuration

- Declare required backend environment variables with validators in
  `packages/backend/convex/convex.config.ts` and read them through the generated `env` export.
  Keep secret values out of the repository. Production origins use HTTPS; only
  local development may use HTTP.
- Configure Better Auth security settings explicitly: `secret`, `baseURL`,
  `trustedOrigins`, finite session lifetime/refresh/freshness, email
  verification, and rate limits. Library defaults are not a security boundary.
- Require verified email for email/password access and organization invitation
  acceptance. Resolve invitation access from the authenticated user's verified
  server-side email. Client-provided email or organization-ID arrays are not
  authorization scope.
- Deliver verification and invitation emails through a configured service and
  fail closed when delivery is unavailable. After signup, direct the user to
  verify their email before continuing.
- Return allowlisted user fields from public functions. Keep tokens, provider
  data, and other Better Auth records server-side.

## Layered abuse controls

- Keep Better Auth's HTTP limiter enabled with database-backed storage and
  stricter route rules for sign-in, signup, password changes, account deletion,
  and invitations.
- Protect Convex mutations and server-side `auth.api` calls with the
  `@convex-dev/rate-limiter` component when they can bypass Better Auth's HTTP
  limiter. Key limits from trusted authenticated identity and apply them before
  expensive or security-sensitive work.
- Convex mutations are atomic: limiter writes and audit inserts roll back when
  the handler later throws. When a denied attempt must consume quota, catch the
  expected failure, record it, and return a structured unsuccessful result; let
  the client present the error.
- Require an authoritative fresh session for destructive custom admin actions,
  membership removal, role changes, and user deletion. Disable cookie-cache and
  refresh shortcuts during that check. Freshness supplements authorization and
  never replaces it.
- Register new Convex components in `convex.config.ts`, run Convex codegen
  against the declared development deployment, inspect the generated delta,
  and commit the generated bindings with the feature.

## Authorization, bounds, and auditability

- Every public Convex function defines explicit argument and return validators.
  Use literal validators for finite roles and states, and stable `ConvexError`
  codes for expected client-facing failures.
- Derive accessible organizations and resources from authenticated server-side
  memberships. Deduplicate IDs before fan-out, use indexes and strict `.take()`
  caps, and keep `Promise.all` inputs bounded. Request paths do not use
  unbounded `.collect()`.
- Bound every collection involved in destructive work with `take(limit + 1)`.
  Reject oversized inline work before the mutation commits and move it to an
  internal paginated or scheduled workflow.
- Append allowlisted audit events in the same mutation as sensitive writes.
  Record action, trusted actor ID, target ID, and timestamp. Exclude passwords,
  tokens, secrets, and raw request bodies. Index audit reads by actor or action
  plus time, and expose no public mutation that rewrites history.

## Completion gate

1. Run Convex codegen when schemas, components, environment contracts, or
   function signatures changed. Use the declared development deployment,
   inspect the generated delta, and do not mutate production without explicit
   authorization.
2. Run backend and web type checks, oxlint, and the production web build. The
   change is incomplete until every check exits successfully.
3. Before production deployment, verify required Convex environment variables,
   the HTTPS site origin, and the authentication email delivery path through the
   launch-readiness process before using the production deployment workflow.
