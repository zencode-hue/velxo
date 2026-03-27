import Link from "next/link";
import { CheckCircle } from "lucide-react";

export default function CheckoutSuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="glass-card p-10 max-w-md w-full text-center">
        <CheckCircle size={48} className="text-green-400 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-white mb-2">Payment Confirmed!</h1>
        <p className="text-gray-400 text-sm mb-6">Your order is being processed. You&apos;ll receive your credentials by email shortly.</p>
        <Link href="/dashboard" className="btn-primary px-8 py-3">View Dashboard</Link>
      </div>
    </div>
  );
}
