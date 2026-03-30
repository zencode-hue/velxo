import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

function parseDevice(ua: string): string {
  if (/mobile|android|iphone|ipad|ipod/i.test(ua)) {
    if (/ipad|tablet/i.test(ua)) return "tablet";
    return "mobile";
  }
  return "desktop";
}

function parseBrowser(ua: string): string {
  if (/edg\//i.test(ua)) return "Edge";
  if (/opr\//i.test(ua)) return "Opera";
  if (/chrome/i.test(ua)) return "Chrome";
  if (/firefox/i.test(ua)) return "Firefox";
  if (/safari/i.test(ua)) return "Safari";
  return "Other";
}

function parseOS(ua: string): string {
  if (/windows/i.test(ua)) return "Windows";
  if (/mac os/i.test(ua)) return "macOS";
  if (/android/i.test(ua)) return "Android";
  if (/iphone|ipad|ipod/i.test(ua)) return "iOS";
  if (/linux/i.test(ua)) return "Linux";
  return "Other";
}

export async function POST(req: NextRequest) {
  try {
    const { path, referrer, sessionId } = await req.json();

    const userAgent = req.headers.get("user-agent") ?? "";
    const forwarded = req.headers.get("x-forwarded-for");
    const ip = forwarded ? forwarded.split(",")[0].trim() : (req.headers.get("x-real-ip") ?? null);
    const country = req.headers.get("cf-ipcountry") ?? req.headers.get("x-vercel-ip-country") ?? null;
    const city = req.headers.get("cf-ipcity") ?? req.headers.get("x-vercel-ip-city") ?? null;

    // Deduplicate: same IP + same path within the same day = skip
    if (ip) {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const existing = await (db.pageView as any).findFirst({
        where: {
          ip,
          path: String(path ?? "/").slice(0, 500),
          createdAt: { gte: todayStart },
        },
      });
      if (existing) return NextResponse.json({ ok: true, deduplicated: true });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (db.pageView as any).create({
      data: {
        path: String(path ?? "/").slice(0, 500),
        country: country ?? null,
        city: city ?? null,
        referrer: referrer ? String(referrer).slice(0, 500) : null,
        userAgent: userAgent ? String(userAgent).slice(0, 500) : null,
        sessionId: sessionId ? String(sessionId).slice(0, 100) : null,
        ip: ip ? String(ip).slice(0, 50) : null,
        device: userAgent ? parseDevice(userAgent) : null,
        browser: userAgent ? parseBrowser(userAgent) : null,
        os: userAgent ? parseOS(userAgent) : null,
      },
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
