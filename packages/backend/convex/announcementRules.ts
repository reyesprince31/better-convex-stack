export const MAX_PATHNAME_LENGTH = 2_048;
export const MAX_ROUTE_PATTERNS = 20;
export const MAX_ROUTE_PATTERN_LENGTH = 256;

export type PlatformRole = "user" | "admin";
export type SubscriptionTier = "free" | "pro" | "enterprise";
export type AnnouncementSurface = "public" | "protected";

function assertPlainPath(value: string, label: string, maxLength: number) {
  const normalized = value.trim();
  if (!normalized || normalized.length > maxLength) {
    throw new Error(`${label} must be between 1 and ${maxLength} characters.`);
  }
  const hasUnsafeCharacter = [...normalized].some((character) => {
    const code = character.charCodeAt(0);
    return (
      character === "\\" || character === "?" || character === "#" || code < 32 || code === 127
    );
  });
  if (!normalized.startsWith("/") || normalized.startsWith("//") || hasUnsafeCharacter) {
    throw new Error(`${label} must be a pathname beginning with "/".`);
  }
  return normalized.length > 1 ? normalized.replace(/\/+$/u, "") : normalized;
}

export function normalizePathname(pathname: string) {
  return assertPlainPath(pathname, "Pathname", MAX_PATHNAME_LENGTH);
}

export function classifyPathSurface(pathname: string): AnnouncementSurface {
  return pathname === "/home" ||
    pathname.startsWith("/home/") ||
    pathname === "/admin" ||
    pathname.startsWith("/admin/")
    ? "protected"
    : "public";
}

export function normalizeRoutePatterns(routePatterns: readonly string[]) {
  if (routePatterns.length === 0 || routePatterns.length > MAX_ROUTE_PATTERNS) {
    throw new Error(`Provide between 1 and ${MAX_ROUTE_PATTERNS} route patterns.`);
  }

  const normalized = routePatterns.map((rawPattern) => {
    const pattern = rawPattern.trim();
    if (pattern === "*") {
      return pattern;
    }

    const wildcardIndex = pattern.indexOf("*");
    if (wildcardIndex !== -1 && wildcardIndex !== pattern.length - 1) {
      throw new Error('A route wildcard is only allowed at the end as "/*".');
    }
    if (wildcardIndex !== -1 && !pattern.endsWith("/*")) {
      throw new Error('A route wildcard must use the "/prefix/*" form.');
    }

    const exactPart = wildcardIndex === -1 ? pattern : pattern.slice(0, -2);
    const normalizedPart = assertPlainPath(
      exactPart,
      "Route pattern",
      MAX_ROUTE_PATTERN_LENGTH - (wildcardIndex === -1 ? 0 : 2),
    );
    if (wildcardIndex !== -1 && normalizedPart === "/") {
      throw new Error('Use "*" instead of "/*".');
    }
    return wildcardIndex === -1 ? normalizedPart : `${normalizedPart}/*`;
  });

  return [...new Set(normalized)];
}

export function routePatternMatches(pathname: string, routePattern: string) {
  if (routePattern === "*") {
    return true;
  }
  if (!routePattern.endsWith("/*")) {
    return pathname === routePattern;
  }

  const prefix = routePattern.slice(0, -2);
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

export function matchesAnnouncementRules(
  announcement: {
    routePatterns: readonly string[];
    targetRoles: readonly PlatformRole[];
    targetTiers: readonly SubscriptionTier[];
    startsAt?: number;
    endsAt?: number;
  },
  viewer: {
    pathname: string;
    now: number;
    role: PlatformRole | null;
    tier: SubscriptionTier | null;
  },
) {
  if (announcement.startsAt !== undefined && viewer.now < announcement.startsAt) {
    return false;
  }
  if (announcement.endsAt !== undefined && viewer.now >= announcement.endsAt) {
    return false;
  }
  if (
    !announcement.routePatterns.some((pattern) => routePatternMatches(viewer.pathname, pattern))
  ) {
    return false;
  }
  if (
    announcement.targetRoles.length > 0 &&
    (viewer.role === null || !announcement.targetRoles.includes(viewer.role))
  ) {
    return false;
  }
  if (
    announcement.targetTiers.length > 0 &&
    (viewer.tier === null || !announcement.targetTiers.includes(viewer.tier))
  ) {
    return false;
  }
  return true;
}
