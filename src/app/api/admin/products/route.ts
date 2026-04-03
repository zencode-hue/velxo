import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
import { z } from "zod";
import { db } from "@/lib/db";
import { getServerSession } from "@/lib/auth";

const createSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  price: z.number().min(0),
  category: z.enum(["STREAMING", "AI_TOOLS", "SOFTWARE", "GAMING"]),
  imageUrl: z.string().url().optional().or(z.literal("")),
  isActive: z.boolean().default(true),
  unlimitedStock: z.boolean().default(false),
});

export async function POST(req: NextRequest) {
  const session = await getServerSession();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
    }

    const { title, description, price, category, imageUrl, isActive, unlimitedStock } = parsed.data;

    const product = await db.product.create({
      data: {
        title,
        description: description ?? "",
        price,
        category,
        imageUrl: imageUrl || null,
        isActive,
        unlimitedStock,
      },
    });

    return NextResponse.json({ data: product, error: null }, { status: 201 });
  } catch (err) {
    console.error("[admin/products POST]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
