import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { token } = await req.json();
    if (token !== process.env.ADMIN_SETUP_TOKEN) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const products = await db.product.findMany({ select: { id: true } });

    // Set all products to unlimitedStock=true and random stockCount 100-999
    await Promise.all(products.map((p) => {
      const stockCount = Math.floor(Math.random() * 900) + 100;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (db.product.update as any)({
        where: { id: p.id },
        data: { unlimitedStock: true, stockCount, isActive: true },
      });
    }));

    return NextResponse.json({ message: `Fixed ${products.length} products — all set to unlimited stock.` });
  } catch (err) {
    console.error("[fix-products]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
