import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";

const resetSchema = z.object({
  token: z.string().min(1, "Token is required"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password too long"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = resetSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const { token, password } = parsed.data;

    const verificationToken = await db.verificationToken.findUnique({
      where: { token },
    });

    if (
      !verificationToken ||
      !verificationToken.identifier.startsWith("reset:")
    ) {
      return NextResponse.json(
        { error: "Invalid or expired reset token" },
        { status: 400 }
      );
    }

    if (verificationToken.expires < new Date()) {
      await db.verificationToken.delete({ where: { token } });
      return NextResponse.json(
        { error: "Reset token has expired. Please request a new one." },
        { status: 400 }
      );
    }

    const email = verificationToken.identifier.replace(/^reset:/, "");
    const passwordHash = await bcrypt.hash(password, 12);

    await db.user.update({
      where: { email },
      data: { passwordHash },
    });

    await db.verificationToken.delete({ where: { token } });

    return NextResponse.json({
      data: { message: "Password has been reset successfully." },
      error: null,
      meta: {},
    });
  } catch (err) {
    console.error("[reset-password]", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
