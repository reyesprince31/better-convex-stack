import { createClient, type GenericCtx } from "@convex-dev/better-auth";
import { convex } from "@convex-dev/better-auth/plugins";
import { admin } from "better-auth/plugins/admin";
import { betterAuth, type BetterAuthOptions } from "better-auth/minimal";
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

function getEmailWebhookUrl(kind: "auth" | "invitation") {
  const url =
    kind === "invitation"
      ? env.INVITATION_EMAIL_WEBHOOK_URL || env.AUTH_EMAIL_WEBHOOK_URL
      : env.AUTH_EMAIL_WEBHOOK_URL;

  if (!url) {
    throw new Error("AUTH_EMAIL_WEBHOOK_URL is required to deliver authentication emails.");
  }

  return url;
}

async function postEmailWebhook(kind: "auth" | "invitation", body: Record<string, string>) {
  const response = await fetch(getEmailWebhookUrl(kind), {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`Authentication email delivery failed with status ${response.status}.`);
  }
}

function getInvitationUrl(invitationId: string) {
  const url = new URL("/accept-invitation", siteUrl);
  url.searchParams.set("id", invitationId);
  return url.toString();
}

async function sendInvitationEmail(data: {
  id: string;
  role: string;
  email: string;
  organization: { name: string };
  inviter: { user: { name: string; email: string } };
}) {
  const inviteLink = getInvitationUrl(data.id);

  await postEmailWebhook("invitation", {
    template: "organization-invitation",
    to: data.email,
    inviteLink,
    organizationName: data.organization.name,
    inviterName: data.inviter.user.name,
    inviterEmail: data.inviter.user.email,
    role: data.role,
  });
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

export const createAuthOptions = (ctx: GenericCtx<DataModel>) => {
  return {
    secret: env.BETTER_AUTH_SECRET,
    baseURL: siteUrl,
    trustedOrigins: [siteUrl],
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
      sendVerificationEmail: async ({ user, url }) => {
        await postEmailWebhook("auth", {
          template: "email-verification",
          to: user.email,
          userName: user.name,
          verifyLink: url,
        });
      },
    },
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: true,
      customSyntheticUser: ({ coreFields, additionalFields, id }) => ({
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
        sendInvitationEmail,
      }),
      admin(),
    ],
  } satisfies BetterAuthOptions;
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
