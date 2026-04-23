import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth";
import { NextResponse } from "next/server";

/**
 * Server-side admin guard for use in admin PAGE components (not API routes).
 * Redirects to / if not authenticated or not ADMIN role.
 */
export async function requireAdmin() {
  const session = await getServerSession();
  if (!session?.user?.id) redirect("/auth/login");
  if (session.user.role !== "ADMIN") redirect("/");
  return session;
}

/**
 * API route admin guard — returns a 401 response instead of redirecting.
 * Use this in all /api/admin/* routes.
 */
export async function requireAdminApi(): Promise<{ session: Awaited<ReturnType<typeof getServerSession>>; error: null } | { session: null; error: NextResponse }> {
  const session = await getServerSession();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return { session: null, error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  return { session, error: null };
}

/**
 * Writes an admin audit log entry.
 */
export async function auditLog(
  adminId: string,
  action: string,
  entityType: string,
  entityId: string
) {
  const { db } = await import("@/lib/db");
  await db.adminAuditLog.create({
    data: { adminId, action, entityType, entityId },
  });
}
