
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-auth";

export async function GET() {
  try {
    await requireAdmin();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const settings = await (db as any).siteSetting.findMany();
    const map: Record<string, string> = {};
    for (const s of settings) map[s.key] = s.value;
    return NextResponse.json({ data: map, error: null });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    const body = await req.json() as Record<string, string>;
    for (const [key, value] of Object.entries(body)) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (db as any).siteSetting.upsert({
        where: { key },
        update: { value },
        create: { key, value },
      });
    }
    return NextResponse.json({ data: { saved: true }, error: null });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
