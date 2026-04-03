import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
import { z } from "zod";
import { db } from "@/lib/db";

const bodySchema = z.object({
  password: z.string().min(1),
});

/**
 * Admin password-only login.
 * Finds the first ADMIN user and signs them in if the password matches ADMIN_PASSWORD env var.
 * Returns the user id so the client can call NextAuth signIn("credentials") with it.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = bodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Password required" }, { status: 400 });
    }

    const adminPassword = process.env.ADMIN_PASSWORD;
    if (!adminPassword) {
      return NextResponse.json({ error: "Admin login not configured" }, { status: 503 });
    }

    if (parsed.data.password !== adminPassword) {
      // Small delay to slow brute force
      await new Promise((r) => setTimeout(r, 500));
      return NextResponse.json({ error: "Incorrect password" }, { status: 401 });
    }

    // Find the admin user account
    const admin = await db.user.findFirst({ where: { role: "ADMIN" } });
    if (!admin) {
      return NextResponse.json({ error: "No admin account found. Create one first." }, { status: 404 });
    }

    return NextResponse.json({ data: { email: admin.email }, error: null, meta: {} });
  } catch (err) {
    console.error("[admin-login]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
