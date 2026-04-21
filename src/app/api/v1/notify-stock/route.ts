import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

const schema = z.object({
  productId: z.string().min(1),
  email: z.string().email(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });

    const { productId, email } = parsed.data;

    // Store in SiteSetting as a simple JSON list (no new table needed)
    const key = `stock_notify_${productId}`;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const existing = await (db as any).siteSetting.findUnique({ where: { key } });
    const emails: string[] = existing ? JSON.parse(existing.value) : [];

    if (!emails.includes(email.toLowerCase())) {
      emails.push(email.toLowerCase());
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (db as any).siteSetting.upsert({
        where: { key },
        update: { value: JSON.stringify(emails) },
        create: { key, value: JSON.stringify(emails) },
      });
    }

    return NextResponse.json({ data: { message: "You'll be notified when this product is back in stock." }, error: null });
  } catch (err) {
    console.error("[notify-stock]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
