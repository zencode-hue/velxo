import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import crypto from "crypto";
import { db } from "@/lib/db";
import { sendPasswordResetEmail } from "@/lib/email";

const forgotSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = forgotSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const email = parsed.data.email.toLowerCase();

    // Always return success to avoid user enumeration
    const user = await db.user.findUnique({ where: { email } });

    if (user) {
      const token = crypto.randomBytes(32).toString("hex");
      const expires = new Date(Date.now() + 60 * 60 * 1000); // 60 minutes
      const identifier = `reset:${email}`;

      // Remove any existing reset token for this user
      await db.verificationToken.deleteMany({ where: { identifier } });

      await db.verificationToken.create({
        data: { identifier, token, expires },
      });

      await sendPasswordResetEmail(email, token);
    }

    return NextResponse.json({
      data: {
        message:
          "If an account with that email exists, a password reset link has been sent.",
      },
      error: null,
      meta: {},
    });
  } catch (err) {
    console.error("[forgot-password]", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
