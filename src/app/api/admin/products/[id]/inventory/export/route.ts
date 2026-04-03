import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { decrypt } from "@/lib/crypto";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
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

  const items = await db.inventoryItem.findMany({
    where: { productId: params.id },
  });

  const lines = items.map((item: { encryptedData: string; iv: string; authTag: string }) =>
    decrypt(item.encryptedData, item.iv, item.authTag)
  );

  return new NextResponse(lines.join("\n"), {
    status: 200,
    headers: {
      "Content-Type": "text/plain",
      "Content-Disposition": `attachment; filename="inventory-${params.id}.txt"`,
    },
  });
}
