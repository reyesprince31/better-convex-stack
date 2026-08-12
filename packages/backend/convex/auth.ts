import { createClient, type GenericCtx } from "@convex-dev/better-auth";
import { convex } from "@convex-dev/better-auth/plugins";
import { admin } from "better-auth/plugins/admin";
import { betterAuth, type BetterAuthOptions } from "better-auth/minimal";
import { organization } from "better-auth/plugins/organization";

import { components } from "./_generated/api";
import type { DataModel } from "./_generated/dataModel";
import { query } from "./_generated/server";
import authConfig from "./auth.config";
import authSchema from "./betterAuth/schema";

const siteUrl = process.env.SITE_URL!;
const invitationEmailWebhookUrl = process.env.INVITATION_EMAIL_WEBHOOK_URL;

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

  if (!invitationEmailWebhookUrl) {
    // The member-management UI exposes this same link as a copyable fallback.
    // Configure INVITATION_EMAIL_WEBHOOK_URL to deliver it through your email provider.
    return;
  }

  const response = await fetch(invitationEmailWebhookUrl, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      template: "organization-invitation",
      to: data.email,
      inviteLink,
      organizationName: data.organization.name,
      inviterName: data.inviter.user.name,
      inviterEmail: data.inviter.user.email,
      role: data.role,
    }),
  });

  if (!response.ok) {
    throw new Error(`Invitation email delivery failed with status ${response.status}.`);
  }
}

export const authComponent = createClient<DataModel, typeof authSchema>(
  components.betterAuth,
  {
    local: {
      schema: authSchema,
    },
  },
);

export const createAuthOptions = (ctx: GenericCtx<DataModel>) => {
  return {
    baseURL: siteUrl,
    trustedOrigins: [siteUrl],
    database: authComponent.adapter(ctx),
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: false,
    },
    plugins: [
      convex({
        authConfig,
        jwksRotateOnTokenGenerationError: true,
      }),
      organization({
        cancelPendingInvitationsOnReInvite: true,
        invitationExpiresIn: 60 * 60 * 24 * 7,
        sendInvitationEmail,
      }),
      admin(),
    ],
  } satisfies BetterAuthOptions;
};

export const createAuth = (ctx: GenericCtx<DataModel>) =>
  betterAuth(createAuthOptions(ctx));

export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    return await authComponent.safeGetAuthUser(ctx);
  },
});
