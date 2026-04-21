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
<body style="margin:0;padding:0;background:#0d0a07;font-family:system-ui,sans-serif;color:#f9fafb;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0d0a07;padding:40px 0;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#111;border:1px solid #3d2a10;border-radius:12px;overflow:hidden;">
        <tr><td style="background:linear-gradient(135deg,#ea580c,#f97316);padding:24px 32px;">
          <span style="font-size:22px;font-weight:700;color:#fff;">${APP_NAME}</span>
        </td></tr>
        <tr><td style="padding:32px;">${body}</td></tr>
        <tr><td style="padding:16px 32px;border-top:1px solid #3d2a10;font-size:12px;color:#6b7280;text-align:center;">
          © ${new Date().getFullYear()} ${APP_NAME}. All rights reserved.
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function btn(href: string, label: string): string {
  return `<a href="${href}" style="display:inline-block;padding:12px 28px;background:linear-gradient(135deg,#ea580c,#f97316);color:#fff;text-decoration:none;border-radius:8px;font-weight:600;font-size:14px;">${label}</a>`;
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
       ${p(`Or copy this link: <a href="${link}" style="color:#f97316;">${link}</a>`)}
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
    ? `<div style="margin:20px 0;padding:16px;background:#231808;border:1px solid #3d2a10;border-radius:8px;font-family:monospace;font-size:14px;color:#fbbf24;word-break:break-all;">${credentials}</div>`
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

// ─── Resend Contact Events ────────────────────────────────────────────────────

/**
 * Track a contact event in Resend for email automation/segmentation.
 * Silently fails if RESEND_API_KEY or RESEND_AUDIENCE_ID is not set.
 *
 * Common events: invoice_created, order_delivered, user_registered,
 *                password_reset, affiliate_joined, balance_topped_up
 */
export async function trackEvent(email: string, event: string, data?: Record<string, unknown>): Promise<void> {
  if (!process.env.RESEND_API_KEY) return;

  try {
    const resendKey = process.env.RESEND_API_KEY;
    if (!resendKey) return;
    // Use Resend REST API for contact events
    await fetch("https://api.resend.com/contacts/events", {
      method: "POST",
      headers: { "Authorization": `Bearer ${resendKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ event, email, ...(data ? { data } : {}) }),
    });
  } catch (err) {
    console.warn(`[trackEvent] Failed to track "${event}" for ${email}:`, err);
  }
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

// ─── Invoice / Order Emails ───────────────────────────────────────────────────

/**
 * Sent immediately when an order is created (any payment method).
 * Tells the customer their invoice is ready and links to it.
 */
export async function sendInvoiceCreatedEmail(
  email: string,
  orderId: string,
  productTitle: string,
  amount: number,
  paymentProvider: string
): Promise<void> {
  const invoiceUrl = `${APP_URL}/invoice/${orderId}`;
  const invoiceNum = orderId.slice(0, 8).toUpperCase();

  const paymentLabels: Record<string, string> = {
    nowpayments: "Crypto (NOWPayments)",
    balance: "Wallet Balance",
    binance_gift_card: "Binance Gift Card",
    discord: "Discord Manual",
  };

  await send(
    email,
    `Invoice #${invoiceNum} — ${APP_NAME}`,
    html(
      `Invoice #${invoiceNum}`,
      `${h2(`Your invoice is ready`)}
       ${p(`Hi! Your order for <strong style="color:#f9fafb;">${productTitle}</strong> has been created.`)}
       <table width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0;border:1px solid #222;border-radius:8px;overflow:hidden;">
         <tr style="background:#1a1a1a;">
           <td style="padding:12px 16px;font-size:13px;color:#9ca3af;">Invoice</td>
           <td style="padding:12px 16px;font-size:13px;color:#f9fafb;text-align:right;font-family:monospace;">#${invoiceNum}</td>
         </tr>
         <tr>
           <td style="padding:12px 16px;font-size:13px;color:#9ca3af;">Product</td>
           <td style="padding:12px 16px;font-size:13px;color:#f9fafb;text-align:right;">${productTitle}</td>
         </tr>
         <tr style="background:#1a1a1a;">
           <td style="padding:12px 16px;font-size:13px;color:#9ca3af;">Amount</td>
           <td style="padding:12px 16px;font-size:14px;font-weight:700;color:#f9fafb;text-align:right;">$${amount.toFixed(2)}</td>
         </tr>
         <tr>
           <td style="padding:12px 16px;font-size:13px;color:#9ca3af;">Payment</td>
           <td style="padding:12px 16px;font-size:13px;color:#f9fafb;text-align:right;">${paymentLabels[paymentProvider] ?? paymentProvider}</td>
         </tr>
       </table>
       <div style="margin:28px 0;">${btn(invoiceUrl, "View Invoice →")}</div>
       ${p(`Once your payment is confirmed, your product will be delivered instantly to this email address.`)}
       ${p(`Keep your invoice link safe — you can always access your order at: <a href="${invoiceUrl}" style="color:#a78bfa;">${invoiceUrl}</a>`)}`
    )
  );
}

/**
 * 30-minute reminder for PENDING orders that haven't been paid yet.
 */
export async function sendInvoiceReminderEmail(
  email: string,
  orderId: string,
  productTitle: string,
  amount: number
): Promise<void> {
  const invoiceUrl = `${APP_URL}/invoice/${orderId}`;
  const invoiceNum = orderId.slice(0, 8).toUpperCase();

  await send(
    email,
    `Don't forget your order — ${APP_NAME}`,
    html(
      "Complete your order",
      `${h2("You left something behind 👀")}
       ${p(`Your order for <strong style="color:#f9fafb;">${productTitle}</strong> is still waiting for payment.`)}
       <div style="margin:20px 0;padding:20px;background:#1a1a1a;border:1px solid #333;border-radius:8px;text-align:center;">
         <div style="font-size:28px;font-weight:800;color:#f9fafb;margin-bottom:4px;">$${amount.toFixed(2)}</div>
         <div style="font-size:13px;color:#9ca3af;">${productTitle}</div>
         <div style="font-size:12px;color:#6b7280;margin-top:4px;font-family:monospace;">Invoice #${invoiceNum}</div>
       </div>
       <div style="margin:28px 0;">${btn(invoiceUrl, "Complete Payment →")}</div>
       ${p("Your order is reserved. Complete your payment to receive instant delivery.")}
       ${p(`Questions? Reply to this email or visit our <a href="${APP_URL}/support" style="color:#a78bfa;">support page</a>.`)}`
    )
  );
}

// ─── Partner Payout Notifications ────────────────────────────────────────────

export async function sendPayoutNotificationEmail(
  email: string,
  action: "approved" | "rejected",
  amount: number,
  txHash?: string | null
): Promise<void> {
  const subject = action === "approved"
    ? `💸 Payout of $${amount.toFixed(2)} Approved — ${APP_NAME}`
    : `❌ Payout Request Rejected — ${APP_NAME}`;

  const body = action === "approved"
    ? `${h2("Your payout has been approved!")}
       ${p(`Great news! Your payout request of <strong style="color:#f9fafb;">$${amount.toFixed(2)}</strong> has been approved and sent to your wallet.`)}
       ${txHash ? `${p(`Transaction Hash: <code style="color:#a78bfa;">${txHash}</code>`)}` : ""}
       ${p("The funds should arrive in your wallet within the next few minutes depending on network congestion.")}
       <div style="margin:24px 0;">${btn(`${APP_URL}/dashboard/partner`, "View Partner Dashboard")}</div>`
    : `${h2("Payout request rejected")}
       ${p(`Unfortunately, your payout request of <strong style="color:#f9fafb;">$${amount.toFixed(2)}</strong> has been rejected.`)}
       ${p("The amount has been returned to your partner balance. Please contact support if you have questions.")}
       <div style="margin:24px 0;">${btn(`${APP_URL}/support`, "Contact Support")}</div>`;

  await send(email, subject, html(action === "approved" ? "Payout approved" : "Payout rejected", body));
}
