/**
 * Email service — Resend (primary) with Nodemailer SMTP fallback.
 * Each email type has its own branded design.
 */

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://velxo.shop";
const APP_NAME = "Velxo Shop";
const FROM = process.env.EMAIL_FROM ?? "Velxo Shop <noreply@velxo.shop>";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "noreply@velxo.shop";

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

  console.log(`[email] to=${to} subject="${subject}"`);
}

// ─── Shared layout pieces ─────────────────────────────────────────────────────

const BASE_STYLES = `
  body,table,td,a{-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%}
  table,td{mso-table-lspace:0pt;mso-table-rspace:0pt}
  img{-ms-interpolation-mode:bicubic;border:0;outline:none;text-decoration:none}
`;

function header(accentColor = "#7c3aed", emoji = "⚡"): string {
  return `
    <tr>
      <td style="background:linear-gradient(135deg,${accentColor} 0%,${accentColor}cc 100%);padding:0;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="padding:28px 36px 24px;">
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background:rgba(255,255,255,0.15);border-radius:10px;padding:8px 12px;display:inline-block;">
                    <span style="font-size:18px;font-weight:800;color:#fff;letter-spacing:-0.5px;font-family:system-ui,sans-serif;">
                      ${emoji} ${APP_NAME}
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>`;
}

function footer(): string {
  return `
    <tr>
      <td style="padding:24px 36px;border-top:1px solid rgba(255,255,255,0.06);">
        <p style="margin:0 0 8px;font-size:12px;color:#4b5563;text-align:center;font-family:system-ui,sans-serif;">
          © ${new Date().getFullYear()} ${APP_NAME} · <a href="${APP_URL}" style="color:#7c3aed;text-decoration:none;">velxo.shop</a>
        </p>
        <p style="margin:0;font-size:11px;color:#374151;text-align:center;font-family:system-ui,sans-serif;">
          You received this email because you have an account or placed an order at Velxo Shop.
        </p>
      </td>
    </tr>`;
}

function wrap(headerHtml: string, bodyHtml: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <style>${BASE_STYLES}</style>
</head>
<body style="margin:0;padding:0;background:#0a0a0f;font-family:system-ui,-apple-system,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0f;padding:40px 16px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:580px;background:#111118;border:1px solid rgba(255,255,255,0.08);border-radius:16px;overflow:hidden;">
        ${headerHtml}
        <tr><td style="padding:32px 36px;">${bodyHtml}</td></tr>
        ${footer()}
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function btn(href: string, label: string, color = "#7c3aed"): string {
  return `<a href="${href}" style="display:inline-block;padding:13px 28px;background:${color};color:#fff;text-decoration:none;border-radius:10px;font-weight:700;font-size:14px;font-family:system-ui,sans-serif;letter-spacing:0.2px;">${label}</a>`;
}

function divider(): string {
  return `<div style="height:1px;background:rgba(255,255,255,0.06);margin:24px 0;"></div>`;
}

function badge(text: string, color = "#7c3aed"): string {
  return `<span style="display:inline-block;padding:4px 12px;background:${color}22;border:1px solid ${color}44;border-radius:100px;font-size:12px;font-weight:600;color:${color};font-family:system-ui,sans-serif;">${text}</span>`;
}

function infoRow(label: string, value: string): string {
  return `
    <tr>
      <td style="padding:10px 16px;font-size:13px;color:#6b7280;font-family:system-ui,sans-serif;border-bottom:1px solid rgba(255,255,255,0.04);">${label}</td>
      <td style="padding:10px 16px;font-size:13px;color:#f9fafb;text-align:right;font-family:system-ui,sans-serif;border-bottom:1px solid rgba(255,255,255,0.04);">${value}</td>
    </tr>`;
}

// ─── 1. Verification Email ────────────────────────────────────────────────────

export async function sendVerificationEmail(email: string, token: string): Promise<void> {
  const link = `${APP_URL}/api/auth/verify-email?token=${token}`;
  await send(
    email,
    `Verify your Velxo Shop account`,
    wrap(
      header("#7c3aed", "⚡"),
      `<p style="margin:0 0 6px;font-size:13px;color:#7c3aed;font-weight:600;font-family:system-ui,sans-serif;text-transform:uppercase;letter-spacing:1px;">ACCOUNT SETUP</p>
       <h1 style="margin:0 0 16px;font-size:26px;font-weight:800;color:#f9fafb;font-family:system-ui,sans-serif;line-height:1.2;">Confirm your email address</h1>
       <p style="margin:0 0 24px;font-size:15px;color:#9ca3af;line-height:1.7;font-family:system-ui,sans-serif;">
         You're one step away from accessing premium digital products at the best prices. Click below to verify your email and activate your account.
       </p>
       <div style="margin:28px 0;text-align:center;">
         ${btn(link, "Verify My Email →", "#7c3aed")}
       </div>
       ${divider()}
       <p style="margin:0;font-size:12px;color:#4b5563;font-family:system-ui,sans-serif;">
         This link expires in 24 hours. If you didn't create an account, you can safely ignore this email.
       </p>`
    )
  );
}

// ─── 2. Password Reset ────────────────────────────────────────────────────────

export async function sendPasswordResetEmail(email: string, token: string): Promise<void> {
  const link = `${APP_URL}/auth/reset-password?token=${token}`;
  await send(
    email,
    `Reset your Velxo Shop password`,
    wrap(
      header("#dc2626", "🔐"),
      `<p style="margin:0 0 6px;font-size:13px;color:#ef4444;font-weight:600;font-family:system-ui,sans-serif;text-transform:uppercase;letter-spacing:1px;">SECURITY</p>
       <h1 style="margin:0 0 16px;font-size:26px;font-weight:800;color:#f9fafb;font-family:system-ui,sans-serif;line-height:1.2;">Reset your password</h1>
       <p style="margin:0 0 24px;font-size:15px;color:#9ca3af;line-height:1.7;font-family:system-ui,sans-serif;">
         We received a request to reset the password for your Velxo Shop account. Click the button below to set a new password.
       </p>
       <div style="margin:28px 0;text-align:center;">
         ${btn(link, "Reset Password", "#dc2626")}
       </div>
       ${divider()}
       <p style="margin:0;font-size:12px;color:#4b5563;font-family:system-ui,sans-serif;">
         This link expires in 60 minutes. If you didn't request a password reset, your account is safe — no action needed.
       </p>`
    )
  );
}

// ─── 3. Welcome Email ─────────────────────────────────────────────────────────

export async function sendWelcomeEmail(email: string): Promise<void> {
  await send(
    email,
    `Welcome to Velxo Shop 🎉`,
    wrap(
      header("#059669", "🎉"),
      `<p style="margin:0 0 6px;font-size:13px;color:#10b981;font-weight:600;font-family:system-ui,sans-serif;text-transform:uppercase;letter-spacing:1px;">YOU'RE IN</p>
       <h1 style="margin:0 0 16px;font-size:26px;font-weight:800;color:#f9fafb;font-family:system-ui,sans-serif;line-height:1.2;">Welcome to Velxo Shop!</h1>
       <p style="margin:0 0 20px;font-size:15px;color:#9ca3af;line-height:1.7;font-family:system-ui,sans-serif;">
         Your account is ready. You now have access to 500+ premium digital products — streaming subscriptions, AI tools, software licenses, and gaming products — all at the best prices with instant delivery.
       </p>
       <table width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0;">
         <tr>
           <td style="padding:14px 16px;background:rgba(16,185,129,0.08);border:1px solid rgba(16,185,129,0.15);border-radius:10px;margin-bottom:8px;">
             <p style="margin:0;font-size:14px;color:#f9fafb;font-weight:600;font-family:system-ui,sans-serif;">⚡ Instant Delivery</p>
             <p style="margin:4px 0 0;font-size:13px;color:#6b7280;font-family:system-ui,sans-serif;">Credentials sent to your inbox seconds after payment</p>
           </td>
         </tr>
         <tr><td style="height:8px;"></td></tr>
         <tr>
           <td style="padding:14px 16px;background:rgba(124,58,237,0.08);border:1px solid rgba(124,58,237,0.15);border-radius:10px;">
             <p style="margin:0;font-size:14px;color:#f9fafb;font-weight:600;font-family:system-ui,sans-serif;">💰 Earn While You Share</p>
             <p style="margin:4px 0 0;font-size:13px;color:#6b7280;font-family:system-ui,sans-serif;">Join our affiliate program and earn 10% on every referral</p>
           </td>
         </tr>
       </table>
       <div style="margin:28px 0;text-align:center;">
         ${btn(`${APP_URL}/products`, "Browse Products →", "#059669")}
       </div>`
    )
  );
}

// ─── 4. Delivery Email ────────────────────────────────────────────────────────

export async function sendDeliveryEmail(email: string, orderDetails: object): Promise<void> {
  const d = orderDetails as Record<string, unknown>;
  const credentials = d.credentials as string | undefined;
  const orderId = d.orderId ? `VLX-${String(d.orderId).slice(-6).toUpperCase()}` : "N/A";
  const productTitle = String(d.productTitle ?? "Your Product");
  const invoiceUrl = d.orderId ? `${APP_URL}/invoice/${d.orderId}` : `${APP_URL}/dashboard`;

  const credBlock = credentials
    ? `<div style="margin:20px 0;padding:18px 20px;background:#0d1117;border:1px solid rgba(124,58,237,0.3);border-radius:12px;font-family:'Courier New',monospace;font-size:15px;color:#c4b5fd;word-break:break-all;letter-spacing:0.5px;">${credentials}</div>`
    : "";

  await send(
    email,
    `✅ Your order is ready — ${productTitle}`,
    wrap(
      header("#059669", "✅"),
      `<p style="margin:0 0 6px;font-size:13px;color:#10b981;font-weight:600;font-family:system-ui,sans-serif;text-transform:uppercase;letter-spacing:1px;">ORDER DELIVERED</p>
       <h1 style="margin:0 0 8px;font-size:26px;font-weight:800;color:#f9fafb;font-family:system-ui,sans-serif;line-height:1.2;">Your product is ready!</h1>
       <p style="margin:0 0 24px;font-size:15px;color:#9ca3af;line-height:1.7;font-family:system-ui,sans-serif;">
         Your order for <strong style="color:#f9fafb;">${productTitle}</strong> has been delivered. Find your credentials below.
       </p>
       <table width="100%" cellpadding="0" cellspacing="0" style="background:#0d1117;border:1px solid rgba(255,255,255,0.06);border-radius:12px;overflow:hidden;margin:0 0 20px;">
         ${infoRow("Order Reference", orderId)}
         ${infoRow("Product", productTitle)}
         ${infoRow("Status", "✅ Delivered")}
       </table>
       ${credentials ? `
         <p style="margin:0 0 8px;font-size:13px;font-weight:600;color:#c4b5fd;font-family:system-ui,sans-serif;text-transform:uppercase;letter-spacing:0.5px;">YOUR CREDENTIALS</p>
         ${credBlock}
         <p style="margin:0 0 20px;font-size:12px;color:#4b5563;font-family:system-ui,sans-serif;">
           🔒 Keep these credentials private. Do not share them with anyone.
         </p>
       ` : `<p style="margin:0 0 20px;font-size:14px;color:#9ca3af;font-family:system-ui,sans-serif;">Your order is being processed and will be delivered shortly.</p>`}
       <div style="text-align:center;margin:24px 0;">
         ${btn(invoiceUrl, "View Invoice", "#059669")}
       </div>`
    )
  );
}

// ─── 5. Account Lockout ───────────────────────────────────────────────────────

export async function sendLockoutEmail(email: string): Promise<void> {
  await send(
    email,
    `⚠️ Your Velxo Shop account has been temporarily locked`,
    wrap(
      header("#d97706", "⚠️"),
      `<p style="margin:0 0 6px;font-size:13px;color:#f59e0b;font-weight:600;font-family:system-ui,sans-serif;text-transform:uppercase;letter-spacing:1px;">SECURITY ALERT</p>
       <h1 style="margin:0 0 16px;font-size:26px;font-weight:800;color:#f9fafb;font-family:system-ui,sans-serif;line-height:1.2;">Account temporarily locked</h1>
       <p style="margin:0 0 20px;font-size:15px;color:#9ca3af;line-height:1.7;font-family:system-ui,sans-serif;">
         We detected multiple failed login attempts on your account. To protect your account, it has been locked for 15 minutes.
       </p>
       <div style="padding:16px 20px;background:rgba(245,158,11,0.08);border:1px solid rgba(245,158,11,0.2);border-radius:10px;margin:0 0 24px;">
         <p style="margin:0;font-size:14px;color:#fbbf24;font-family:system-ui,sans-serif;">If this was you, wait 15 minutes and try again. If not, reset your password immediately.</p>
       </div>
       <div style="text-align:center;">
         ${btn(`${APP_URL}/auth/forgot-password`, "Reset Password", "#d97706")}
       </div>`
    )
  );
}

// ─── 6. Invoice Created ───────────────────────────────────────────────────────

export async function sendInvoiceCreatedEmail(
  email: string,
  orderId: string,
  productTitle: string,
  amount: number,
  paymentProvider: string
): Promise<void> {
  const invoiceUrl = `${APP_URL}/invoice/${orderId}`;
  const invoiceNum = `VLX-${orderId.slice(-6).toUpperCase()}`;

  const paymentLabels: Record<string, string> = {
    nowpayments: "Crypto (NOWPayments)",
    balance: "Wallet Balance",
    binance_gift_card: "Binance Gift Card",
    discord: "Discord Manual",
  };

  const paymentInstructions: Record<string, string> = {
    nowpayments: "Click the button below to complete your crypto payment. Your product will be delivered instantly once confirmed.",
    binance_gift_card: "Follow the instructions on your invoice to purchase and submit a Binance USDT Gift Card.",
    discord: "Join our Discord server and share your order reference to complete payment.",
    balance: "Your wallet balance has been charged. Your product is being delivered now.",
  };

  const instruction = paymentInstructions[paymentProvider] ?? "Visit your invoice to complete payment.";

  await send(
    email,
    `Invoice ${invoiceNum} — Complete your payment`,
    wrap(
      header("#7c3aed", "🧾"),
      `<p style="margin:0 0 6px;font-size:13px;color:#a78bfa;font-weight:600;font-family:system-ui,sans-serif;text-transform:uppercase;letter-spacing:1px;">NEW ORDER</p>
       <h1 style="margin:0 0 8px;font-size:26px;font-weight:800;color:#f9fafb;font-family:system-ui,sans-serif;line-height:1.2;">Your invoice is ready</h1>
       <p style="margin:0 0 24px;font-size:15px;color:#9ca3af;line-height:1.7;font-family:system-ui,sans-serif;">${instruction}</p>
       <table width="100%" cellpadding="0" cellspacing="0" style="background:#0d1117;border:1px solid rgba(255,255,255,0.06);border-radius:12px;overflow:hidden;margin:0 0 24px;">
         ${infoRow("Invoice", invoiceNum)}
         ${infoRow("Product", productTitle)}
         ${infoRow("Amount", `$${amount.toFixed(2)} USD`)}
         ${infoRow("Payment Method", paymentLabels[paymentProvider] ?? paymentProvider)}
       </table>
       <div style="text-align:center;margin:24px 0;">
         ${btn(invoiceUrl, "View Invoice & Pay →", "#7c3aed")}
       </div>
       <p style="margin:0;font-size:12px;color:#4b5563;text-align:center;font-family:system-ui,sans-serif;">
         Invoice link: <a href="${invoiceUrl}" style="color:#7c3aed;text-decoration:none;">${invoiceUrl}</a>
       </p>`
    )
  );
}

// ─── 7. Invoice Reminder ──────────────────────────────────────────────────────

export async function sendInvoiceReminderEmail(
  email: string,
  orderId: string,
  productTitle: string,
  amount: number
): Promise<void> {
  const invoiceUrl = `${APP_URL}/invoice/${orderId}`;
  const invoiceNum = `VLX-${orderId.slice(-6).toUpperCase()}`;

  await send(
    email,
    `⏰ Don't miss out — your order is waiting`,
    wrap(
      header("#d97706", "⏰"),
      `<p style="margin:0 0 6px;font-size:13px;color:#f59e0b;font-weight:600;font-family:system-ui,sans-serif;text-transform:uppercase;letter-spacing:1px;">PAYMENT REMINDER</p>
       <h1 style="margin:0 0 16px;font-size:26px;font-weight:800;color:#f9fafb;font-family:system-ui,sans-serif;line-height:1.2;">You left something behind</h1>
       <p style="margin:0 0 20px;font-size:15px;color:#9ca3af;line-height:1.7;font-family:system-ui,sans-serif;">
         Your order for <strong style="color:#f9fafb;">${productTitle}</strong> is still waiting for payment. Complete it now to get instant access.
       </p>
       <div style="padding:20px 24px;background:linear-gradient(135deg,rgba(245,158,11,0.08),rgba(124,58,237,0.08));border:1px solid rgba(245,158,11,0.2);border-radius:12px;text-align:center;margin:0 0 24px;">
         <p style="margin:0 0 4px;font-size:32px;font-weight:800;color:#f9fafb;font-family:system-ui,sans-serif;">$${amount.toFixed(2)}</p>
         <p style="margin:0 0 4px;font-size:14px;color:#9ca3af;font-family:system-ui,sans-serif;">${productTitle}</p>
         <p style="margin:0;font-size:12px;color:#6b7280;font-family:monospace;">${invoiceNum}</p>
       </div>
       <div style="text-align:center;margin:24px 0;">
         ${btn(invoiceUrl, "Complete Payment Now →", "#d97706")}
       </div>
       <p style="margin:0;font-size:12px;color:#4b5563;text-align:center;font-family:system-ui,sans-serif;">
         Questions? <a href="${APP_URL}/support" style="color:#a78bfa;text-decoration:none;">Contact support</a>
       </p>`
    )
  );
}

// ─── 8. Partner Payout ────────────────────────────────────────────────────────

export async function sendPayoutNotificationEmail(
  email: string,
  action: "approved" | "rejected",
  amount: number,
  txHash?: string | null
): Promise<void> {
  const isApproved = action === "approved";
  const accentColor = isApproved ? "#059669" : "#dc2626";
  const emoji = isApproved ? "💸" : "❌";

  await send(
    email,
    isApproved ? `💸 Payout of $${amount.toFixed(2)} sent to your wallet` : `Payout request update — Velxo Shop`,
    wrap(
      header(accentColor, emoji),
      isApproved
        ? `<p style="margin:0 0 6px;font-size:13px;color:#10b981;font-weight:600;font-family:system-ui,sans-serif;text-transform:uppercase;letter-spacing:1px;">PAYOUT APPROVED</p>
           <h1 style="margin:0 0 16px;font-size:26px;font-weight:800;color:#f9fafb;font-family:system-ui,sans-serif;line-height:1.2;">Your payout is on its way!</h1>
           <p style="margin:0 0 20px;font-size:15px;color:#9ca3af;line-height:1.7;font-family:system-ui,sans-serif;">
             Your payout of <strong style="color:#f9fafb;">$${amount.toFixed(2)}</strong> has been approved and sent to your crypto wallet.
           </p>
           ${txHash ? `<div style="padding:14px 18px;background:#0d1117;border:1px solid rgba(16,185,129,0.2);border-radius:10px;margin:0 0 20px;"><p style="margin:0 0 4px;font-size:12px;color:#6b7280;font-family:system-ui,sans-serif;">Transaction Hash</p><p style="margin:0;font-size:13px;color:#a78bfa;font-family:monospace;word-break:break-all;">${txHash}</p></div>` : ""}
           <div style="text-align:center;margin:24px 0;">
             ${btn(`${APP_URL}/dashboard/partner`, "View Partner Dashboard", "#059669")}
           </div>`
        : `<p style="margin:0 0 6px;font-size:13px;color:#ef4444;font-weight:600;font-family:system-ui,sans-serif;text-transform:uppercase;letter-spacing:1px;">PAYOUT UPDATE</p>
           <h1 style="margin:0 0 16px;font-size:26px;font-weight:800;color:#f9fafb;font-family:system-ui,sans-serif;line-height:1.2;">Payout request rejected</h1>
           <p style="margin:0 0 20px;font-size:15px;color:#9ca3af;line-height:1.7;font-family:system-ui,sans-serif;">
             Your payout request of <strong style="color:#f9fafb;">$${amount.toFixed(2)}</strong> was not approved. The amount has been returned to your partner balance.
           </p>
           <div style="text-align:center;margin:24px 0;">
             ${btn(`${APP_URL}/support`, "Contact Support", "#dc2626")}
           </div>`
    )
  );
}

// ─── 9. Restock Notification ──────────────────────────────────────────────────

export async function sendRestockEmail(email: string, productTitle: string, productId: string): Promise<void> {
  const productUrl = `${APP_URL}/products/${productId}`;
  await send(
    email,
    `🔔 ${productTitle} is back in stock!`,
    wrap(
      header("#7c3aed", "🔔"),
      `<p style="margin:0 0 6px;font-size:13px;color:#a78bfa;font-weight:600;font-family:system-ui,sans-serif;text-transform:uppercase;letter-spacing:1px;">BACK IN STOCK</p>
       <h1 style="margin:0 0 16px;font-size:26px;font-weight:800;color:#f9fafb;font-family:system-ui,sans-serif;line-height:1.2;">It's back — grab it now!</h1>
       <p style="margin:0 0 20px;font-size:15px;color:#9ca3af;line-height:1.7;font-family:system-ui,sans-serif;">
         <strong style="color:#f9fafb;">${productTitle}</strong> is back in stock and ready to order. You asked to be notified — don't miss out, stock is limited.
       </p>
       <div style="padding:16px 20px;background:rgba(124,58,237,0.08);border:1px solid rgba(124,58,237,0.2);border-radius:10px;margin:0 0 24px;">
         <p style="margin:0;font-size:14px;color:#c4b5fd;font-family:system-ui,sans-serif;">⚡ Instant delivery after payment · 🔒 Secure checkout · 🔄 Replacement guarantee</p>
       </div>
       <div style="text-align:center;margin:24px 0;">
         ${btn(productUrl, "Buy Now →", "#7c3aed")}
       </div>`
    )
  );
}

// ─── 10. Admin Alerts ─────────────────────────────────────────────────────────

export async function sendAdminLowStockAlert(productTitle: string, stockCount: number): Promise<void> {
  const isDuplicate = stockCount === -1;
  const subject = isDuplicate
    ? `🚨 Duplicate delivery detected — ${APP_NAME}`
    : `⚠️ Low stock: ${productTitle} (${stockCount} left)`;

  const body = isDuplicate
    ? `<h2 style="margin:0 0 12px;color:#ef4444;font-size:20px;font-family:system-ui,sans-serif;">🚨 Duplicate Delivery Detected</h2>
       <p style="margin:0 0 16px;color:#9ca3af;font-size:14px;font-family:system-ui,sans-serif;">A duplicate delivery was detected for: <strong style="color:#f9fafb;">${productTitle}</strong>. Investigate immediately.</p>`
    : `<h2 style="margin:0 0 12px;color:#f59e0b;font-size:20px;font-family:system-ui,sans-serif;">⚠️ Low Stock Alert</h2>
       <p style="margin:0 0 16px;color:#9ca3af;font-size:14px;font-family:system-ui,sans-serif;"><strong style="color:#f9fafb;">${productTitle}</strong> has only <strong style="color:#ef4444;">${stockCount}</strong> item(s) left.</p>
       <div style="text-align:center;">${btn(`${APP_URL}/admin/products`, "Add Inventory", "#d97706")}</div>`;

  await send(ADMIN_EMAIL, subject, wrap(header(isDuplicate ? "#dc2626" : "#d97706", isDuplicate ? "🚨" : "⚠️"), body));
}

export async function sendAdminPendingStockAlert(orderId: string, productTitle: string): Promise<void> {
  const invoiceNum = `VLX-${orderId.slice(-6).toUpperCase()}`;
  await send(
    ADMIN_EMAIL,
    `📦 Order ${invoiceNum} needs manual fulfillment`,
    wrap(
      header("#d97706", "📦"),
      `<h2 style="margin:0 0 12px;color:#f59e0b;font-size:20px;font-family:system-ui,sans-serif;">Order Awaiting Stock</h2>
       <p style="margin:0 0 16px;color:#9ca3af;font-size:14px;font-family:system-ui,sans-serif;">
         Order <strong style="color:#f9fafb;">${invoiceNum}</strong> for <strong style="color:#f9fafb;">${productTitle}</strong> could not be auto-delivered — no inventory available.
       </p>
       <div style="text-align:center;">${btn(`${APP_URL}/admin/orders`, "View Orders", "#d97706")}</div>`
    )
  );
}

// ─── 11. Bulk/Marketing Email ─────────────────────────────────────────────────

export async function sendMarketingEmail(
  email: string,
  subject: string,
  message: string
): Promise<void> {
  const paragraphs = message.split("\n\n").filter(Boolean);
  const bodyHtml = paragraphs.map((para) =>
    `<p style="margin:0 0 16px;font-size:15px;color:#9ca3af;line-height:1.8;font-family:system-ui,sans-serif;">${para.replace(/\n/g, "<br>")}</p>`
  ).join("");

  await send(
    email,
    subject,
    wrap(
      header("#7c3aed", "⚡"),
      `<h1 style="margin:0 0 20px;font-size:24px;font-weight:800;color:#f9fafb;font-family:system-ui,sans-serif;line-height:1.3;">${subject}</h1>
       ${bodyHtml}
       ${divider()}
       <div style="text-align:center;margin:24px 0;">
         ${btn(`${APP_URL}/products`, "Browse Products →", "#7c3aed")}
       </div>
       <p style="margin:0;font-size:12px;color:#374151;text-align:center;font-family:system-ui,sans-serif;">
         <a href="${APP_URL}/deals" style="color:#a78bfa;text-decoration:none;">Today's Deals</a> &nbsp;·&nbsp;
         <a href="${APP_URL}/support" style="color:#a78bfa;text-decoration:none;">Support</a>
       </p>`
    )
  );
}

// ─── Resend Contact Events ────────────────────────────────────────────────────

export async function trackEvent(email: string, event: string, data?: Record<string, unknown>): Promise<void> {
  if (!process.env.RESEND_API_KEY) return;
  try {
    await fetch("https://api.resend.com/contacts/events", {
      method: "POST",
      headers: { "Authorization": `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ event, email, ...(data ? { data } : {}) }),
    });
  } catch (err) {
    console.warn(`[trackEvent] Failed to track "${event}" for ${email}:`, err);
  }
}
