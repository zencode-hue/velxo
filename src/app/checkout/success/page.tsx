import { Suspense } from "react";
import SuccessClient from "./SuccessClient";
import { CheckCircle } from "lucide-react";
import { redirect } from "next/navigation";

export default async function SuccessPage({ searchParams }: { searchParams: { orderId?: string } }) {
  const orderId = searchParams.orderId;

  // Redirect to the new invoice page
  if (orderId) {
    redirect(`/invoice/${orderId}`);
  }

  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <CheckCircle size={32} className="text-green-400 animate-pulse" />
      </div>
    }>
      <SuccessClient pendingStock={false} />
    </Suspense>
  );
}
