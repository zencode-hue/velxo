import { NextRequest, NextResponse } from "next/server";
import { getStaffSession } from "@/lib/staff-auth";
import { db } from "@/lib/db";
import { encrypt } from "@/lib/crypto";

export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getStaffSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const product = await db.product.findUnique({ where: { id: params.id } });
  if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });

  const [available, delivered] = await Promise.all([
    db.inventoryItem.count({ where: { productId: params.id, status: "AVAILABLE" } }),
    db.inventoryItem.count({ where: { productId: params.id, status: "DELIVERED" } }),
  ]);

  return NextResponse.json({
    data: { stockCount: product.stockCount, unlimitedStock: (product as { unlimitedStock?: boolean }).unlimitedStock ?? false, available, delivered },
    error: null,
  });
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getStaffSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const product = await db.product.findUnique({ where: { id: params.id } });
  if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });

  const body = await req.text();
  const lines = body.split("\n").map((l) => l.trim()).filter((l) => l.length > 0);

  if (lines.length === 0) return NextResponse.json({ data: { imported: 0 }, error: null });

  const inventoryData = lines.map((line) => {
    const { encryptedData, iv, authTag } = encrypt(line);
    return { productId: params.id, encryptedData, iv, authTag };
  });

  await db.$transaction([
    db.inventoryItem.createMany({ data: inventoryData }),
    db.product.update({ where: { id: params.id }, data: { stockCount: { increment: lines.length } } }),
  ]);

  return NextResponse.json({ data: { imported: lines.length }, error: null });
}
