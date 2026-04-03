import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
import { db } from "@/lib/db";
import { getServerSession } from "@/lib/auth";

export async function GET() {
  const session = await getServerSession();
  if (!session?.user?.id) {
    return NextResponse.json({ data: null, error: "Unauthorized", meta: {} }, { status: 401 });
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { balance: true },
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const transactions = await (db.balanceTransaction as any).findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return NextResponse.json({
    data: {
      balance: Number(user?.balance ?? 0),
      transactions: transactions.map((t: { id: string; type: string; amount: { toString(): string }; description: string | null; createdAt: Date }) => ({
        id: t.id,
        type: t.type,
        amount: Number(t.amount),
        description: t.description,
        createdAt: t.createdAt,
      })),
    },
    error: null,
    meta: {},
  });
}
