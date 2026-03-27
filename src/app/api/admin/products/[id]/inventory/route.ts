import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { encrypt } from "@/lib/crypto";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession();

  if (!session) {
    return NextResponse.json(
      { data: null, error: "Unauthorized", meta: {} },
      { status: 401 }
    );
  }

  if (session.user.role !== "ADMIN") {
    return NextResponse.json(
      { data: null, error: "Forbidden", meta: {} },
      { status: 403 }
    );
  }

  const product = await db.product.findUnique({ where: { id: params.id } });
  if (!product) {
    return NextResponse.json(
      { data: null, error: "Product not found", meta: {} },
      { status: 404 }
    );
  }

  const body = await req.text();
  const lines = body
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (lines.length === 0) {
    return NextResponse.json(
      { data: { imported: 0 }, error: null, meta: {} },
      { status: 200 }
    );
  }

  const inventoryData = lines.map((line) => {
    const { encryptedData, iv, authTag } = encrypt(line);
    return {
      productId: params.id,
      encryptedData,
      iv,
      authTag,
    };
  });

  await db.$transaction([
    db.inventoryItem.createMany({ data: inventoryData }),
    db.product.update({
      where: { id: params.id },
      data: { stockCount: { increment: lines.length } },
    }),
  ]);

  return NextResponse.json(
    { data: { imported: lines.length }, error: null, meta: {} },
    { status: 200 }
  );
}
