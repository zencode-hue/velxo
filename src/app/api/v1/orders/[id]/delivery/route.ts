import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { decrypt } from "@/lib/crypto";
import { getBearerSession } from "@/lib/bearer-auth";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const token = await getBearerSession(req);
  if (!token?.id) {
    return NextResponse.json(
      { data: null, error: "Unauthorized: valid Bearer token required", meta: {} },
      { status: 401 }
    );
  }

  const order = await db.order.findFirst({
    where: { id: params.id, userId: token.id as string },
    include: {
      deliveryLog: {
        include: {
          inventoryItem: { select: { encryptedData: true, iv: true, authTag: true } },
        },
      },
    },
  });

  if (!order) {
    return NextResponse.json({ data: null, error: "Order not found", meta: {} }, { status: 404 });
  }

  if (!order.deliveryLog) {
    return NextResponse.json({ data: null, error: "No delivery found for this order", meta: {} }, { status: 404 });
  }

  let credentials: string | null = null;
  if (order.deliveryLog.inventoryItem) {
    try {
      const { encryptedData, iv, authTag } = order.deliveryLog.inventoryItem;
      credentials = decrypt(encryptedData, iv, authTag);
    } catch {
      credentials = null;
    }
  }

  return NextResponse.json({
    data: {
      orderId: order.id,
      deliveredAt: order.deliveryLog.deliveredAt,
      credentials,
    },
    error: null,
    meta: {},
  });
}
