import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { Users } from "lucide-react";
import AffiliateSection from "../AffiliateSection";

export const dynamic = "force-dynamic";

export default async function AffiliatePage() {
  const session = await getServerSession();
  if (!session?.user?.id) redirect("/auth/login");

  const affiliate = await db.affiliate.findUnique({
    where: { userId: session.user.id },
    include: { _count: { select: { referrals: true } } },
  });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://metramart.xyz";

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
        <Users size={22} className="text-amber-400" /> Promo Affiliate
      </h1>
      <p className="text-gray-500 text-sm mb-8">
        Share your link and earn store credit on every referred sale. Earnings go directly to your wallet balance.
      </p>

      <AffiliateSection
        affiliate={affiliate ? {
          referralCode: affiliate.referralCode,
          referralLink: `${appUrl}/auth/register?ref=${affiliate.referralCode}`,
          totalReferrals: affiliate._count.referrals,
          totalEarned: Number(affiliate.totalEarned),
          pendingPayout: Number(affiliate.pendingPayout),
          commissionPct: Number(affiliate.commissionPct),
        } : null}
      />

      {affiliate && (
        <div className="glass-card p-6">
          <h2 className="text-sm font-semibold text-white mb-4">How Promo Affiliate Works</h2>
          <div className="space-y-3 text-sm text-gray-400">
            <p>• Share your unique referral link with friends, on social media, or your website.</p>
            <p>• When someone registers using your link and makes a purchase, you earn <span className="text-white font-medium">{Number(affiliate.commissionPct)}% commission</span>.</p>
            <p>• Earnings are added to your <span className="text-cyan-400">wallet balance</span> automatically.</p>
            <p>• Use your balance to buy any product on MetraMart instantly.</p>
            <p className="text-yellow-400/80">Note: Promo affiliate earnings are store credit only — not withdrawable cash. See Partner Program for cash payouts.</p>
          </div>
        </div>
      )}
    </div>
  );
}
