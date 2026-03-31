import { Suspense } from "react";
import SuccessClient from "./SuccessClient";
import { CheckCircle } from "lucide-react";
import { db } from "@/lib/db";

export default async function SuccessPage({ searchParams }: { searchParams: { orderId?: string } }) {
  const orderId = searchParams.orderId;
  let pendingStock = false;

  if (orderId) {
    const order = await db.order.findFirst({
      where: { id: orderId },
      select: { status: true },
    });
    pendingStock = order?.status === "PENDING_STOCK";
  }

  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <CheckCircle size={32} className="text-green-400 animate-pulse" />
      </div>
    }>
      <SuccessClient pendingStock={pendingStock} />
    </Suspense>
  );
}
