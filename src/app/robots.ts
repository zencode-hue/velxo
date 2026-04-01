import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: [
          "/",
          "/products",
          "/products/",
          "/deals",
          "/blog",
          "/blog/",
          "/about",
          "/support",
          "/affiliate",
          "/privacy",
          "/terms",
        ],
        disallow: [
          "/admin",
          "/admin/",
          "/api/",
          "/dashboard",
          "/dashboard/",
          "/checkout",
          "/checkout/",
          "/orders",
          "/orders/",
          "/wishlist",
          "/auth/",
          "/search",
          "/*?*",          // block all query string URLs (dealPrice, category filters, etc.)
        ],
      },
    ],
    sitemap: "https://velxo.shop/sitemap.xml",
  };
}
