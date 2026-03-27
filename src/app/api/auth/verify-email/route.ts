import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.redirect(
      new URL("/auth/login?error=missing-token", req.url)
    );
  }

  try {
    const verificationToken = await db.verificationToken.findUnique({
      where: { token },
    });

    if (!verificationToken) {
      return NextResponse.redirect(
        new URL("/auth/login?error=invalid-token", req.url)
      );
    }

    if (verificationToken.expires < new Date()) {
      await db.verificationToken.delete({ where: { token } });
      return NextResponse.redirect(
        new URL("/auth/login?error=expired-token", req.url)
      );
    }

    // Mark user as verified
    await db.user.update({
      where: { email: verificationToken.identifier },
      data: { emailVerified: new Date() },
    });

    // Delete the used token
    await db.verificationToken.delete({ where: { token } });

    return NextResponse.redirect(
      new URL("/auth/login?verified=true", req.url)
    );
  } catch (err) {
    console.error("[verify-email]", err);
    return NextResponse.redirect(
      new URL("/auth/login?error=server-error", req.url)
    );
  }
}
