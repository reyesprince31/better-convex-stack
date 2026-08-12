import { getSessionCookie } from "better-auth/cookies";
import { type NextRequest, NextResponse } from "next/server";

const protectedPrefixes = ["/admin", "/home", "/dashboard"];
const authRoutes = ["/login", "/signup", "/sign-in", "/sign-up"];

function isProtectedPath(pathname: string) {
  return protectedPrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const hasSessionCookie = Boolean(getSessionCookie(request));

  // This is an optimistic redirect only. The protected layout performs the
  // authoritative Better Auth/Convex check before rendering private content.
  if (isProtectedPath(pathname) && !hasSessionCookie) {
    const signInUrl = new URL("/login", request.url);
    signInUrl.searchParams.set("redirect", `${pathname}${search}`);
    return NextResponse.redirect(signInUrl);
  }

  if (authRoutes.includes(pathname) && hasSessionCookie) {
    return NextResponse.redirect(new URL("/home", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/home/:path*",
    "/dashboard/:path*",
    "/login",
    "/signup",
    "/sign-in",
    "/sign-up",
  ],
};
