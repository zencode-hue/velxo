import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdminApi } from "@/lib/admin-auth";
import { z } from "zod";

export const dynamic = "force-dynamic";

const variantSchema = z.object({
  name: z.string().min(1).max(100),
  price: z.number().min(0),
  unlimitedStock: z.boolean().default(false),
  stockCount: z.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
});

// GET all variants for a product
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const { error } = await requireAdminApi();
  if (error) return error;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const variants = await (db as any).productVariant.findMany({
    where: { productId: params.id },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });
  return NextResponse.json({ data: variants, error: null });
}

// POST create a variant
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const { error } = await requireAdminApi();
  if (error) return error;

  const body = await req.json();
  const parsed = variantSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const variant = await (db as any).productVariant.create({
    data: { ...parsed.data, productId: params.id },
  });
  return NextResponse.json({ data: variant, error: null });
}

// PUT bulk replace all variants
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const { error } = await requireAdminApi();
  if (error) return error;

  const body = await req.json() as unknown[];
  const variants = z.array(variantSchema.extend({ id: z.string().optional() })).safeParse(body);
  if (!variants.success) return NextResponse.json({ error: "Invalid variants" }, { status: 400 });

  // Delete removed variants, upsert the rest
  const incoming = variants.data;
  const incomingIds = incoming.filter((v) => v.id).map((v) => v.id as string);

  await db.$transaction(async (tx) => {
    // Delete variants not in the new list
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (tx as any).productVariant.deleteMany({
      where: { productId: params.id, id: { notIn: incomingIds } },
    });

    for (let i = 0; i < incoming.length; i++) {
      const v = { ...incoming[i], sortOrder: i };
      if (v.id) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (tx as any).productVariant.update({
          where: { id: v.id },
          data: { name: v.name, price: v.price, unlimitedStock: v.unlimitedStock, stockCount: v.stockCount, isActive: v.isActive, sortOrder: v.sortOrder },
        });
      } else {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (tx as any).productVariant.create({
          data: { name: v.name, price: v.price, unlimitedStock: v.unlimitedStock, stockCount: v.stockCount, isActive: v.isActive, sortOrder: v.sortOrder, productId: params.id },
        });
      }
    }
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updated = await (db as any).productVariant.findMany({
    where: { productId: params.id },
    orderBy: [{ sortOrder: "asc" }],
  });
  return NextResponse.json({ data: updated, error: null });
}
