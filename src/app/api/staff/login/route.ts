import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { createStaffToken, staffCookieOptions } from "@/lib/staff-auth";

export const dynamic = "force-dynamic";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

    const { email, password } = parsed.data;

    const staff = await db.staffMember.findUnique({ where: { email: email.toLowerCase() } });
    if (!staff) return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });

    const valid = await bcrypt.compare(password, staff.passwordHash);
    if (!valid) return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });

    if (staff.status === "PENDING") {
      return NextResponse.json({ error: "Your account is pending admin approval." }, { status: 403 });
    }
    if (staff.status === "SUSPENDED") {
      return NextResponse.json({ error: "Your account has been suspended." }, { status: 403 });
    }

    const token = createStaffToken({ id: staff.id, email: staff.email, name: staff.name });

    const res = NextResponse.json({ data: { name: staff.name }, error: null });
    res.cookies.set({ ...staffCookieOptions(), value: token });
    return res;
  } catch (err) {
    console.error("[staff/login]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
