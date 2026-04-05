import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  await requireAdmin();

  const ip = req.nextUrl.searchParams.get("ip")?.trim();
  if (!ip) return NextResponse.json({ error: "IP address required" }, { status: 400 });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pv = (db as any).pageView;

  const views = await pv.findMany({
    where: { ip },
    orderBy: { createdAt: "desc" },
    take: 200,
    select: {
      path: true, country: true, city: true, browser: true, os: true,
      device: true, referrer: true, userAgent: true, sessionId: true, userId: true, createdAt: true,
    },
  }) as Array<{
    path: string; country: string | null; city: string | null; browser: string | null;
    os: string | null; device: string | null; referrer: string | null; userAgent: string | null;
    sessionId: string | null; userId: string | null; createdAt: Date;
  }>;

  if (views.length === 0) {
    return NextResponse.json({ data: {
      ip, totalVisits: 0, uniqueSessions: 0,
      firstSeen: null, lastSeen: null,
      country: null, city: null, browser: null, os: null, device: null, userAgent: null,
      views: [], orders: [], matchedUsers: [],
    }});
  }

  // Aggregate stats
  const sessions = new Set(views.map((v) => v.sessionId).filter(Boolean));
  const sessionCount = sessions.size;
  const latest = views[0];
  const oldest = views[views.length - 1];

  // Find any registered users who visited from this IP
  const userIds = Array.from(new Set(views.map((v) => v.userId).filter(Boolean))) as string[];
  const matchedUsers = userIds.length > 0
    ? await db.user.findMany({
        where: { id: { in: userIds } },
        select: { id: true, email: true, name: true },
      })
    : [];

  // Find orders from users linked to this IP
  const orders = userIds.length > 0
    ? await db.order.findMany({
        where: { userId: { in: userIds } },
        orderBy: { createdAt: "desc" },
        take: 50,
        include: {
          product: { select: { title: true } },
          user: { select: { email: true } },
        },
      })
    : [];

  return NextResponse.json({
    data: {
      ip,
      totalVisits: views.length,
      uniqueSessions: sessionCount,
      firstSeen: oldest.createdAt,
      lastSeen: latest.createdAt,
      country: latest.country,
      city: latest.city,
      browser: latest.browser,
      os: latest.os,
      device: latest.device,
      userAgent: latest.userAgent,
      views: views.map((v) => ({
        path: v.path,
        country: v.country,
        city: v.city,
        browser: v.browser,
        os: v.os,
        device: v.device,
        referrer: v.referrer,
        userAgent: v.userAgent,
        sessionId: v.sessionId,
        createdAt: v.createdAt,
      })),
      orders: orders.map((o) => ({
        id: o.id,
        amount: Number(o.amount),
        status: o.status,
        paymentProvider: o.paymentProvider,
        createdAt: o.createdAt,
        productTitle: o.product.title,
        email: o.user?.email ?? "Guest",
      })),
      matchedUsers,
    },
  });
}
