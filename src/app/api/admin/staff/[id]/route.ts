import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { db } from "@/lib/db";
import { z } from "zod";

export const dynamic = "force-dynamic";

const schema = z.object({
  status: z.enum(["ACTIVE", "SUSPENDED", "PENDING"]),
});

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAdmin();
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Invalid status" }, { status: 400 });

    const staff = await db.staffMember.update({
      where: { id: params.id },
      data: { status: parsed.data.status },
      select: { id: true, name: true, email: true, status: true },
    });

    return NextResponse.json({ data: staff, error: null });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAdmin();
    await db.staffMember.delete({ where: { id: params.id } });
    return NextResponse.json({ data: null, error: null });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
