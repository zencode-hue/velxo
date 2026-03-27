import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { retryDelivery } from "@/lib/delivery";
import { auditLog } from "@/lib/admin-auth";

export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession();
  if (!session?.user?.id) {
    return NextResponse.json({ data: null, error: "Unauthorized", meta: {} }, { status: 401 });
  }
  if (session.user.role !== "ADMIN") {
    return NextResponse.json({ data: null, error: "Forbidden", meta: {} }, { status: 403 });
  }

  try {
    await retryDelivery(params.id);
    await auditLog(session.user.id, "redeliver", "Order", params.id);
    return NextResponse.json({ data: { success: true }, error: null, meta: {} });
  } catch (err) {
    console.error("[redeliver]", err);
    return NextResponse.json({ data: null, error: "Delivery failed", meta: {} }, { status: 500 });
  }
}
