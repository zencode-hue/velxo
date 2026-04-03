import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
import { db } from "@/lib/db";
import { getServerSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await getServerSession();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const last30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const last7 = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pv = (db as any).pageView;

  const [totalViews30d, totalViews7d, totalViews24h, topPages, topCountries, viewsByDay, revenueByDay,
    revenueToday, revenueWeek, revenueMonth, revenueTotal,
    ordersToday, ordersWeek, ordersMonth,
    paymentMethodBreakdown, topProducts,
  ] = await Promise.all([
    pv.count({ where: { createdAt: { gte: last30 } } }),
    pv.count({ where: { createdAt: { gte: last7 } } }),
    pv.count({ where: { createdAt: { gte: last24h } } }),
    pv.groupBy({ by: ["path"], where: { createdAt: { gte: last30 } }, _count: { id: true }, orderBy: { _count: { id: "desc" } }, take: 10 }),
    pv.groupBy({ by: ["country"], where: { createdAt: { gte: last30 }, country: { not: null } }, _count: { id: true }, orderBy: { _count: { id: "desc" } }, take: 10 }),
    db.$queryRaw`SELECT DATE("createdAt") as date, COUNT(*)::int as views FROM "PageView" WHERE "createdAt" >= ${last7} GROUP BY DATE("createdAt") ORDER BY date ASC`,
    db.$queryRaw`SELECT DATE("createdAt") as date, COALESCE(SUM(amount),0)::float as revenue, COUNT(*)::int as orders FROM "Order" WHERE status = 'PAID' AND "createdAt" >= ${last30} GROUP BY DATE("createdAt") ORDER BY date ASC`,
    // Revenue stats
    db.order.aggregate({ where: { status: "PAID", createdAt: { gte: todayStart } }, _sum: { amount: true }, _count: true }),
    db.order.aggregate({ where: { status: "PAID", createdAt: { gte: weekStart } }, _sum: { amount: true }, _count: true }),
    db.order.aggregate({ where: { status: "PAID", createdAt: { gte: monthStart } }, _sum: { amount: true }, _count: true }),
    db.order.aggregate({ where: { status: "PAID" }, _sum: { amount: true }, _count: true }),
    db.order.count({ where: { createdAt: { gte: todayStart } } }),
    db.order.count({ where: { createdAt: { gte: weekStart } } }),
    db.order.count({ where: { createdAt: { gte: monthStart } } }),
    // Payment method breakdown
    db.order.groupBy({ by: ["paymentProvider"], where: { status: "PAID" }, _count: { id: true }, _sum: { amount: true }, orderBy: { _count: { id: "desc" } } }),
    // Top selling products
    db.order.groupBy({ by: ["productId"], where: { status: "PAID" }, _count: { id: true }, _sum: { amount: true }, orderBy: { _count: { id: "desc" } }, take: 10 }),
  ]);

  const dailyMap = new Map();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    dailyMap.set(d.toISOString().slice(0, 10), { revenue: 0, orders: 0 });
  }
  for (const row of revenueByDay as { date: Date; revenue: number; orders: number }[]) {
    dailyMap.set(new Date(row.date).toISOString().slice(0, 10), { revenue: Number(row.revenue), orders: Number(row.orders) });
  }
  const daily = Array.from(dailyMap.entries()).map(([date, v]) => ({ date, ...v }));

  // Fetch product titles for top products
  const productIds = (topProducts as { productId: string }[]).map((p) => p.productId);
  const productTitles = await db.product.findMany({ where: { id: { in: productIds } }, select: { id: true, title: true } });
  const titleMap = Object.fromEntries(productTitles.map((p) => [p.id, p.title]));

  void req;
  return NextResponse.json({
    data: {
      totalViews30d, totalViews7d, totalViews24h,
      topPages: topPages.map((p: { path: string; _count: { id: number } }) => ({ path: p.path, views: p._count.id })),
      topCountries: topCountries.map((c: { country: string; _count: { id: number } }) => ({ country: c.country ?? "Unknown", views: c._count.id })),
      viewsByDay, daily,
      revenue: {
        today: Number(revenueToday._sum.amount ?? 0),
        week: Number(revenueWeek._sum.amount ?? 0),
        month: Number(revenueMonth._sum.amount ?? 0),
        total: Number(revenueTotal._sum.amount ?? 0),
        ordersToday, ordersWeek, ordersMonth,
        totalOrders: revenueTotal._count,
      },
      paymentMethods: (paymentMethodBreakdown as { paymentProvider: string; _count: { id: number }; _sum: { amount: unknown } }[]).map((p) => ({
        provider: p.paymentProvider,
        orders: p._count.id,
        revenue: Number(p._sum.amount ?? 0),
      })),
      topProducts: (topProducts as { productId: string; _count: { id: number }; _sum: { amount: unknown } }[]).map((p) => ({
        productId: p.productId,
        title: titleMap[p.productId] ?? "Unknown",
        orders: p._count.id,
        revenue: Number(p._sum.amount ?? 0),
      })),
    },
    error: null, meta: {},
  });
}
