import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin-auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const { error } = await requireAdminApi();
  if (error) return error;

  const staff = await db.staffMember.findMany({
    orderBy: { createdAt: "desc" },
    select: { id: true, name: true, email: true, status: true, createdAt: true },
  });
  return NextResponse.json({ data: staff, error: null });
}
