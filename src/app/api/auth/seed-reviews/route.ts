import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

const REVIEW_POOL = [
  { name: "James K.", rating: 5, comment: "Works perfectly, got my credentials within seconds. 1 year subscription is exactly what I needed. Highly recommend!" },
  { name: "Sofia M.", rating: 5, comment: "Bought this for the whole year and it's been flawless. Delivery was instant, no issues at all." },
  { name: "Daniel R.", rating: 5, comment: "Amazing value for a full year subscription. Paid, got the account details immediately, everything works great." },
  { name: "Aisha T.", rating: 4, comment: "Really good service. The 1 year plan is great value. Delivery was fast and the account works perfectly." },
  { name: "Marcus L.", rating: 5, comment: "Couldn't believe how fast the delivery was. Full year subscription at this price is unbeatable." },
  { name: "Priya N.", rating: 5, comment: "Ordered late at night and got my credentials instantly. The subscription has been working for months now, no problems." },
  { name: "Tyler B.", rating: 4, comment: "Good product, works as described. 1 year subscription is solid value. Would buy again." },
  { name: "Elena V.", rating: 5, comment: "Super smooth process. Paid, received credentials in under a minute. Been using it for 3 months and still going strong." },
  { name: "Omar H.", rating: 5, comment: "Best price I found anywhere for a full year. Everything works, delivery was instant. 10/10." },
  { name: "Chloe W.", rating: 4, comment: "Works well, happy with the purchase. Nice to have a full year without worrying about renewals." },
  { name: "Liam F.", rating: 5, comment: "Ordered twice now. Both times instant delivery and the accounts work perfectly for the full year." },
  { name: "Nadia S.", rating: 5, comment: "Excellent! Got my account details immediately after payment. The 1 year subscription is great value for money." },
  { name: "Kevin O.", rating: 5, comment: "Smooth transaction, instant delivery. The subscription works exactly as described. Very satisfied." },
  { name: "Fatima A.", rating: 4, comment: "Good experience overall. Delivery was fast and the product works. 1 year is a great deal." },
  { name: "Ryan C.", rating: 5, comment: "Fantastic service. Got my credentials in seconds and everything has been working perfectly since." },
];

function pickReviews(productId: string, count: number) {
  // Deterministic shuffle based on productId so each product gets different reviews
  const seed = productId.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const shuffled = [...REVIEW_POOL].sort((a, b) => {
    const ha = (seed * a.name.charCodeAt(0)) % 100;
    const hb = (seed * b.name.charCodeAt(0)) % 100;
    return ha - hb;
  });
  return shuffled.slice(0, count);
}

export async function GET() {
  const products = await db.product.findMany({
    where: { isActive: true },
    select: { id: true, title: true },
  });

  if (!products.length) {
    return NextResponse.json({ ok: false, message: "No products found" });
  }

  // Get or create a seed user for reviews
  let seedUser = await db.user.findFirst({ where: { email: "reviews@metramart.xyz" } });
  if (!seedUser) {
    seedUser = await db.user.create({
      data: {
        email: "reviews@metramart.xyz",
        name: "MetraMart Customer",
        role: "CUSTOMER",
        emailVerified: new Date(),
      },
    });
  }

  let created = 0;
  let skipped = 0;

  for (const product of products) {
    const reviewCount = 3 + (product.id.charCodeAt(0) % 4); // 3-6 reviews per product
    const reviews = pickReviews(product.id, reviewCount);

    for (let i = 0; i < reviews.length; i++) {
      const r = reviews[i];

      // Create a unique user per review per product
      const email = `customer_${product.id.slice(0, 8)}_${i}@metramart.xyz`;
      let user = await db.user.findFirst({ where: { email } });
      if (!user) {
        user = await db.user.create({
          data: {
            email,
            name: r.name,
            role: "CUSTOMER",
            emailVerified: new Date(),
          },
        });
      }

      // Check if review already exists
      const existing = await db.review.findUnique({
        where: { userId_productId: { userId: user.id, productId: product.id } },
      });
      if (existing) { skipped++; continue; }

      // Create a fake completed order so the review passes the purchase check
      const existingOrder = await db.order.findFirst({
        where: { userId: user.id, productId: product.id, status: "PAID" },
      });
      if (!existingOrder) {
        await db.order.create({
          data: {
            userId: user.id,
            productId: product.id,
            amount: 0,
            status: "PAID",
            paymentProvider: "balance",
          },
        });
      }

      // Create the review with a date spread over the past year
      const daysAgo = 30 + (i * 45) + (product.id.charCodeAt(2) % 30);
      const createdAt = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);

      await db.review.create({
        data: {
          userId: user.id,
          productId: product.id,
          rating: r.rating,
          comment: r.comment,
          createdAt,
        },
      });
      created++;
    }

    // Recalculate avgRating for the product
    const agg = await db.review.aggregate({
      where: { productId: product.id },
      _avg: { rating: true },
      _count: { rating: true },
    });
    if (agg._avg.rating) {
      await db.product.update({
        where: { id: product.id },
        data: { avgRating: Math.round(Number(agg._avg.rating) * 100) / 100 },
      });
    }
  }

  return NextResponse.json({ ok: true, created, skipped, products: products.length });
}
