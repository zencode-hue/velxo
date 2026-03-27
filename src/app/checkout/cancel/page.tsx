import Link from "next/link";
import { XCircle } from "lucide-react";

export default function CheckoutCancelPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="glass-card p-10 max-w-md w-full text-center">
        <XCircle size={48} className="text-red-400 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-white mb-2">Payment Cancelled</h1>
        <p className="text-gray-400 text-sm mb-6">Your order was not completed. No charges were made.</p>
        <Link href="/products" className="btn-primary px-8 py-3">Back to Products</Link>
      </div>
    </div>
  );
}
