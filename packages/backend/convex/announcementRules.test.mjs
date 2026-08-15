import assert from "node:assert/strict";
import test from "node:test";

import {
  classifyPathSurface,
  matchesAnnouncementRules,
  normalizeRoutePatterns,
  routePatternMatches,
} from "./announcementRules.ts";

test("route surfaces keep global patterns inside their public or protected shell", () => {
  assert.equal(classifyPathSurface("/"), "public");
  assert.equal(classifyPathSurface("/pricing"), "public");
  assert.equal(classifyPathSurface("/home"), "protected");
  assert.equal(classifyPathSurface("/home/settings"), "protected");
  assert.equal(classifyPathSurface("/admin"), "protected");
  assert.equal(classifyPathSurface("/admin/users"), "protected");
  assert.equal(routePatternMatches("/admin/users", "*"), true);
  assert.equal(
    classifyPathSurface("/admin/users") === "public" && routePatternMatches("/admin/users", "*"),
    false,
  );
  assert.equal(classifyPathSurface("/") === "protected" && routePatternMatches("/", "*"), false);
});

test("route patterns distinguish exact, global, and bounded prefixes", () => {
  assert.equal(routePatternMatches("/", "/"), true);
  assert.equal(routePatternMatches("/pricing", "*"), true);
  assert.equal(routePatternMatches("/docs", "/docs/*"), true);
  assert.equal(routePatternMatches("/docs/api", "/docs/*"), true);
  assert.equal(routePatternMatches("/docs-old", "/docs/*"), false);
  assert.deepEqual(normalizeRoutePatterns(["/docs/", "/docs", "/docs/*"]), ["/docs", "/docs/*"]);
});

test("audience and time rules require every configured constraint", () => {
  const announcement = {
    routePatterns: ["/app/*"],
    targetRoles: ["admin"],
    targetTiers: ["pro"],
    startsAt: 1_000,
    endsAt: 2_000,
  };

  assert.equal(
    matchesAnnouncementRules(announcement, {
      pathname: "/app/settings",
      now: 1_500,
      role: "admin",
      tier: "pro",
    }),
    true,
  );
  assert.equal(
    matchesAnnouncementRules(announcement, {
      pathname: "/app/settings",
      now: 2_000,
      role: "admin",
      tier: "pro",
    }),
    false,
  );
  assert.equal(
    matchesAnnouncementRules(announcement, {
      pathname: "/app/settings",
      now: 1_500,
      role: "user",
      tier: "pro",
    }),
    false,
  );
});
