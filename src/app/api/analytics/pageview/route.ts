import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { path, referrer, sessionId } = await req.json();

    const userAgent = req.headers.get("user-agent") ?? undefined;
    const forwarded = req.headers.get("x-forwarded-for");
    const ip = forwarded ? forwarded.split(",")[0].trim() : req.headers.get("x-real-ip") ?? undefined;

    // Basic geo from Cloudflare/Render headers
    const country = req.headers.get("cf-ipcountry") ?? req.headers.get("x-vercel-ip-country") ?? undefined;
    const city = req.headers.get("cf-ipcity") ?? req.headers.get("x-vercel-ip-city") ?? undefined;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (db.pageView as any).create({
      data: {
        path: String(path ?? "/").slice(0, 500),
        country: country ?? null,
        city: city ?? null,
        referrer: referrer ? String(referrer).slice(0, 500) : null,
        userAgent: userAgent ? String(userAgent).slice(0, 500) : null,
        sessionId: sessionId ? String(sessionId).slice(0, 100) : null,
      },
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
