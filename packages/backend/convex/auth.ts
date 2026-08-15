import { createClient, type GenericCtx } from "@convex-dev/better-auth";
import { convex } from "@convex-dev/better-auth/plugins";
import { admin } from "better-auth/plugins/admin";
import { betterAuth } from "better-auth";
import { organization } from "better-auth/plugins/organization";
import { v } from "convex/values";

import { components } from "./_generated/api";
import type { DataModel } from "./_generated/dataModel";
import { env, query } from "./_generated/server";
import authConfig from "./auth.config";
import authSchema from "./betterAuth/schema";

function getSiteUrl() {
  // Convex module analysis and Better Auth schema generation do not expose
  // deployment environment variables. The app config still requires SITE_URL
  // before any deployment can accept this code.
  const value = env.SITE_URL ?? "http://localhost:3001";

  const url = new URL(value);
  const isLocalhost = url.hostname === "localhost" || url.hostname === "127.0.0.1";
  if (url.protocol !== "https:" && !isLocalhost) {
    throw new Error("SITE_URL must use HTTPS outside local development.");
  }

  return url.origin;
}

const siteUrl = getSiteUrl();

import {
  sendInvitationEmail as sendResendInvitationEmail,
  sendPasswordResetEmail as sendResendPasswordResetEmail,
  sendVerificationEmail as sendResendVerificationEmail,
} from "./resend";

function getInvitationUrl(invitationId: string) {
  const url = new URL("/accept-invitation", siteUrl);
  url.searchParams.set("id", invitationId);
  return url.toString();
}

const currentUserValidator = v.union(
  v.object({
    id: v.string(),
    name: v.string(),
    email: v.string(),
    emailVerified: v.boolean(),
    image: v.union(v.string(), v.null()),
    role: v.union(v.string(), v.null()),
  }),
  v.null(),
);

export const authComponent = createClient<DataModel, typeof authSchema>(components.betterAuth, {
  local: {
    schema: authSchema,
  },
});

// const createAdminPlugin = () => {
//   const plugin = admin();
//   return plugin as Omit<typeof plugin, "init"> & { init?: BetterAuthPlugin["init"] };
// };

export const createAuthOptions = (ctx: GenericCtx<DataModel>) => {
  return {
    secret: env.BETTER_AUTH_SECRET,
    baseURL: siteUrl,
    trustedOrigins: [siteUrl],
    rateLimit: {
      enabled: true,
      storage: "database" as const,
      window: 60,
      max: 100,
      customRules: {
        "/sign-in/email": { window: 60, max: 5 },
        "/sign-up/email": { window: 60, max: 3 },
        "/request-password-reset": { window: 60, max: 3 },
        "/forget-password": { window: 60, max: 3 },
        "/reset-password": { window: 60, max: 3 },
        "/change-password": { window: 60, max: 3 },
        "/send-verification-email": { window: 60, max: 3 },
        "/delete-user": { window: 60, max: 3 },
        "/organization/invite-member": { window: 60, max: 10 },
      },
    },
    session: {
      expiresIn: 60 * 60 * 24 * 7,
      updateAge: 60 * 60 * 24,
      freshAge: 60 * 15,
    },
    user: {
      deleteUser: {
        enabled: true,
      },
    },
    database: authComponent.adapter(ctx),
    emailVerification: {
      sendOnSignIn: true,
      sendOnSignUp: true,
      sendVerificationEmail: async ({
        user,
        url,
      }: {
        user: { email: string; name: string };
        url: string;
      }) => {
        await sendResendVerificationEmail(ctx, {
          to: user.email,
          userName: user.name,
          verifyLink: url,
        });
      },
    },
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: true,
      revokeSessionsOnPasswordReset: true,
      sendResetPassword: async ({
        user,
        url,
      }: {
        user: { email: string; name?: string | null };
        url: string;
      }) => {
        await sendResendPasswordResetEmail(ctx, {
          to: user.email,
          userName: user.name,
          resetLink: url,
        });
      },
      customSyntheticUser: ({
        coreFields,
        additionalFields,
        id,
      }: {
        coreFields: Record<string, unknown>;
        additionalFields: Record<string, unknown>;
        id: string;
      }) => ({
        ...coreFields,
        role: "user",
        banned: false,
        banReason: null,
        banExpires: null,
        ...additionalFields,
        id,
      }),
    },
    plugins: [
      convex({
        authConfig,
        jwksRotateOnTokenGenerationError: true,
      }),
      organization({
        cancelPendingInvitationsOnReInvite: true,
        invitationExpiresIn: 60 * 60 * 24 * 7,
        requireEmailVerificationOnInvitation: true,
        sendInvitationEmail: async (data) => {
          const inviteLink = getInvitationUrl(data.id);
          await sendResendInvitationEmail(ctx, {
            to: data.email,
            organizationName: data.organization.name,
            inviterName: data.inviter.user.name,
            inviterEmail: data.inviter.user.email,
            role: data.role,
            inviteLink,
          });
        },
      }),
      admin(),
    ],
  };
};

export const createAuth = (ctx: GenericCtx<DataModel>) => betterAuth(createAuthOptions(ctx));

export const getCurrentUser = query({
  args: {},
  returns: currentUserValidator,
  handler: async (ctx) => {
    const user = await authComponent.safeGetAuthUser(ctx);
    if (!user) {
      return null;
    }

    return {
      id: String(user._id),
      name: user.name,
      email: user.email,
      emailVerified: user.emailVerified,
      image: user.image ?? null,
      role: user.role ?? null,
    };
  },
});
