import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdminApi } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

const bodySchema = z.object({
  to: z.enum(["all", "customers", "guests", "custom", "order"]),
  customEmail: z.string().email().optional(),
  subject: z.string().min(1).max(200),
  message: z.string().min(1).max(5000),
  type: z.enum(["announcement", "order_reminder", "custom"]).default("custom"),
  orderId: z.string().optional(),
  // preview mode — just return the count, don't send
  preview: z.boolean().optional(),
});

async function sendEmail(to: string, subject: string, htmlBody: string) {
  const FROM = process.env.EMAIL_FROM ?? "noreply@velxo.shop";
  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) throw new Error("RESEND_API_KEY not configured");
  const { Resend } = await import("resend");
  const resend = new Resend(resendKey);
  await resend.emails.send({ from: FROM, to, subject, html: htmlBody });
}

function buildHtml(subject: string, message: string): string {
  const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME ?? "Velxo Shop";
  const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://velxo.shop";
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>${subject}</title></head>
<body style="margin:0;padding:0;background:#000;font-family:system-ui,sans-serif;color:#f9fafb;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#000;padding:40px 0;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#0a0a0a;border:1px solid rgba(167,139,250,0.2);border-radius:12px;overflow:hidden;">
        <tr><td style="background:linear-gradient(135deg,#7c3aed,#a78bfa);padding:24px 32px;">
          <span style="font-size:22px;font-weight:700;color:#fff;">${APP_NAME}</span>
        </td></tr>
        <tr><td style="padding:32px;">
          <div style="color:#d1d5db;line-height:1.8;font-size:15px;white-space:pre-wrap;">${message}</div>
          <div style="margin-top:32px;">
            <a href="${APP_URL}/products" style="display:inline-block;padding:12px 28px;background:linear-gradient(135deg,#7c3aed,#a78bfa);color:#fff;text-decoration:none;border-radius:8px;font-weight:600;font-size:14px;">Browse Products</a>
          </div>
        </td></tr>
        <tr><td style="padding:16px 32px;border-top:1px solid rgba(255,255,255,0.06);font-size:12px;color:#6b7280;text-align:center;">
          © ${new Date().getFullYear()} ${APP_NAME}. All rights reserved. &nbsp;·&nbsp;
          <a href="${APP_URL}" style="color:#a78bfa;text-decoration:none;">${APP_URL}</a>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

/**
 * Collect all unique emails for a given audience.
 * - "all"       = registered users + guest order emails + restock subscribers
 * - "customers" = registered users only (all, including unverified, non-banned)
 * - "guests"    = guest order emails only (never registered)
 */
async function collectEmails(audience: "all" | "customers" | "guests"): Promise<string[]> {
  const emailSet = new Set<string>();

  if (audience === "all" || audience === "customers") {
    // All non-banned registered users
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const users = await (db.user.findMany as any)({
      where: { isBanned: false },
      select: { email: true },
    }) as { email: string }[];
    for (const u of users) emailSet.add(u.email.toLowerCase());
  }

  if (audience === "all" || audience === "guests") {
    // Guest emails from orders (never registered)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const guestOrders = await (db.order.findMany as any)({
      where: { guestEmail: { not: null }, userId: null },
      select: { guestEmail: true },
      distinct: ["guestEmail"],
    }) as { guestEmail: string | null }[];
    for (const o of guestOrders) {
      if (o.guestEmail) emailSet.add(o.guestEmail.toLowerCase());
    }

    // Restock notification subscribers (stored as JSON arrays in SiteSetting)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const stockSettings = await (db as any).siteSetting.findMany({
      where: { key: { startsWith: "stock_notify_" } },
    }) as { key: string; value: string }[];
    for (const s of stockSettings) {
      try {
        const emails: string[] = JSON.parse(s.value);
        for (const e of emails) emailSet.add(e.toLowerCase());
      } catch { /* skip malformed */ }
    }
  }

  return Array.from(emailSet);
}

export async function POST(req: NextRequest) {
  const { error } = await requireAdminApi();
  if (error) return error;

  try {
    const body = await req.json();
    const parsed = bodySchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });

    const { to, customEmail, subject, message, type, orderId, preview } = parsed.data;

    // ── Order reminder ────────────────────────────────────────────────────────
    if ((type === "order_reminder" || to === "order") && orderId) {
      const order = await db.order.findUnique({
        where: { id: orderId },
        include: { user: { select: { email: true } }, product: { select: { title: true } } },
      });
      if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });
      const email = order.user?.email ?? (order as { guestEmail?: string | null }).guestEmail;
      if (!email) return NextResponse.json({ error: "No email for this order" }, { status: 400 });
      if (preview) return NextResponse.json({ count: 1, preview: true });
      await sendEmail(email, subject, buildHtml(subject, message));
      return NextResponse.json({ ok: true, sent: 1 });
    }

    // ── Single custom email ───────────────────────────────────────────────────
    if (to === "custom" && customEmail) {
      if (preview) return NextResponse.json({ count: 1, preview: true });
      await sendEmail(customEmail, subject, buildHtml(subject, message));
      return NextResponse.json({ ok: true, sent: 1 });
    }

    // ── Bulk send ─────────────────────────────────────────────────────────────
    if (to === "all" || to === "customers" || to === "guests") {
      const emails = await collectEmails(to);

      // Preview mode — just return the count
      if (preview) {
        return NextResponse.json({ count: emails.length, preview: true });
      }

      let sent = 0;
      let failed = 0;

      for (const email of emails) {
        try {
          await sendEmail(email, subject, buildHtml(subject, message));
          sent++;
          // 150ms delay between sends to stay within Resend rate limits
          await new Promise((r) => setTimeout(r, 150));
        } catch {
          failed++;
        }
      }

      return NextResponse.json({ ok: true, sent, failed, total: emails.length });
    }

    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  } catch (err) {
    console.error("[send-email]", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
