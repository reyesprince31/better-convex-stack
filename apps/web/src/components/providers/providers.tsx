"use client";

import { env } from "@better-convex-stack/env/web";
import { Toaster } from "@better-convex-stack/ui/components/sonner";
import { TooltipProvider } from "@better-convex-stack/ui/components/tooltip";
import { ConvexBetterAuthProvider, type AuthClient } from "@convex-dev/better-auth/react";
import { ConvexReactClient } from "convex/react";

import { authClient } from "@/lib/auth-client";

import { ThemeProvider } from "@/components/theme/theme-provider";

const convex = new ConvexReactClient(env.NEXT_PUBLIC_CONVEX_URL);

export default function Providers({
  children,
  initialToken,
}: {
  children: React.ReactNode;
  initialToken?: string | null;
}) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <TooltipProvider>
        <ConvexBetterAuthProvider
          client={convex}
          // Convex's provider type only models its core plugin set; the runtime
          // client also includes Better Auth's organization and admin plugins.
          authClient={authClient as unknown as AuthClient}
          initialToken={initialToken}
        >
          {children}
        </ConvexBetterAuthProvider>
      </TooltipProvider>
      <Toaster richColors />
    </ThemeProvider>
  );
}
