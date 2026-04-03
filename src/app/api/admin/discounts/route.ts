import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
import { z } from "zod";
import { db } from "@/lib/db";
import { getServerSession } from "@/lib/auth";
import { auditLog } from "@/lib/admin-auth";

const bodySchema = z.object({
  code: z.string().min(1).max(50).toUpperCase(),
  type: z.enum(["PERCENTAGE", "FIXED"]),
  value: z.number().positive(),
  usageLimit: z.number().int().positive(),
  expiresAt: z.string().datetime(),
});

export async function POST(req: NextRequest) {
  const session = await getServerSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
  }

  const { code, type, value, usageLimit, expiresAt } = parsed.data;

  const existing = await db.discountCode.findUnique({ where: { code } });
  if (existing) return NextResponse.json({ error: "Code already exists" }, { status: 409 });

  const discount = await db.discountCode.create({
    data: { code, type, value, usageLimit, expiresAt: new Date(expiresAt) },
  });

  await auditLog(session.user.id, "CREATE", "DiscountCode", discount.id);

  return NextResponse.json({ data: discount, error: null, meta: {} }, { status: 201 });
}
