import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
import { z } from "zod";
import { db } from "@/lib/db";
import { getServerSession } from "@/lib/auth";

const bodySchema = z.object({
  productId: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(1000).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ data: null, error: "Unauthorized", meta: {} }, { status: 401 });
    }
    const userId = session.user.id;

    let rawBody: unknown;
    try {
      rawBody = await req.json();
    } catch {
      return NextResponse.json({ data: null, error: "Invalid JSON body", meta: {} }, { status: 400 });
    }

    const parsed = bodySchema.safeParse(rawBody);
    if (!parsed.success) {
      return NextResponse.json(
        { data: null, error: parsed.error.errors[0].message, meta: {} },
        { status: 400 }
      );
    }

    const { productId, rating, comment } = parsed.data;

    // Verify user has a completed order for this product
    const completedOrder = await db.order.findFirst({
      where: { userId, productId, status: "PAID" },
    });

    if (!completedOrder) {
      return NextResponse.json(
        { data: null, error: "You must purchase this product before leaving a review", meta: {} },
        { status: 403 }
      );
    }

    // Check for existing review
    const existing = await db.review.findUnique({
      where: { userId_productId: { userId, productId } },
    });

    if (existing) {
      return NextResponse.json(
        { data: null, error: "You have already reviewed this product", meta: {} },
        { status: 409 }
      );
    }

    // Create review and recalculate avgRating in a transaction
    const review = await db.$transaction(async (tx) => {
      const newReview = await tx.review.create({
        data: { userId, productId, rating, comment: comment ?? null },
      });

      const agg = await tx.review.aggregate({
        where: { productId },
        _avg: { rating: true },
        _count: { rating: true },
      });

      const newAvg = agg._avg.rating ?? rating;

      await tx.product.update({
        where: { id: productId },
        data: { avgRating: Math.round(newAvg * 100) / 100 },
      });

      return newReview;
    });

    return NextResponse.json(
      {
        data: {
          id: review.id,
          productId: review.productId,
          rating: review.rating,
          comment: review.comment,
          createdAt: review.createdAt,
        },
        error: null,
        meta: {},
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("[POST /api/v1/reviews]", err);
    return NextResponse.json({ data: null, error: "Internal server error", meta: {} }, { status: 500 });
  }
}
