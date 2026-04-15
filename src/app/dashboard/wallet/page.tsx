import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { Wallet } from "lucide-react";
import BalanceSection from "../BalanceSection";

export const dynamic = "force-dynamic";

export default async function WalletPage() {
  const session = await getServerSession();
  if (!session?.user?.id) redirect("/auth/login");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const user = await (db.user.findUnique as any)({ where: { id: session.user.id }, select: { balance: true } });
  const balance = Number(user?.balance ?? 0);

  const transactions = await (db as any).balanceTransaction.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 30,
  });

  const TX_COLOR: Record<string, string> = {
    TOPUP: "text-green-400", PURCHASE: "text-red-400", REFUND: "text-cyan-400",
    ADMIN_CREDIT: "text-green-400", ADMIN_DEBIT: "text-red-400", AFFILIATE_PAYOUT: "text-yellow-400",
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-8 flex items-center gap-2">
        <Wallet size={22} className="text-cyan-400" /> Wallet
      </h1>

      <BalanceSection balance={balance} />

      <div className="glass-card">
        <div className="px-5 py-4 border-b border-white/5">
          <h2 className="text-sm font-semibold text-white">Transaction History</h2>
        </div>
        {transactions.length === 0 ? (
          <p className="text-center text-gray-600 py-10 text-sm">No transactions yet.</p>
        ) : (
          <div className="divide-y divide-white/5">
            {transactions.map((tx: { id: string; type: string; amount: unknown; description?: string; createdAt: Date }) => (
              <div key={tx.id} className="px-5 py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm text-white">{tx.description ?? tx.type}</p>
                  <p className="text-xs text-gray-500">{new Date(tx.createdAt).toLocaleString()}</p>
                </div>
                <span className={`text-sm font-bold ${TX_COLOR[tx.type] ?? "text-white"}`}>
                  {Number(tx.amount) > 0 ? "+" : ""}${Number(tx.amount).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
