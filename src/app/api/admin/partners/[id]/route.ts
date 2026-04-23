import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin-auth";
import { db } from "@/lib/db";
import { z } from "zod";

export const dynamic = "force-dynamic";

const schema = z.object({
  status: z.enum(["ACTIVE", "SUSPENDED", "PENDING"]).optional(),
  commissionPct: z.number().min(1).max(50).optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const { error } = await requireAdminApi();
  if (error) return error;

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const partner = await db.partnerAffiliate.update({
    where: { id: params.id },
    data: parsed.data,
    select: { id: true, status: true, commissionPct: true },
  });
  return NextResponse.json({ data: partner, error: null });
}
