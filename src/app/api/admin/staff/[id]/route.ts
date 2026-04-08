import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { db } from "@/lib/db";
import { z } from "zod";

export const dynamic = "force-dynamic";

const schema = z.object({
  status: z.enum(["ACTIVE", "SUSPENDED", "PENDING"]).optional(),
  position: z.string().max(80).optional(),
  joinedAt: z.string().optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAdmin();
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

    const data: Record<string, unknown> = {};
    if (parsed.data.status) data.status = parsed.data.status;
    if (parsed.data.position !== undefined) data.position = parsed.data.position;
    if (parsed.data.joinedAt) data.joinedAt = new Date(parsed.data.joinedAt);

    const staff = await db.staffMember.update({
      where: { id: params.id },
      data,
      select: { id: true, name: true, email: true, status: true, position: true },
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
