export interface VerificationEmailProps {
  userName?: string | null;
  verifyLink: string;
}

export interface InvitationEmailProps {
  organizationName: string;
  inviterName?: string | null;
  inviterEmail: string;
  role: string;
  inviteLink: string;
}

export function getVerificationEmailTemplate(props: VerificationEmailProps): {
  subject: string;
  html: string;
  text: string;
} {
  const name = props.userName ? props.userName.trim() : "there";
  const subject = "Verify your email address";
  const preheader = "Please verify your email address to activate your Orbit account.";

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>${subject}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background-color: #f8fafc;
      color: #0f172a;
      margin: 0;
      padding: 40px 20px;
      -webkit-font-smoothing: antialiased;
    }
    .preheader {
      display: none !important;
      visibility: hidden;
      mso-hide: all;
      font-size: 1px;
      line-height: 1px;
      max-height: 0;
      max-width: 0;
      opacity: 0;
      overflow: hidden;
    }
    .container {
      max-width: 560px;
      margin: 0 auto;
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 36px 32px;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
    }
    .header {
      margin-bottom: 24px;
    }
    .title {
      font-size: 20px;
      font-weight: 600;
      color: #0f172a;
      margin: 0 0 12px 0;
    }
    .text {
      font-size: 15px;
      line-height: 24px;
      color: #334155;
      margin: 0 0 20px 0;
    }
    .button-container {
      margin: 28px 0;
    }
    .button {
      display: inline-block;
      background-color: #0f172a;
      color: #ffffff !important;
      text-decoration: none;
      font-size: 14px;
      font-weight: 500;
      padding: 12px 24px;
      border-radius: 8px;
    }
    .footer {
      margin-top: 32px;
      padding-top: 20px;
      border-top: 1px solid #f1f5f9;
      font-size: 13px;
      color: #64748b;
      line-height: 20px;
    }
    .link {
      color: #2563eb;
      word-break: break-all;
    }
  </style>
</head>
<body>
  <div class="preheader">${preheader}</div>
  <div class="container">
    <div class="header">
      <h1 class="title">Verify your email address</h1>
    </div>
    <p class="text">Hi ${name},</p>
    <p class="text">Thanks for signing up! Please confirm your email address by clicking the button below.</p>
    <div class="button-container">
      <a href="${props.verifyLink}" class="button" target="_blank" rel="noopener noreferrer">Verify email</a>
    </div>
    <p class="text">If you didn't create an account, you can safely ignore this email.</p>
    <div class="footer">
      <p style="margin: 0 0 8px 0;">Button not working? Paste this link into your browser:</p>
      <a href="${props.verifyLink}" class="link">${props.verifyLink}</a>
    </div>
  </div>
</body>
</html>`;

  const text = `Hi ${name},\n\nThanks for signing up! Please verify your email address by opening the following link in your browser:\n\n${props.verifyLink}\n\nIf you didn't create an account, you can safely ignore this email.`;

  return { subject, html, text };
}

export function getInvitationEmailTemplate(props: InvitationEmailProps): {
  subject: string;
  html: string;
  text: string;
} {
  const inviter = props.inviterName?.trim() || props.inviterEmail;
  const subject = `Invitation to join ${props.organizationName} on Orbit`;
  const preheader = `${inviter} has invited you to collaborate in ${props.organizationName} on Orbit.`;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>${subject}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background-color: #f8fafc;
      color: #0f172a;
      margin: 0;
      padding: 40px 20px;
      -webkit-font-smoothing: antialiased;
    }
    .preheader {
      display: none !important;
      visibility: hidden;
      mso-hide: all;
      font-size: 1px;
      line-height: 1px;
      max-height: 0;
      max-width: 0;
      opacity: 0;
      overflow: hidden;
    }
    .container {
      max-width: 560px;
      margin: 0 auto;
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 36px 32px;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
    }
    .header {
      margin-bottom: 24px;
    }
    .title {
      font-size: 20px;
      font-weight: 600;
      color: #0f172a;
      margin: 0 0 12px 0;
    }
    .text {
      font-size: 15px;
      line-height: 24px;
      color: #334155;
      margin: 0 0 20px 0;
    }
    .badge {
      display: inline-block;
      background: #f1f5f9;
      color: #0f172a;
      font-size: 13px;
      font-weight: 600;
      padding: 2px 8px;
      border-radius: 4px;
    }
    .button-container {
      margin: 28px 0;
    }
    .button {
      display: inline-block;
      background-color: #0f172a;
      color: #ffffff !important;
      text-decoration: none;
      font-size: 14px;
      font-weight: 500;
      padding: 12px 24px;
      border-radius: 8px;
    }
    .footer {
      margin-top: 32px;
      padding-top: 20px;
      border-top: 1px solid #f1f5f9;
      font-size: 13px;
      color: #64748b;
      line-height: 20px;
    }
    .link {
      color: #2563eb;
      word-break: break-all;
    }
  </style>
</head>
<body>
  <div class="preheader">${preheader}</div>
  <div class="container">
    <div class="header">
      <h1 class="title">Join ${props.organizationName} on Orbit</h1>
    </div>
    <p class="text"><strong>${inviter}</strong> has invited you to join <strong>${props.organizationName}</strong> as a <span class="badge">${props.role}</span>.</p>
    <p class="text">Click the button below to accept your invitation and join the workspace.</p>
    <div class="button-container">
      <a href="${props.inviteLink}" class="button" target="_blank" rel="noopener noreferrer">Accept invitation</a>
    </div>
    <p class="text">This invitation will expire in 7 days. If you were not expecting this invitation, you can safely ignore this email.</p>
    <div class="footer">
      <p style="margin: 0 0 8px 0;">Button not working? Paste this link into your browser:</p>
      <a href="${props.inviteLink}" class="link">${props.inviteLink}</a>
    </div>
  </div>
</body>
</html>`;

  const text = `${inviter} has invited you to join ${props.organizationName} on Orbit as a ${props.role}.\n\nAccept your invitation by visiting the link below:\n\n${props.inviteLink}\n\nThis invitation will expire in 7 days. If you were not expecting this invitation, you can safely ignore this email.`;

  return { subject, html, text };
}

export interface PasswordResetEmailProps {
  userName?: string | null;
  resetLink: string;
}

export function getPasswordResetEmailTemplate(props: PasswordResetEmailProps): {
  subject: string;
  html: string;
  text: string;
} {
  const name = props.userName ? props.userName.trim() : "there";
  const subject = "Reset your password";
  const preheader = "Instructions for resetting your Orbit account password.";

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>${subject}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background-color: #f8fafc;
      color: #0f172a;
      margin: 0;
      padding: 40px 20px;
      -webkit-font-smoothing: antialiased;
    }
    .preheader {
      display: none !important;
      visibility: hidden;
      mso-hide: all;
      font-size: 1px;
      line-height: 1px;
      max-height: 0;
      max-width: 0;
      opacity: 0;
      overflow: hidden;
    }
    .container {
      max-width: 560px;
      margin: 0 auto;
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 36px 32px;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
    }
    .header {
      margin-bottom: 24px;
    }
    .title {
      font-size: 20px;
      font-weight: 600;
      color: #0f172a;
      margin: 0 0 12px 0;
    }
    .text {
      font-size: 15px;
      line-height: 24px;
      color: #334155;
      margin: 0 0 20px 0;
    }
    .button-container {
      margin: 28px 0;
    }
    .button {
      display: inline-block;
      background-color: #0f172a;
      color: #ffffff !important;
      text-decoration: none;
      font-size: 14px;
      font-weight: 500;
      padding: 12px 24px;
      border-radius: 8px;
    }
    .footer {
      margin-top: 32px;
      padding-top: 20px;
      border-top: 1px solid #f1f5f9;
      font-size: 13px;
      color: #64748b;
      line-height: 20px;
    }
    .link {
      color: #2563eb;
      word-break: break-all;
    }
  </style>
</head>
<body>
  <div class="preheader">${preheader}</div>
  <div class="container">
    <div class="header">
      <h1 class="title">Reset your password</h1>
    </div>
    <p class="text">Hi ${name},</p>
    <p class="text">We received a request to reset your password. Click the button below to set a new password for your account.</p>
    <div class="button-container">
      <a href="${props.resetLink}" class="button" target="_blank" rel="noopener noreferrer">Reset password</a>
    </div>
    <p class="text">This password reset link will expire in 1 hour. If you did not request a password reset, you can safely ignore this email.</p>
    <div class="footer">
      <p style="margin: 0 0 8px 0;">Button not working? Paste this link into your browser:</p>
      <a href="${props.resetLink}" class="link">${props.resetLink}</a>
    </div>
  </div>
</body>
</html>`;

  const text = `Hi ${name},\n\nWe received a request to reset your password. Please use the link below to set a new password:\n\n${props.resetLink}\n\nThis password reset link will expire in 1 hour. If you did not request a password reset, you can safely ignore this email.`;

  return { subject, html, text };
}
