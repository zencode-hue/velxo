import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://velxo.shop";
const APP_NAME = "Velxo Shop";
const APP_DESCRIPTION = "Buy Netflix, ChatGPT, Spotify, gaming keys, AI tools and software licenses with instant automated delivery. Secure crypto & card payments. 10,000+ happy customers.";

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: "Velxo Shop - Buy Digital Products Instantly",
    template: "%s | Velxo Shop",
  },
  description: APP_DESCRIPTION,
  keywords: [
    "buy digital products",
    "streaming subscriptions",
    "Netflix subscription",
    "Spotify premium",
    "ChatGPT Plus",
    "AI tools",
    "software licenses",
    "gaming keys",
    "instant delivery digital goods",
    "crypto payment digital store",
    "buy Netflix account",
    "buy Spotify account",
    "digital marketplace",
    "Velxo Shop",
    "velxo.shop",
  ],
  authors: [{ name: "Velxo Shop", url: APP_URL }],
  creator: "Velxo Shop",
  publisher: "Velxo Shop",
  category: "shopping",
  applicationName: "Velxo Shop",
  referrer: "origin-when-cross-origin",
  formatDetection: { email: false, address: false, telephone: false },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: APP_URL,
    siteName: APP_NAME,
    title: "Velxo Shop - Buy Digital Products Instantly",
    description: APP_DESCRIPTION,
    images: [
      {
        url: `${APP_URL}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "Velxo Shop — Premium Digital Marketplace",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@velxoshop",
    creator: "@velxoshop",
    title: "Velxo Shop - Buy Digital Products Instantly",
    description: APP_DESCRIPTION,
    images: [`${APP_URL}/og-image.png`],
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icon-16.png", sizes: "16x16", type: "image/png" },
      { url: "/icon-32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [{ url: "/apple-icon.png", sizes: "180x180" }],
    shortcut: "/favicon.ico",
  },
  manifest: "/manifest.json",
  alternates: {
    canonical: APP_URL,
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Store",
  name: "Velxo Shop",
  url: APP_URL,
  logo: `${APP_URL}/logo.png`,
  description: APP_DESCRIPTION,
  priceRange: "$1 - $500",
  currenciesAccepted: "USD",
  paymentAccepted: "Cryptocurrency, Gift Card",
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Digital Products",
    itemListElement: [
      { "@type": "Offer", itemOffered: { "@type": "Product", name: "Streaming Subscriptions" } },
      { "@type": "Offer", itemOffered: { "@type": "Product", name: "AI Tools" } },
      { "@type": "Offer", itemOffered: { "@type": "Product", name: "Software Licenses" } },
      { "@type": "Offer", itemOffered: { "@type": "Product", name: "Gaming Keys" } },
    ],
  },
  potentialAction: {
    "@type": "SearchAction",
    target: { "@type": "EntryPoint", urlTemplate: `${APP_URL}/search?q={search_term_string}` },
    "query-input": "required name=search_term_string",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-screen bg-background text-white antialiased">
        {children}
      </body>
    </html>
  );
}
