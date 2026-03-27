import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { encode } from "next-auth/jwt";

/**
 * Creates a NextAuth JWT session for the admin user after password verification.
 * This bypasses bcrypt since admin uses a plain env-var password.
 */
export async function POST(req: NextRequest) {
  try {
    const { password } = await req.json();

    const adminPassword = process.env.ADMIN_PASSWORD;
    if (!adminPassword || password !== adminPassword) {
      await new Promise((r) => setTimeout(r, 500));
      return NextResponse.json({ error: "Incorrect password" }, { status: 401 });
    }

    const admin = await db.user.findFirst({ where: { role: "ADMIN" } });
    if (!admin) {
      return NextResponse.json({ error: "No admin account found" }, { status: 404 });
    }

    const secret = process.env.NEXTAUTH_SECRET!;
    const token = await encode({
      token: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role,
        sub: admin.id,
      },
      secret,
      maxAge: 60 * 60 * 8, // 8 hours
    });

    const isProduction = process.env.NODE_ENV === "production";
    const cookieName = isProduction ? "__Secure-next-auth.session-token" : "next-auth.session-token";

    const response = NextResponse.json({ data: { success: true }, error: null, meta: {} });
    response.cookies.set(cookieName, token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 8,
    });

    return response;
  } catch (err) {
    console.error("[admin-session]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
