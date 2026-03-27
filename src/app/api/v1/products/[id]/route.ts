import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const product = await db.product.findFirst({
      where: { id, isActive: true },
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
        reviews: {
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            rating: true,
            comment: true,
            createdAt: true,
            user: {
              select: { name: true },
            },
          },
        },
      },
    });

    if (!product) {
      return NextResponse.json(
        { data: null, error: "Product not found", meta: {} },
        { status: 404 }
      );
    }

    const relatedProducts = await db.product.findMany({
      where: {
        category: product.category,
        isActive: true,
        id: { not: product.id },
      },
      take: 3,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        price: true,
        category: true,
        imageUrl: true,
        avgRating: true,
        stockCount: true,
      },
    });

    return NextResponse.json({
      data: {
        product: {
          id: product.id,
          title: product.title,
          description: product.description,
          price: Number(product.price),
          category: product.category,
          imageUrl: product.imageUrl,
          isActive: product.isActive,
          avgRating: Number(product.avgRating),
          stockCount: product.stockCount,
          inStock: product.stockCount > 0,
          createdAt: product.createdAt,
          updatedAt: product.updatedAt,
          reviews: product.reviews.map((r: {
            id: string;
            rating: number;
            comment: string | null;
            createdAt: Date;
            user: { name: string | null };
          }) => ({
            id: r.id,
            rating: r.rating,
            comment: r.comment,
            createdAt: r.createdAt,
            userName: r.user.name,
          })),
          relatedProducts: relatedProducts.map((p: {
            id: string;
            title: string;
            price: { toNumber?: () => number } | number;
            category: string;
            imageUrl: string | null;
            avgRating: { toNumber?: () => number } | number;
            stockCount: number;
          }) => ({
            id: p.id,
            title: p.title,
            price: Number(p.price),
            category: p.category,
            imageUrl: p.imageUrl,
            avgRating: Number(p.avgRating),
            stockCount: p.stockCount,
            inStock: p.stockCount > 0,
          })),
        },
      },
      error: null,
      meta: {},
    });
  } catch (err) {
    console.error("[GET /api/v1/products/:id]", err);
    return NextResponse.json(
      { data: null, error: "Internal server error", meta: {} },
      { status: 500 }
    );
  }
}
