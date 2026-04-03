import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
import { z } from "zod";
import { db } from "@/lib/db";
import { sanitizeString } from "@/lib/sanitize";

const VALID_CATEGORIES = ["STREAMING", "AI_TOOLS", "SOFTWARE", "GAMING"] as const;
type ValidCategory = (typeof VALID_CATEGORIES)[number];

const querySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  category: z.enum(VALID_CATEGORIES).optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  search: z.string().max(200).optional(),
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;

    const parsed = querySchema.safeParse({
      page: searchParams.get("page") ?? undefined,
      limit: searchParams.get("limit") ?? undefined,
      category: searchParams.get("category") ?? undefined,
      minPrice: searchParams.get("minPrice") ?? undefined,
      maxPrice: searchParams.get("maxPrice") ?? undefined,
      search: searchParams.get("search") ?? undefined,
    });

    if (!parsed.success) {
      return NextResponse.json(
        { data: null, error: parsed.error.errors[0].message, meta: {} },
        { status: 400 }
      );
    }

    const { page, limit, category, minPrice, maxPrice, search } = parsed.data;

    // Build where clause
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: Record<string, any> = { isActive: true };

    if (category) {
      where.category = category as ValidCategory;
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined) where.price.gte = minPrice;
      if (maxPrice !== undefined) where.price.lte = maxPrice;
    }

    if (search) {
      where.title = {
        contains: sanitizeString(search),
        mode: "insensitive",
      };
    }

    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      db.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          title: true,
          description: true,
          price: true,
          category: true,
          imageUrl: true,
          isActive: true,
          avgRating: true,
          stockCount: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      db.product.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      data: {
        products: products.map((p) => ({
          id: p.id,
          title: p.title,
          description: p.description,
          price: Number(p.price),
          category: p.category,
          imageUrl: p.imageUrl,
          isActive: p.isActive,
          avgRating: Number(p.avgRating),
          stockCount: p.stockCount,
          inStock: p.stockCount > 0,
          createdAt: p.createdAt,
          updatedAt: p.updatedAt,
        })),
        total,
        page,
        limit,
        totalPages,
      },
      error: null,
      meta: {},
    });
  } catch (err) {
    console.error("[GET /api/v1/products]", err);
    return NextResponse.json(
      { data: null, error: "Internal server error", meta: {} },
      { status: 500 }
    );
  }
}
