import { db } from "@/lib/db";
import RecentPurchasePopup from "./RecentPurchasePopup";

export default async function RecentPurchasePopupWrapper() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const products = await (db.product.findMany as any)({
    where: { isActive: true },
    take: 20,
    select: { title: true },
  }) as Array<{ title: string }>;

  if (products.length === 0) return null;

  return <RecentPurchasePopup products={products} enabled={true} />;
}
