import nodemailer from "nodemailer";
import "dotenv/config";

const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587;
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;

/** From address for transactional emails: reset password, forgot password, newsletter, registration */
const NO_REPLY_FROM =
  process.env.SMTP_FROM_NO_REPLY || "no-reply@elitevaporboise.com";
/** From address for contact form / send message */
const SUPPORT_FROM =
  process.env.SMTP_FROM_SUPPORT || "support@elitevaporboise.com";

const PUBLIC_APP_URL = process.env.PUBLIC_APP_URL || "http://localhost:4000";
const ADMIN_APP_URL = process.env.ADMIN_APP_URL || "http://localhost:4000/manage";
const ADMIN_ALERT_EMAIL = process.env.ADMIN_ALERT_EMAIL || "";

let transporter: nodemailer.Transporter | null = null;

function getTransport() {
  if (!transporter) {
    if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
      throw new Error("SMTP configuration is missing. Please set SMTP_HOST, SMTP_USER, SMTP_PASS.");
    }
    transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_PORT === 465,
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
    });
  }
  return transporter;
}

export async function sendNewsletterWelcomeEmail(email: string, unsubscribeToken: string) {
  const url = `${PUBLIC_APP_URL}/newsletter/unsubscribe/${encodeURIComponent(
    unsubscribeToken
  )}`;

  const html = `
    <div style="font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 560px; margin: 0 auto; padding: 24px;">
      <h1 style="font-size: 22px; margin: 0 0 12px;">Thanks for subscribing to Elite Vapor</h1>
      <p style="font-size: 14px; line-height: 1.6; margin: 0 0 16px;">
        You&apos;re now subscribed to our newsletter. We&apos;ll occasionally send you updates about new arrivals, deals, and important announcements.
      </p>
      <p style="font-size: 13px; line-height: 1.6; color: #4b5563; margin: 0 0 20px;">
        If you didn&apos;t mean to subscribe or no longer wish to hear from us, you can unsubscribe at any time:
      </p>
      <p style="margin: 0 0 24px;">
        <a href="${url}" style="display:inline-block;padding:10px 16px;border-radius:999px;background:#111827;color:#f9fafb;font-size:13px;font-weight:600;text-decoration:none;">
          Unsubscribe from Newsletter
        </a>
      </p>
      <p style="font-size: 11px; color: #9ca3af; margin: 0;">
        If the button doesn&apos;t work, copy and paste this link into your browser:<br/>
        <span style="word-break: break-all;">${url}</span>
      </p>
    </div>
  `;

  await getTransport().sendMail({
    from: NO_REPLY_FROM,
    to: email,
    subject: "You’re subscribed to Elite Vapor",
    html,
  });
}

export async function sendPasswordChangedEmail(to: string, role: "admin" | "subadmin") {
  const html = `
    <div style="font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 560px; margin: 0 auto; padding: 24px;">
      <h1 style="font-size: 20px; margin: 0 0 12px;">Your password was changed</h1>
      <p style="font-size: 14px; line-height: 1.6; margin: 0 0 16px;">
        The password for your ${role === "admin" ? "admin" : "moderator"} account on Elite Vapor has just been updated.
      </p>
      <p style="font-size: 13px; line-height: 1.6; margin: 0 0 16px; color: #4b5563;">
        If you made this change, no further action is required.
      </p>
      <p style="font-size: 13px; line-height: 1.6; margin: 0 0 16px; color: #b91c1c;">
        If you did <strong>not</strong> make this change, please contact the site administrator immediately.
      </p>
      <p style="font-size: 11px; color: #9ca3af; margin: 0;">
        This notification is sent for your security.
      </p>
    </div>
  `;

  await getTransport().sendMail({
    from: NO_REPLY_FROM,
    to,
    subject: "Your Elite Vapor password was changed",
    html,
  });
}

export async function sendPasswordChangeAlertToAdmin(opts: {
  adminEmail?: string | null;
  changedUserEmail: string;
  role: "admin" | "subadmin";
}) {
  const to = opts.adminEmail || ADMIN_ALERT_EMAIL;
  if (!to) return;

  const html = `
    <div style="font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 560px; margin: 0 auto; padding: 24px;">
      <h1 style="font-size: 20px; margin: 0 0 12px;">Password changed</h1>
      <p style="font-size: 14px; line-height: 1.6; margin: 0 0 16px;">
        The password for a ${opts.role === "admin" ? "primary admin" : "moderator"} account has been changed.
      </p>
      <p style="font-size: 13px; line-height: 1.6; margin: 0 0 16px;">
        Account email: <strong>${opts.changedUserEmail}</strong>
      </p>
      <p style="font-size: 11px; color: #9ca3af; margin: 0;">
        This notification is sent so you can review recent changes and ensure they were expected.
      </p>
    </div>
  `;

  await getTransport().sendMail({
    from: NO_REPLY_FROM,
    to,
    subject: "Elite Vapor: password changed",
    html,
  });
}

export async function sendPasswordResetEmail(opts: {
  to: string;
  role: "admin" | "subadmin";
  token: string;
}) {
  const resetUrl = `${ADMIN_APP_URL}/reset-password?token=${encodeURIComponent(
    opts.token
  )}&role=${encodeURIComponent(opts.role)}`;

  const html = `
    <div style="font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 560px; margin: 0 auto; padding: 24px;">
      <h1 style="font-size: 20px; margin: 0 0 12px;">Reset your password</h1>
      <p style="font-size: 14px; line-height: 1.6; margin: 0 0 16px;">
        We received a request to reset the password for your ${
          opts.role === "admin" ? "admin" : "moderator"
        } account on Elite Vapor.
      </p>
      <p style="font-size: 13px; line-height: 1.6; margin: 0 0 20px;">
        Click the button below to choose a new password. This link expires in 10 minutes for your security.
      </p>
      <p style="margin: 0 0 24px;">
        <a href="${resetUrl}" style="display:inline-block;padding:10px 18px;border-radius:999px;background:#4f46e5;color:#f9fafb;font-size:13px;font-weight:600;text-decoration:none;">
          Reset password
        </a>
      </p>
      <p style="font-size: 11px; color: #9ca3af; margin: 0 0 4px;">
        If the button doesn&apos;t work, copy and paste this link into your browser:<br/>
        <span style="word-break: break-all;">${resetUrl}</span>
      </p>
      <p style="font-size: 11px; color: #9ca3af; margin: 12px 0 0;">
        If you didn&apos;t request a password reset, you can safely ignore this email.
      </p>
    </div>
  `;

  await getTransport().sendMail({
    from: NO_REPLY_FROM,
    to: opts.to,
    subject: "Reset your Elite Vapor password",
    html,
  });
}

/** Contact form: confirmation to the user that we received their message (from support alias) */
export async function sendContactFormConfirmation(opts: {
  to: string;
  name: string;
  subject?: string | null;
}) {
  const subj = opts.subject ? `Re: ${opts.subject}` : "We received your message";
  const textColor = "#1e293b";
  const html = `
    <div style="font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 24px; color: ${textColor}; background: #f8fafc;">
      <div style="background: #fff; border-radius: 12px; padding: 28px 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.06); border: 1px solid #e2e8f0; color: ${textColor};">
        <h1 style="font-size: 22px; font-weight: 700; margin: 0 0 20px; color: ${textColor}; letter-spacing: -0.02em;">We got your message</h1>
        <p style="font-size: 15px; line-height: 1.65; margin: 0 0 16px; color: ${textColor};">
          Hi ${opts.name},
        </p>
        <p style="font-size: 15px; line-height: 1.65; margin: 0 0 16px; color: ${textColor};">
          Thank you for reaching out. We've received your message and will get back to you as soon as we can.
        </p>
        <p style="font-size: 14px; line-height: 1.6; margin: 0 0 24px; color: ${textColor};">
          If you have any urgent questions, you can reply to this email.
        </p>
        <p style="font-size: 13px; color: ${textColor}; margin: 0; padding-top: 16px; border-top: 1px solid #e2e8f0;">
          — Elite Vapor
        </p>
      </div>
    </div>
  `;

  await getTransport().sendMail({
    from: SUPPORT_FROM,
    to: opts.to,
    subject: subj,
    html,
  });
}

/** Admin reply to a contact message — from support alias; used when staff replies from admin panel */
export async function sendMessageReplyEmail(opts: {
  to: string;
  name: string;
  subject?: string | null;
  replyBody: string;
}) {
  const subj = opts.subject ? `Re: ${opts.subject}` : "Re: Your message";
  const html = `
    <div style="font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 24px; color: #1e293b; background: #f8fafc;">
      <div style="background: #fff; border-radius: 12px; padding: 28px 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.06); border: 1px solid #e2e8f0;">
        <p style="font-size: 15px; line-height: 1.65; margin: 0 0 16px; color: #334155;">
          Hi ${opts.name},
        </p>
        <div style="font-size: 15px; line-height: 1.7; margin: 0 0 24px; color: #334155; white-space: pre-wrap;">${opts.replyBody.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</div>
        <p style="font-size: 13px; color: #94a3b8; margin: 0; padding-top: 16px; border-top: 1px solid #e2e8f0;">
          — Elite Vapor
        </p>
      </div>
    </div>
  `;

  await getTransport().sendMail({
    from: SUPPORT_FROM,
    to: opts.to,
    subject: subj,
    html,
  });
}

