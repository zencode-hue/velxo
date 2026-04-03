import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
import { db } from "@/lib/db";
import { getBearerSession } from "@/lib/bearer-auth";

export async function GET(req: NextRequest) {
  const token = await getBearerSession(req);
  if (!token?.id) {
    return NextResponse.json(
      { data: null, error: "Unauthorized: valid Bearer token required", meta: {} },
      { status: 401 }
    );
  }

  const orders = await db.order.findMany({
    where: { userId: token.id as string },
    orderBy: { createdAt: "desc" },
    select: {
      id: true, productId: true, amount: true, discountAmount: true,
      status: true, paymentProvider: true, createdAt: true, updatedAt: true,
      product: { select: { title: true, category: true } },
    },
  });

  return NextResponse.json({
    data: orders.map((o) => ({
      id: o.id,
      productId: o.productId,
      productTitle: o.product.title,
      productCategory: o.product.category,
      amount: Number(o.amount),
      discountAmount: Number(o.discountAmount),
      status: o.status,
      paymentProvider: o.paymentProvider,
      createdAt: o.createdAt,
      updatedAt: o.updatedAt,
    })),
    error: null,
    meta: { total: orders.length },
  });
}
