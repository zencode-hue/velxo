import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
import { z } from "zod";
import { db } from "@/lib/db";
import { getServerSession } from "@/lib/auth";
import { sanitizeString } from "@/lib/sanitize";

const bodySchema = z.object({
  code: z.string().min(1),
  productId: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    // 1. Require authenticated session
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json(
        { data: null, error: "Unauthorized", meta: {} },
        { status: 401 }
      );
    }
    const userId = session.user.id;

    // 2. Parse body
    let rawBody: unknown;
    try {
      rawBody = await req.json();
    } catch {
      return NextResponse.json(
        { data: null, error: "Invalid JSON body", meta: {} },
        { status: 400 }
      );
    }

    const parsed = bodySchema.safeParse(rawBody);
    if (!parsed.success) {
      return NextResponse.json(
        { data: null, error: parsed.error.errors[0].message, meta: {} },
        { status: 400 }
      );
    }

    const { code, productId } = parsed.data;

    // 3. Look up discount code
    const discountCode = await db.discountCode.findUnique({
      where: { code: sanitizeString(code).toUpperCase() },
    });

    if (!discountCode) {
      return NextResponse.json(
        { data: null, error: "Discount code not found", meta: {} },
        { status: 400 }
      );
    }

    // 4. Check expiry
    if (discountCode.expiresAt < new Date()) {
      return NextResponse.json(
        { data: null, error: "Discount code has expired", meta: {} },
        { status: 400 }
      );
    }

    // 5. Check usage limit
    if (discountCode.usageCount >= discountCode.usageLimit) {
      return NextResponse.json(
        { data: null, error: "Discount code has reached its usage limit", meta: {} },
        { status: 400 }
      );
    }

    // 6. Check per-user uniqueness
    const alreadyUsed = await db.discountUsage.findUnique({
      where: {
        discountCodeId_userId: { discountCodeId: discountCode.id, userId },
      },
    });

    if (alreadyUsed) {
      return NextResponse.json(
        { data: null, error: "You have already used this discount code", meta: {} },
        { status: 400 }
      );
    }

    // 7. Calculate discount amount (optionally against a product price)
    let discountAmount: number | null = null;

    if (productId) {
      const product = await db.product.findFirst({
        where: { id: sanitizeString(productId), isActive: true },
        select: { price: true },
      });

      if (product) {
        const price = Number(product.price);
        if (discountCode.type === "PERCENTAGE") {
          discountAmount = (price * Number(discountCode.value)) / 100;
        } else {
          discountAmount = Math.min(Number(discountCode.value), price);
        }
      }
    }

    return NextResponse.json({
      data: {
        valid: true,
        type: discountCode.type,
        value: Number(discountCode.value),
        discountAmount,
      },
      error: null,
      meta: {},
    });
  } catch (err) {
    console.error("[POST /api/v1/discount/validate]", err);
    return NextResponse.json(
      { data: null, error: "Internal server error", meta: {} },
      { status: 500 }
    );
  }
}
