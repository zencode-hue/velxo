import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireAdmin();
    const staff = await db.staffMember.findMany({
      orderBy: { createdAt: "desc" },
      select: { id: true, name: true, email: true, status: true, createdAt: true },
    });
    return NextResponse.json({ data: staff, error: null });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
