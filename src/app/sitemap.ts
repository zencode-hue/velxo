import { MetadataRoute } from "next";
import { db } from "@/lib/db";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const products = await db.product.findMany({
    where: { isActive: true },
    select: { id: true, updatedAt: true },
  });

  const productUrls = products.map((p) => ({
    url: `${appUrl}/products/${p.id}`,
    lastModified: p.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  return [
    { url: appUrl, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${appUrl}/products`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${appUrl}/auth/login`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
    { url: `${appUrl}/auth/register`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.4 },
    ...productUrls,
  ];
}
