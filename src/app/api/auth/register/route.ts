import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
import { z } from "zod";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { db } from "@/lib/db";
import { sendVerificationEmail, trackEvent } from "@/lib/email";

const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password too long"),
  name: z.string().min(1).max(100).optional(),
  ref: z.string().optional(), // referral code
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const { email, password, name, ref } = parsed.data;
    const normalizedEmail = email.toLowerCase();

    const existing = await db.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await db.user.create({
      data: {
        email: normalizedEmail,
        passwordHash,
        name: name ?? null,
        emailVerified: new Date(), // auto-verify; email is sent as confirmation only
      },
    });

    // Send verification/welcome email (non-blocking — fails silently if email not configured)
    try {
      const token = crypto.randomBytes(32).toString("hex");
      const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);
      await db.verificationToken.create({ data: { identifier: normalizedEmail, token, expires } });
      await sendVerificationEmail(normalizedEmail, token);
    } catch {
      // Email not configured — user is already verified above
    }

    // Referral tracking: associate new user with affiliate if ref code provided
    if (ref) {
      const affiliate = await db.affiliate.findUnique({ where: { referralCode: ref.toUpperCase() } });
      if (affiliate && affiliate.userId !== user.id) {
        await db.referral.create({
          data: { affiliateId: affiliate.id, referredUserId: user.id },
        });
      }
    }

    // Track registration event in Resend
    await trackEvent(normalizedEmail, "user_registered", { name: name ?? null });

    return NextResponse.json(
      {
        data: {
          id: user.id,
          email: user.email,
          message:
            "Registration successful. Please check your email to verify your account.",
        },
        error: null,
        meta: {},
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("[register]", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
