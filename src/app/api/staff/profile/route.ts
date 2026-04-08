import { NextRequest, NextResponse } from "next/server";
import { getStaffSession } from "@/lib/staff-auth";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { z } from "zod";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getStaffSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const staff = await db.staffMember.findUnique({
    where: { id: session.id },
    select: { id: true, name: true, email: true, position: true, bio: true, phone: true, avatarUrl: true, status: true, joinedAt: true, createdAt: true },
  });
  if (!staff) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ data: staff, error: null });
}

const updateSchema = z.object({
  name: z.string().min(2).max(60).optional(),
  position: z.string().max(80).optional(),
  bio: z.string().max(300).optional(),
  phone: z.string().max(30).optional(),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8),
});

export async function PATCH(req: NextRequest) {
  const session = await getStaffSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();

  // Password change
  if (body.currentPassword !== undefined) {
    const parsed = passwordSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });

    const staff = await db.staffMember.findUnique({ where: { id: session.id } });
    if (!staff) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const valid = await bcrypt.compare(parsed.data.currentPassword, staff.passwordHash);
    if (!valid) return NextResponse.json({ error: "Current password is incorrect" }, { status: 401 });

    const newHash = await bcrypt.hash(parsed.data.newPassword, 12);
    await db.staffMember.update({ where: { id: session.id }, data: { passwordHash: newHash } });
    return NextResponse.json({ data: { message: "Password updated" }, error: null });
  }

  // Profile update
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });

  const updated = await db.staffMember.update({
    where: { id: session.id },
    data: { ...parsed.data, lastActiveAt: new Date() },
    select: { id: true, name: true, email: true, position: true, bio: true, phone: true, status: true },
  });

  return NextResponse.json({ data: updated, error: null });
}
