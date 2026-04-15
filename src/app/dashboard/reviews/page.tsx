import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { Star } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ReviewsPage() {
  const session = await getServerSession();
  if (!session?.user?.id) redirect("/auth/login");

  const reviews = await db.review.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: { product: { select: { title: true } } },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-8 flex items-center gap-2">
        <Star size={22} className="text-yellow-400" /> My Reviews
      </h1>

      {reviews.length === 0 ? (
        <div className="glass-card p-12 text-center text-gray-500">
          <Star size={40} className="mx-auto mb-4 opacity-20" />
          <p>You haven&apos;t left any reviews yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((r) => (
            <div key={r.id} className="glass-card p-5">
              <div className="flex items-center justify-between mb-2">
                <p className="text-white font-medium">{r.product.title}</p>
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={13} className={i < r.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-600"} />
                  ))}
                </div>
              </div>
              {r.comment && <p className="text-sm text-gray-400">{r.comment}</p>}
              <p className="text-xs text-gray-600 mt-2">{new Date(r.createdAt).toLocaleDateString()}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
