import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getServerSession } from "@/lib/auth";

const updateSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().optional(),
  price: z.number().min(0).optional(),
  category: z.enum(["STREAMING", "AI_TOOLS", "SOFTWARE", "GAMING"]).optional(),
  imageUrl: z.string().url().optional().or(z.literal("")).optional(),
  isActive: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  unlimitedStock: z.boolean().optional(),
  stockCount: z.number().int().min(0).optional(),
});

async function requireAdmin() {
  const session = await getServerSession();
  if (!session?.user?.id || session.user.role !== "ADMIN") return null;
  return session;
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
    }

    const { imageUrl, ...rest } = parsed.data;
    const product = await db.product.update({
      where: { id: params.id },
      data: {
        ...rest,
        ...(imageUrl !== undefined ? { imageUrl: imageUrl === "" ? null : imageUrl } : {}),
      },
    });

    return NextResponse.json({ data: product, error: null });
  } catch (err) {
    console.error("[admin/products PATCH]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await db.product.delete({ where: { id: params.id } });
    return NextResponse.json({ data: { deleted: true }, error: null });
  } catch (err) {
    console.error("[admin/products DELETE]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
