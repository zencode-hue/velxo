import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/products", "/products/"],
        disallow: ["/admin", "/admin/", "/api/", "/dashboard", "/checkout"],
      },
    ],
    sitemap: `${appUrl}/sitemap.xml`,
  };
}
