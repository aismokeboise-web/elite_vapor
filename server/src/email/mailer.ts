import nodemailer from "nodemailer";

const smtpHost = process.env.SMTP_HOST;
const smtpPort = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : undefined;
const smtpUser = process.env.SMTP_USER;
const smtpPass = process.env.SMTP_PASS;
const smtpFrom = process.env.SMTP_FROM || "no-reply@empirevaporcasper.com";

if (!smtpHost || !smtpPort || !smtpUser || !smtpPass || !smtpFrom) {
  // eslint-disable-next-line no-console
  console.warn(
    "[mailer] SMTP environment variables are not fully configured. Password reset emails will not be sent."
  );
}

const transporter =
  smtpHost && smtpPort && smtpUser && smtpPass
    ? nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465,
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      })
    : null;

export async function sendAdminPasswordResetEmail(to: string, resetUrl: string) {
  if (!transporter || !smtpFrom) {
    // eslint-disable-next-line no-console
    console.warn("[mailer] Not sending password reset email because transporter is not configured.");
    return;
  }

  const subject = "Empire Vapor admin password reset";
  const text = [
    "You requested a password reset for your admin account.",
    "",
    "If you made this request, click the link below to reset your password. This link is valid for 5 minutes:",
    resetUrl,
    "",
    "If you did not request this, you can safely ignore this email.",
  ].join("\n");

  const html = `
  <div style="margin:0;padding:0;background-color:#f3f4f6;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:16px 8px;background-color:#f3f4f6;">
      <tr>
        <td align="center">
          <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width:520px;background-color:#ffffff;border-radius:8px;border:1px solid #e5e7eb;">
            <tr>
              <td style="padding:16px 20px;border-bottom:1px solid #e5e7eb;">
                <div style="font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;font-size:16px;font-weight:600;color:#111827;">
                  Empire Vapor – Admin password reset
                </div>
              </td>
            </tr>
            <tr>
              <td style="padding:16px 20px;">
                <p style="margin:0 0 8px 0;font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;font-size:14px;line-height:1.5;color:#111827;">
                  You requested a password reset for your Empire Vapor admin account.
                </p>
                <p style="margin:0 0 16px 0;font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;font-size:13px;line-height:1.5;color:#4b5563;">
                  If you made this request, click the button below to choose a new password. This link is valid for
                  <strong>5 minutes</strong>.
                </p>
                <p style="margin:0 0 16px 0;text-align:center;">
                  <a href="${resetUrl}"
                    style="display:inline-block;padding:10px 18px;border-radius:6px;background-color:#2563eb;color:#ffffff;text-decoration:none;font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;font-size:14px;font-weight:600;">
                    Reset password
                  </a>
                </p>
                <p style="margin:0 0 4px 0;font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;font-size:12px;line-height:1.5;color:#6b7280;">
                  If the button doesn&apos;t work, copy and paste this link into your browser:
                </p>
                <p style="margin:0 0 12px 0;font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;font-size:11px;line-height:1.5;color:#1d4ed8;word-break:break-all;">
                  <a href="${resetUrl}" style="color:#1d4ed8;text-decoration:none;">${resetUrl}</a>
                </p>
                <p style="margin:0;font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;font-size:12px;line-height:1.5;color:#6b7280;">
                  If you did not request a password reset, you can safely ignore this email. Your admin password will remain unchanged.
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:12px 20px;border-top:1px solid #e5e7eb;">
                <p style="margin:0;font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;font-size:11px;line-height:1.4;color:#9ca3af;">
                  This message was sent by <strong>Empire Vapor</strong> to help keep your admin account secure.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </div>
  `;
  await transporter.sendMail({
    from: smtpFrom,
    to,
    subject,
    text,
    html,
  });
}

export async function sendAdminPasswordChangedEmail(to: string) {
  if (!transporter || !smtpFrom) {
    // eslint-disable-next-line no-console
    console.warn("[mailer] Not sending password changed email because transporter is not configured.");
    return;
  }

  const subject = "Your Empire Vapor admin password was changed";
  const text = [
    "Your admin password has just been changed.",
    "",
    "If you made this change, no further action is required.",
    "If you did not make this change, please reset your password immediately and contact support.",
  ].join("\n");

  const html = `
  <div style="margin:0;padding:0;background-color:#f3f4f6;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:16px 8px;background-color:#f3f4f6;">
      <tr>
        <td align="center">
          <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width:520px;background-color:#ffffff;border-radius:8px;border:1px solid #e5e7eb;">
            <tr>
              <td style="padding:16px 20px;border-bottom:1px solid #e5e7eb;">
                <div style="font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;font-size:16px;font-weight:600;color:#111827;">
                  Empire Vapor – Admin password changed
                </div>
              </td>
            </tr>
            <tr>
              <td style="padding:16px 20px;">
                <p style="margin:0 0 8px 0;font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;font-size:14px;line-height:1.5;color:#111827;">
                  This is a confirmation that the password for your Empire Vapor admin account was just changed.
                </p>
                <p style="margin:0 0 8px 0;font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;font-size:13px;line-height:1.5;color:#4b5563;">
                  If you made this change, no further action is required.
                </p>
                <p style="margin:0;font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;font-size:13px;line-height:1.5;color:#b91c1c;">
                  If you did <strong>not</strong> make this change, please reset your password immediately and contact your site administrator or support team.
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:12px 20px;border-top:1px solid #e5e7eb;">
                <p style="margin:0;font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;font-size:11px;line-height:1.4;color:#9ca3af;">
                  This automatic security notice helps protect your <strong>Empire Vapor</strong> admin account.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </div>
  `;

  await transporter.sendMail({
    from: smtpFrom,
    to,
    subject,
    text,
    html,
  });
}

export async function sendContactConfirmationEmail(to: string, name: string) {
  if (!transporter) {
    // eslint-disable-next-line no-console
    console.warn("[mailer] Not sending contact confirmation email because transporter is not configured.");
    return;
  }

  const fromAddress = "info@empirevaporcasper.com";

  const subject = "Thanks for contacting Empire Vapor";
  const text = [
    `Hi ${name},`,
    "",
    "Thanks for reaching out to Empire Vapor. We've received your message and will get back to you as soon as we can.",
    "",
    "If you didn’t submit this request, you can safely ignore this email.",
    "",
    "— Empire Vapor",
  ].join("\n");

  const safeName = name || "there";

  const html = `
  <div style="margin:0;padding:0;background-color:#f3f4f6;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:16px 8px;background-color:#f3f4f6;">
      <tr>
        <td align="center">
          <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width:520px;background-color:#ffffff;border-radius:8px;border:1px solid #e5e7eb;">
            <tr>
              <td style="padding:16px 20px;border-bottom:1px solid #e5e7eb;">
                <div style="font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;font-size:16px;font-weight:600;color:#111827;">
                  Empire Vapor – We&apos;ve received your message
                </div>
              </td>
            </tr>
            <tr>
              <td style="padding:16px 20px;">
                <p style="margin:0 0 8px 0;font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;font-size:14px;line-height:1.5;color:#111827;">
                  Hi ${safeName},
                </p>
                <p style="margin:0 0 8px 0;font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;font-size:13px;line-height:1.5;color:#4b5563;">
                  Thanks for reaching out to <strong>Empire Vapor</strong>. We&apos;ve received your message and a member of our team will get back to you as soon as possible.
                </p>
                <p style="margin:0 0 12px 0;font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;font-size:13px;line-height:1.5;color:#4b5563;">
                  If you didn&apos;t submit a message on our site, you can safely ignore this email.
                </p>
                <p style="margin:0;font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;font-size:13px;line-height:1.5;color:#111827;">
                  — The Empire Vapor team
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </div>
  `;

  await transporter.sendMail({
    from: fromAddress,
    to,
    subject,
    text,
    html,
  });
}


