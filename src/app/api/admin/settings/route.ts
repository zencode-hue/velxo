
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "@/lib/auth";

async function checkAdmin() {
  const session = await getServerSession();
  if (!session?.user?.id || session.user.role !== "ADMIN") return false;
  return true;
}

export async function GET() {
  if (!(await checkAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const settings = await (db as any).siteSetting.findMany();
  const map: Record<string, string> = {};
  for (const s of settings) map[s.key] = s.value;
  return NextResponse.json({ data: map, error: null });
}

export async function POST(req: NextRequest) {
  if (!(await checkAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
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
}
