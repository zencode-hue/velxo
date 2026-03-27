import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * One-time admin account setup.
 * Protected by ADMIN_SETUP_TOKEN env var.
 * Call once after deploy: POST /api/auth/setup-admin
 * Body: { token: "...", email: "...", name: "..." }
 */
export async function POST(req: NextRequest) {
  try {
    const { token, email, name } = await req.json();

    const setupToken = process.env.ADMIN_SETUP_TOKEN;
    if (!setupToken) {
      return NextResponse.json({ error: "Setup not configured" }, { status: 503 });
    }
    if (token !== setupToken) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }
    if (!email) {
      return NextResponse.json({ error: "Email required" }, { status: 400 });
    }

    // Check if admin already exists
    const existing = await db.user.findFirst({ where: { role: "ADMIN" } });
    if (existing) {
      return NextResponse.json({ error: "Admin already exists" }, { status: 409 });
    }

    const admin = await db.user.upsert({
      where: { email },
      update: { role: "ADMIN", name: name ?? "Admin" },
      create: {
        email,
        name: name ?? "Admin",
        role: "ADMIN",
        emailVerified: new Date(),
      },
    });

    return NextResponse.json({ data: { id: admin.id, email: admin.email }, error: null });
  } catch (err) {
    console.error("[setup-admin]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
