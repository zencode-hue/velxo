import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdminApi } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

const bodySchema = z.object({
  to: z.enum(["all", "custom", "order"]),
  customEmail: z.string().email().optional(),
  subject: z.string().min(1).max(200),
  message: z.string().min(1).max(5000),
  type: z.enum(["announcement", "order_reminder", "custom"]).default("custom"),
  orderId: z.string().optional(),
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
<body style="margin:0;padding:0;background:#0d0a07;font-family:system-ui,sans-serif;color:#f9fafb;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0d0a07;padding:40px 0;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#111;border:1px solid #3d2a10;border-radius:12px;overflow:hidden;">
        <tr><td style="background:linear-gradient(135deg,#ea580c,#f97316);padding:24px 32px;">
          <span style="font-size:22px;font-weight:700;color:#fff;">${APP_NAME}</span>
        </td></tr>
        <tr><td style="padding:32px;">
          <div style="color:#d1d5db;line-height:1.7;font-size:15px;white-space:pre-wrap;">${message}</div>
          <div style="margin-top:28px;">
            <a href="${APP_URL}/products" style="display:inline-block;padding:12px 28px;background:linear-gradient(135deg,#ea580c,#f97316);color:#fff;text-decoration:none;border-radius:8px;font-weight:600;font-size:14px;">Browse Products</a>
          </div>
        </td></tr>
        <tr><td style="padding:16px 32px;border-top:1px solid #3d2a10;font-size:12px;color:#6b7280;text-align:center;">
          © ${new Date().getFullYear()} ${APP_NAME}. All rights reserved.
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export async function POST(req: NextRequest) {
  const { error } = await requireAdminApi();
  if (error) return error;

  try {
    const body = await req.json();
    const parsed = bodySchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });

    const { to, customEmail, subject, message, type, orderId } = parsed.data;

    // Order reminder — send to specific order's customer
    if ((type === "order_reminder" || to === "order") && orderId) {
      const order = await db.order.findUnique({
        where: { id: orderId },
        include: { user: { select: { email: true } }, product: { select: { title: true } } },
      });
      if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });
      const email = order.user?.email ?? (order as { guestEmail?: string | null }).guestEmail;
      if (!email) return NextResponse.json({ error: "No email for this order" }, { status: 400 });

      const orderMessage = message || `Hi,\n\nThis is a reminder about your order for ${order.product.title} (Order ID: ${orderId}).\n\n${message}`;
      await sendEmail(email, subject, buildHtml(subject, orderMessage));
      return NextResponse.json({ ok: true, sent: 1 });
    }

    // Custom single email
    if (to === "custom" && customEmail) {
      await sendEmail(customEmail, subject, buildHtml(subject, message));
      return NextResponse.json({ ok: true, sent: 1 });
    }

    // Bulk to all users
    if (to === "all") {
      const users = await db.user.findMany({
        where: { emailVerified: { not: null } },
        select: { email: true },
        take: 500,
      });

      let sent = 0;
      const errors: string[] = [];
      for (const user of users) {
        try {
          await sendEmail(user.email, subject, buildHtml(subject, message));
          sent++;
          // Small delay to avoid rate limits
          await new Promise((r) => setTimeout(r, 100));
        } catch (e) {
          errors.push(user.email);
        }
      }

      return NextResponse.json({ ok: true, sent, errors: errors.length });
    }

    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  } catch (err) {
    console.error("[send-email]", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
