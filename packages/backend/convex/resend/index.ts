import { type EmailId, Resend, vEmailId, vOnEmailEventArgs, vStatus } from "@convex-dev/resend";
import type { GenericCtx } from "@convex-dev/better-auth";
import { v } from "convex/values";
import type { ActionCtx, MutationCtx } from "../_generated/server";
import { env, internalMutation, query } from "../_generated/server";
import { components, internal } from "../_generated/api";
import type { DataModel } from "../_generated/dataModel";
import { writeAuditLog } from "../audit";
import {
  getInvitationEmailTemplate,
  getPasswordResetEmailTemplate,
  getVerificationEmailTemplate,
} from "./templates";

export const DEFAULT_EMAIL_FROM = "Orbit <info@reyesprince.com>";

export function getEmailFrom(): string {
  return env.EMAIL_FROM || DEFAULT_EMAIL_FROM;
}

export const resend: Resend = new Resend(components.resend, {
  // testMode: false allows sending to any recipient when RESEND_API_KEY is configured.
  testMode: false,
  onEmailEvent: internal.resend.index.handleEmailEvent,
});

export type EmailSendContext = MutationCtx | ActionCtx | GenericCtx<DataModel>;

export async function sendVerificationEmail(
  ctx: EmailSendContext,
  params: {
    to: string;
    userName?: string | null;
    verifyLink: string;
    from?: string;
  },
): Promise<EmailId> {
  const { subject, html, text } = getVerificationEmailTemplate({
    userName: params.userName,
    verifyLink: params.verifyLink,
  });

  return await resend.sendEmail(ctx as MutationCtx, {
    from: params.from || getEmailFrom(),
    to: params.to,
    subject,
    html,
    text,
  });
}

export async function sendPasswordResetEmail(
  ctx: EmailSendContext,
  params: {
    to: string;
    userName?: string | null;
    resetLink: string;
    from?: string;
  },
): Promise<EmailId> {
  const { subject, html, text } = getPasswordResetEmailTemplate({
    userName: params.userName,
    resetLink: params.resetLink,
  });

  return await resend.sendEmail(ctx as MutationCtx, {
    from: params.from || getEmailFrom(),
    to: params.to,
    subject,
    html,
    text,
  });
}

export async function sendInvitationEmail(
  ctx: EmailSendContext,
  params: {
    to: string;
    organizationName: string;
    inviterName?: string | null;
    inviterEmail: string;
    role: string;
    inviteLink: string;
    from?: string;
  },
): Promise<EmailId> {
  const { subject, html, text } = getInvitationEmailTemplate({
    organizationName: params.organizationName,
    inviterName: params.inviterName,
    inviterEmail: params.inviterEmail,
    role: params.role,
    inviteLink: params.inviteLink,
  });

  return await resend.sendEmail(ctx as MutationCtx, {
    from: params.from || getEmailFrom(),
    to: params.to,
    subject,
    html,
    text,
  });
}

export const handleEmailEvent = internalMutation({
  args: vOnEmailEventArgs,
  returns: v.null(),
  handler: async (ctx, args) => {
    const { id, event } = args;
    if (event.type === "email.bounced") {
      await writeAuditLog(ctx, {
        action: "email.bounced",
        actorUserId: "system",
        targetId: id,
      });
    } else if (event.type === "email.complained") {
      await writeAuditLog(ctx, {
        action: "email.complained",
        actorUserId: "system",
        targetId: id,
      });
    }
    return null;
  },
});

export const sendTestEmail = internalMutation({
  args: {
    to: v.string(),
    subject: v.optional(v.string()),
    body: v.optional(v.string()),
  },
  returns: v.string(),
  handler: async (ctx, args) => {
    const emailId = await resend.sendEmail(ctx, {
      from: getEmailFrom(),
      to: args.to,
      subject: args.subject ?? "Convex + Resend Test Email",
      html: `<p>${args.body ?? "This is a test email sent via @convex-dev/resend!"}</p>`,
    });
    return emailId;
  },
});

const emailStatusValidator = v.union(
  v.object({
    status: vStatus,
    errorMessage: v.union(v.string(), v.null()),
    bounced: v.boolean(),
    complained: v.boolean(),
    failed: v.boolean(),
    deliveryDelayed: v.boolean(),
    opened: v.boolean(),
    clicked: v.boolean(),
  }),
  v.null(),
);

export const getEmailStatus = query({
  args: {
    emailId: vEmailId,
  },
  returns: emailStatusValidator,
  handler: async (ctx, args) => {
    return await resend.status(ctx, args.emailId);
  },
});

export const cancelEmail = internalMutation({
  args: {
    emailId: vEmailId,
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await resend.cancelEmail(ctx, args.emailId);
    return null;
  },
});
