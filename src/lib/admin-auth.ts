import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth";

/**
 * Server-side admin guard for use in admin page components.
 * Redirects to / if not authenticated or not ADMIN role.
 */
export async function requireAdmin() {
  const session = await getServerSession();
  if (!session?.user?.id) redirect("/auth/login");
  if (session.user.role !== "ADMIN") redirect("/");
  return session;
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
