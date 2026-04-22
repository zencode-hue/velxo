import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { encrypt } from "@/lib/crypto";

export const dynamic = "force-dynamic";

async function checkAdmin() {
  const session = await getServerSession();
  if (!session || session.user.role !== "ADMIN") return null;
  return session;
}

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!(await checkAdmin())) {
    return NextResponse.json({ data: null, error: "Unauthorized", meta: {} }, { status: 401 });
  }

  const product = await db.product.findUnique({ where: { id: params.id } });
  if (!product) {
    return NextResponse.json({ data: null, error: "Product not found", meta: {} }, { status: 404 });
  }

  const [available, delivered] = await Promise.all([
    db.inventoryItem.count({ where: { productId: params.id, status: "AVAILABLE" } }),
    db.inventoryItem.count({ where: { productId: params.id, status: "DELIVERED" } }),
  ]);

  return NextResponse.json({
    data: {
      stockCount: product.stockCount,
      // unlimitedStock is available after prisma db push regenerates the client
      unlimitedStock: false,
      available,
      delivered,
    },
    error: null,
    meta: {},
  });
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!(await checkAdmin())) {
    return NextResponse.json({ data: null, error: "Unauthorized", meta: {} }, { status: 401 });
  }

  const product = await db.product.findUnique({ where: { id: params.id } });
  if (!product) {
    return NextResponse.json({ data: null, error: "Product not found", meta: {} }, { status: 404 });
  }

  const body = await req.text();
  const lines = body
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (lines.length === 0) {
    return NextResponse.json({ data: { imported: 0 }, error: null, meta: {} }, { status: 200 });
  }

  const inventoryData = lines.map((line) => {
    try {
      const { encryptedData, iv, authTag } = encrypt(line);
      return { productId: params.id, encryptedData, iv, authTag };
    } catch (err) {
      console.error("[inventory encrypt error]", err);
      throw new Error("Encryption failed — check ENCRYPTION_KEY env var");
    }
  });

  await db.$transaction([
    db.inventoryItem.createMany({ data: inventoryData }),
    db.product.update({
      where: { id: params.id },
      data: { stockCount: { increment: lines.length } },
    }),
  ]);

  // Notify users who requested restock alerts
  try {
    const key = `stock_notify_${params.id}`;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const notifySetting = await (db as any).siteSetting.findUnique({ where: { key } });
    if (notifySetting) {
      const emails: string[] = JSON.parse(notifySetting.value);
      if (emails.length > 0) {
        const { sendRestockEmail } = await import("@/lib/email");
        for (const email of emails) {
          await sendRestockEmail(email, product.title, params.id).catch(() => {});
        }
        // Clear the list after notifying
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (db as any).siteSetting.update({ where: { key }, data: { value: "[]" } });
      }
    }
  } catch { /* non-fatal */ }

  return NextResponse.json({ data: { imported: lines.length }, error: null, meta: {} }, { status: 200 });
}
