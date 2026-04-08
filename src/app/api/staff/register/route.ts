import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

const schema = z.object({
  name: z.string().min(2).max(60),
  email: z.string().email(),
  password: z.string().min(8),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
    }

    const { name, email, password } = parsed.data;

    const existing = await db.staffMember.findUnique({ where: { email: email.toLowerCase() } });
    if (existing) {
      return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    await db.staffMember.create({
      data: { name, email: email.toLowerCase(), passwordHash, status: "PENDING" },
    });

    return NextResponse.json({ data: { message: "Account created. Awaiting admin approval." }, error: null });
  } catch (err) {
    console.error("[staff/register]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
