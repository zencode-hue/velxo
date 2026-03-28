import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { token } = await req.json();
    if (token !== process.env.ADMIN_SETUP_TOKEN) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const products = await db.product.findMany({ select: { id: true } });

    // Give each product a random rating between 4.2 and 5.0
    await Promise.all(products.map((p) => {
      const rating = (4.2 + Math.random() * 0.8).toFixed(2);
      return db.product.update({
        where: { id: p.id },
        data: { avgRating: parseFloat(rating) },
      });
    }));

    return NextResponse.json({ message: `Updated ratings for ${products.length} products.` });
  } catch (err) {
    console.error("[seed-ratings]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
