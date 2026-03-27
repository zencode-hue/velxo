/**
 * Email service — Resend (primary) with Nodemailer SMTP fallback.
 * Falls back to console.log in dev if neither is configured.
 */

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME ?? "Velxo";
const FROM = process.env.EMAIL_FROM ?? "noreply@velxo.com";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? FROM;

// ─── HTML template helper ────────────────────────────────────────────────────

function html(title: string, body: string): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>${title}</title></head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:system-ui,sans-serif;color:#f9fafb;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:40px 0;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#111;border:1px solid #2a2a2a;border-radius:12px;overflow:hidden;">
        <tr><td style="background:linear-gradient(135deg,#7c3aed,#8b5cf6);padding:24px 32px;">
          <span style="font-size:22px;font-weight:700;color:#fff;">${APP_NAME}</span>
        </td></tr>
        <tr><td style="padding:32px;">${body}</td></tr>
        <tr><td style="padding:16px 32px;border-top:1px solid #2a2a2a;font-size:12px;color:#6b7280;text-align:center;">
          © ${new Date().getFullYear()} ${APP_NAME}. All rights reserved.
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function btn(href: string, label: string): string {
  return `<a href="${href}" style="display:inline-block;padding:12px 28px;background:linear-gradient(135deg,#7c3aed,#8b5cf6);color:#fff;text-decoration:none;border-radius:8px;font-weight:600;font-size:14px;">${label}</a>`;
}

function p(text: string): string {
  return `<p style="margin:0 0 16px;color:#d1d5db;line-height:1.6;font-size:15px;">${text}</p>`;
}

function h2(text: string): string {
  return `<h2 style="margin:0 0 20px;color:#f9fafb;font-size:20px;font-weight:700;">${text}</h2>`;
}

// ─── Send helper ─────────────────────────────────────────────────────────────

async function send(to: string, subject: string, htmlBody: string): Promise<void> {
  const resendKey = process.env.RESEND_API_KEY;
  const smtpHost = process.env.SMTP_HOST;

  if (resendKey) {
    const { Resend } = await import("resend");
    const resend = new Resend(resendKey);
    await resend.emails.send({ from: FROM, to, subject, html: htmlBody });
    return;
  }

  if (smtpHost) {
    const nodemailer = await import("nodemailer");
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: Number(process.env.SMTP_PORT ?? 587),
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
    await transporter.sendMail({ from: FROM, to, subject, html: htmlBody });
    return;
  }

  // Dev fallback
  console.log(`[email] to=${to} subject="${subject}"`);
}

// ─── Exported functions ───────────────────────────────────────────────────────

export async function sendVerificationEmail(email: string, token: string): Promise<void> {
  const link = `${APP_URL}/api/auth/verify-email?token=${token}`;
  await send(
    email,
    `Verify your ${APP_NAME} account`,
    html(
      "Verify your account",
      `${h2("Verify your email address")}
       ${p("Thanks for signing up! Click the button below to verify your email address.")}
       <div style="margin:24px 0;">${btn(link, "Verify Email")}</div>
       ${p(`Or copy this link: <a href="${link}" style="color:#8b5cf6;">${link}</a>`)}
       ${p("This link expires in 24 hours. If you didn't create an account, you can ignore this email.")}`
    )
  );
}

export async function sendPasswordResetEmail(email: string, token: string): Promise<void> {
  const link = `${APP_URL}/auth/reset-password?token=${token}`;
  await send(
    email,
    `Reset your ${APP_NAME} password`,
    html(
      "Reset password",
      `${h2("Reset your password")}
       ${p("We received a request to reset your password. Click the button below to set a new one.")}
       <div style="margin:24px 0;">${btn(link, "Reset Password")}</div>
       ${p("This link expires in 60 minutes.")}
       ${p("If you didn't request a password reset, you can safely ignore this email.")}`
    )
  );
}

export async function sendWelcomeEmail(email: string): Promise<void> {
  await send(
    email,
    `Welcome to ${APP_NAME}!`,
    html(
      "Welcome",
      `${h2(`Welcome to ${APP_NAME}!`)}
       ${p("Your account is ready. Browse our catalog of premium digital products — streaming subscriptions, AI tools, software licenses, and gaming products.")}
       <div style="margin:24px 0;">${btn(`${APP_URL}/products`, "Browse Products")}</div>
       ${p("All products are delivered instantly to your inbox after payment.")}`
    )
  );
}

export async function sendDeliveryEmail(email: string, orderDetails: object): Promise<void> {
  const d = orderDetails as Record<string, unknown>;
  const credentials = d.credentials as string | undefined;
  const credBlock = credentials
    ? `<div style="margin:20px 0;padding:16px;background:#1a1a1a;border:1px solid #2a2a2a;border-radius:8px;font-family:monospace;font-size:14px;color:#a78bfa;word-break:break-all;">${credentials}</div>`
    : "";

  await send(
    email,
    `Your order has been delivered — ${APP_NAME}`,
    html(
      "Order delivered",
      `${h2("Your order is ready!")}
       ${p(`Order ID: <strong style="color:#f9fafb;">${d.orderId ?? "N/A"}</strong>`)}
       ${p(`Product: <strong style="color:#f9fafb;">${d.productTitle ?? "N/A"}</strong>`)}
       ${credentials ? `${p("Your credentials / license key:")}${credBlock}` : p("Your order is being processed.")}
       <div style="margin:24px 0;">${btn(`${APP_URL}/dashboard`, "View Dashboard")}</div>
       ${p("Keep your credentials safe. Do not share them with anyone.")}`
    )
  );
}

export async function sendLockoutEmail(email: string): Promise<void> {
  await send(
    email,
    `Account temporarily locked — ${APP_NAME}`,
    html(
      "Account locked",
      `${h2("Your account has been temporarily locked")}
       ${p("We detected multiple failed login attempts on your account. For your security, your account has been locked for 15 minutes.")}
       ${p("If this was you, please wait 15 minutes and try again.")}
       ${p("If you didn't attempt to log in, we recommend resetting your password immediately.")}
       <div style="margin:24px 0;">${btn(`${APP_URL}/auth/forgot-password`, "Reset Password")}</div>`
    )
  );
}

export async function sendAdminLowStockAlert(productTitle: string, stockCount: number): Promise<void> {
  const subject = stockCount === -1
    ? `⚠️ Duplicate delivery detected — ${APP_NAME}`
    : `⚠️ Low stock alert: ${productTitle} — ${APP_NAME}`;

  const body = stockCount === -1
    ? `${h2("Duplicate Delivery Detected")}${p(`A duplicate delivery was detected for product: <strong>${productTitle}</strong>. Please investigate immediately.`)}`
    : `${h2("Low Stock Alert")}${p(`Product <strong style="color:#f9fafb;">${productTitle}</strong> has only <strong style="color:#f87171;">${stockCount}</strong> item(s) remaining in stock.`)}${p("Please upload more inventory to avoid missed orders.")}<div style="margin:24px 0;">${btn(`${APP_URL}/admin/products`, "Manage Inventory")}</div>`;

  await send(ADMIN_EMAIL, subject, html("Low stock alert", body));
}

export async function sendAdminPendingStockAlert(orderId: string, productTitle: string): Promise<void> {
  await send(
    ADMIN_EMAIL,
    `Order pending stock — ${APP_NAME}`,
    html(
      "Order pending stock",
      `${h2("Order Awaiting Stock")}
       ${p(`Order <strong style="color:#f9fafb;">#${orderId}</strong> for <strong style="color:#f9fafb;">${productTitle}</strong> could not be fulfilled because there is no stock available.`)}
       ${p("Please upload inventory for this product to complete the delivery.")}
       <div style="margin:24px 0;">${btn(`${APP_URL}/admin/orders`, "View Orders")}</div>`
    )
  );
}
