import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getServerSession } from "@/lib/auth";

async function requireAdmin() {
  const session = await getServerSession();
  if (!session?.user?.id || session.user.role !== "ADMIN") return null;
  return session;
}

const bodySchema = z.object({
  amount: z.number().min(0.01),
  type: z.enum(["ADMIN_CREDIT", "ADMIN_DEBIT"]),
  description: z.string().optional(),
});

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });

  const { amount, type, description } = parsed.data;

  const user = await db.user.findUnique({ where: { id: params.id }, select: { balance: true, email: true } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  if (type === "ADMIN_DEBIT" && Number(user.balance) < amount) {
    return NextResponse.json({ error: "Insufficient balance" }, { status: 400 });
  }

  const delta = type === "ADMIN_CREDIT" ? amount : -amount;

  await db.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: params.id },
      data: { balance: { increment: delta } },
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (tx.balanceTransaction as any).create({
      data: {
        userId: params.id,
        type,
        amount: delta,
        description: description ?? (type === "ADMIN_CREDIT" ? "Admin credit" : "Admin debit"),
      },
    });
  });

  const updated = await db.user.findUnique({ where: { id: params.id }, select: { balance: true } });
  return NextResponse.json({ data: { balance: Number(updated?.balance ?? 0) }, error: null });
}
