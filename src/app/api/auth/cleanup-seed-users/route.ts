import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

/**
 * Cleans up fake seed users created by seed-reviews:
 * - Keeps all reviews (reassigns them to a ghost user)
 * - Deletes fake orders (amount = 0, paymentProvider = "balance", userId = seed user)
 * - Deletes fake users (emails matching customer_*@velxo.shop and reviews@velxo.shop)
 */
export async function GET() {
  // 1. Find all seed users
  const seedUsers = await db.user.findMany({
    where: {
      OR: [
        { email: { startsWith: "customer_", endsWith: "@velxo.shop" } },
        { email: "reviews@velxo.shop" },
      ],
    },
    select: { id: true, email: true },
  });

  if (!seedUsers.length) {
    return NextResponse.json({ ok: true, message: "No seed users found — already clean", deleted: 0 });
  }

  const seedUserIds = seedUsers.map((u) => u.id);

  // 2. Get or create a ghost user to hold the reviews
  let ghost = await db.user.findFirst({ where: { email: "ghost@velxo.shop" } });
  if (!ghost) {
    ghost = await db.user.create({
      data: {
        email: "ghost@velxo.shop",
        name: "Verified Customer",
        role: "CUSTOMER",
        emailVerified: new Date(),
      },
    });
  }

  // 3. Reassign reviews from seed users to ghost user
  // We need to handle the unique constraint [userId, productId]
  // Get all reviews by seed users
  const seedReviews = await db.review.findMany({
    where: { userId: { in: seedUserIds } },
    select: { id: true, userId: true, productId: true, rating: true, comment: true, createdAt: true },
  });

  let reviewsReassigned = 0;
  let reviewsSkipped = 0;

  for (const review of seedReviews) {
    // Check if ghost already has a review for this product
    const existing = await db.review.findUnique({
      where: { userId_productId: { userId: ghost.id, productId: review.productId } },
    });

    if (existing) {
      // Ghost already has a review for this product — just delete the seed one
      await db.review.delete({ where: { id: review.id } });
      reviewsSkipped++;
    } else {
      // Reassign to ghost
      await db.review.update({
        where: { id: review.id },
        data: { userId: ghost.id },
      });
      reviewsReassigned++;
    }
  }

  // 4. Delete fake orders (amount = 0 created by seed)
  const deletedOrders = await db.order.deleteMany({
    where: {
      userId: { in: seedUserIds },
      amount: 0,
      paymentProvider: "balance",
    },
  });

  // 5. Delete seed users (cascade will handle sessions, loginAttempts, balanceTransactions)
  // First clean up any remaining relations
  await db.session.deleteMany({ where: { userId: { in: seedUserIds } } });
  await db.loginAttempt.deleteMany({ where: { userId: { in: seedUserIds } } });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (db as any).balanceTransaction.deleteMany({ where: { userId: { in: seedUserIds } } });

  const deletedUsers = await db.user.deleteMany({
    where: { id: { in: seedUserIds } },
  });

  // 6. Recalculate avgRating for all products (since some reviews may have been removed)
  const products = await db.product.findMany({ select: { id: true } });
  for (const product of products) {
    const agg = await db.review.aggregate({
      where: { productId: product.id },
      _avg: { rating: true },
    });
    await db.product.update({
      where: { id: product.id },
      data: { avgRating: agg._avg.rating ? Math.round(Number(agg._avg.rating) * 100) / 100 : 0 },
    });
  }

  return NextResponse.json({
    ok: true,
    seedUsersFound: seedUsers.length,
    deletedUsers: deletedUsers.count,
    deletedOrders: deletedOrders.count,
    reviewsReassigned,
    reviewsSkipped,
    message: `Cleaned up ${deletedUsers.count} fake users and ${deletedOrders.count} fake orders. ${reviewsReassigned} reviews kept (reassigned to ghost user).`,
  });
}
