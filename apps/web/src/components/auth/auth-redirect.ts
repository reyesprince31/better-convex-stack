import type { Route } from "next";

export const DEFAULT_AUTH_REDIRECT = "/home";

export function getSafeRedirect(value: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.includes("\\")) {
    return DEFAULT_AUTH_REDIRECT;
  }

  return value;
}

export function getAuthRouteHref(route: "/login" | "/signup", redirectTo: string): Route {
  if (redirectTo === DEFAULT_AUTH_REDIRECT) return route as Route;

  const params = new URLSearchParams({ redirect: redirectTo });
  return `${route}?${params.toString()}` as Route;
}
