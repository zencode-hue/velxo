import { NextRequest, NextResponse } from "next/server";
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pv = db.pageView as any;

  const [
    totalViews30d, totalViews7d, totalViews24h,
    topPages, topCountries, viewsByDay,
    revenueByDay,
  ] = await Promise.all([
    pv.count({ where: { createdAt: { gte: last30 } } }),
    pv.count({ where: { createdAt: { gte: last7 } } }),
    pv.count({ where: { createdAt: { gte: last24h } } }),
    pv.groupBy({ by: ["path"], where: { createdAt: { gte: last30 } }, _count: { id: true }, orderBy: { _count: { id: "desc" } }, take: 10 }),
    pv.groupBy({ by: ["country"], where: { createdAt: { gte: last30 }, country: { not: null } }, _count: { id: true }, orderBy: { _count: { id: "desc" } }, take: 10 }),
    db.$queryRaw`SELECT DATE("createdAt") as date, COUNT(*)::int as views FROM "PageView" WHERE "createdAt" >= ${last7} GROUP BY DATE("createdAt") ORDER BY date ASC`,
    db.$queryRaw`SELECT DATE("createdAt") as date, COALESCE(SUM(amount),0)::float as revenue, COUNT(*)::int as orders FROM "Order" WHERE status = 'PAID' AND "createdAt" >= ${last30} GROUP BY DATE("createdAt") ORDER BY date ASC`,
  ]);

  // Fill missing days with 0
  const dailyMap = new Map<string, { revenue: number; orders: number }>();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const key = d.toISOString().slice(0, 10);
    dailyMap.set(key, { revenue: 0, orders: 0 });
  }
  for (const row of revenueByDay as { date: Date; revenue: number; orders: number }[]) {
    const key = new Date(row.date).toISOString().slice(0, 10);
    dailyMap.set(key, { revenue: Number(row.revenue), orders: Number(row.orders) });
  }
  const daily = Array.from(dailyMap.entries()).map(([date, v]) => ({ date, ...v }));

  void req;
  return NextResponse.json({
    data: {
      totalViews30d, totalViews7d, totalViews24h,
      topPages: topPages.map((p: { path: string; _count: { id: number } }) => ({ path: p.path, views: p._count.id })),
      topCountries: topCountries.map((c: { country: string; _count: { id: number } }) => ({ country: c.country ?? "Unknown", views: c._count.id })),
      viewsByDay,
      daily,
    },
    error: null, meta: {},
  });
}

export async function GET() {
  const session = await getServerSession();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const last30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const last7 = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pv = db.pageView as any;

  const [
    totalViews30d,
    totalViews7d,
    totalViews24h,
    topPages,
    topCountries,
    viewsByDay,
  ] = await Promise.all([
    pv.count({ where: { createdAt: { gte: last30 } } }),
    pv.count({ where: { createdAt: { gte: last7 } } }),
    pv.count({ where: { createdAt: { gte: last24h } } }),
    pv.groupBy({
      by: ["path"],
      where: { createdAt: { gte: last30 } },
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
      take: 10,
    }),
    pv.groupBy({
      by: ["country"],
      where: { createdAt: { gte: last30 }, country: { not: null } },
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
      take: 10,
    }),
    // Views per day for last 7 days — raw query
    db.$queryRaw`
      SELECT DATE("createdAt") as date, COUNT(*)::int as views
      FROM "PageView"
      WHERE "createdAt" >= ${last7}
      GROUP BY DATE("createdAt")
      ORDER BY date ASC
    `,
  ]);

  return NextResponse.json({
    data: {
      totalViews30d,
      totalViews7d,
      totalViews24h,
      topPages: topPages.map((p: { path: string; _count: { id: number } }) => ({ path: p.path, views: p._count.id })),
      topCountries: topCountries.map((c: { country: string; _count: { id: number } }) => ({ country: c.country ?? "Unknown", views: c._count.id })),
      viewsByDay,
    },
    error: null,
    meta: {},
  });
}
