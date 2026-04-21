import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-auth";
import { deliverOrder } from "@/lib/delivery";

export const dynamic = "force-dynamic";

const bodySchema = z.object({
  status: z.enum(["PENDING", "PAID", "FAILED", "PENDING_STOCK", "REFUNDED"]).optional(),
  adminNote: z.string().max(500).optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAdmin();
    const raw = await req.json();
    const parsed = bodySchema.safeParse(raw);
    if (!parsed.success) return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });

    const prevOrder = await db.order.findUnique({ where: { id: params.id }, select: { status: true, deliveryLog: { select: { id: true } } } });

    const order = await db.order.update({
      where: { id: params.id },
      data: parsed.data,
    });

    // If admin just set status to PAID and there's no delivery log yet, trigger delivery
    if (parsed.data.status === "PAID" && prevOrder?.status !== "PAID" && !prevOrder?.deliveryLog) {
      try {
        await deliverOrder(params.id);
      } catch (err) {
        console.error("[admin order PATCH] delivery failed:", err);
        // Don't fail the request — admin can use redeliver button
      }
    }

    return NextResponse.json({ data: order, error: null });
  } catch (err) {
    console.error("[PATCH /api/admin/orders/[id]]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
