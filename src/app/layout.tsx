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
const APP_DESCRIPTION = "Buy cheap Netflix, Spotify, IPTV, ChatGPT Plus, gaming keys and software licenses. Instant automated delivery. Secure crypto payments. Best prices guaranteed.";

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: "Velxo Shop - Cheap Netflix, Spotify & Digital Subscriptions",
    template: "%s - Velxo Shop",
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
    siteName: "Velxo Shop",
    title: "Velxo Shop - Cheap Netflix, Spotify & Digital Subscriptions",
    description: APP_DESCRIPTION,
    images: [
      {
        url: `${APP_URL}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "Velxo Shop - Buy Cheap Digital Subscriptions",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@velxoshop",
    creator: "@velxoshop",
    title: "Velxo Shop - Cheap Netflix, Spotify & Digital Subscriptions",
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
    icon: "/icon",
    shortcut: "/icon",
    apple: "/icon",
  },
  alternates: {
    canonical: APP_URL,
  },
};

const jsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Velxo Shop",
    alternateName: "Velxo",
    url: APP_URL,
    description: APP_DESCRIPTION,
    potentialAction: {
      "@type": "SearchAction",
      target: { "@type": "EntryPoint", urlTemplate: `${APP_URL}/search?q={search_term_string}` },
      "query-input": "required name=search_term_string",
    },
  },
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Velxo Shop",
    url: APP_URL,
    logo: {
      "@type": "ImageObject",
      url: `${APP_URL}/icon`,
      width: 32,
      height: 32,
    },
    sameAs: [],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer support",
      url: `${APP_URL}/support`,
    },
  },
  {
    "@context": "https://schema.org",
    "@type": "Store",
    name: "Velxo Shop",
    url: APP_URL,
    description: APP_DESCRIPTION,
    priceRange: "$1 - $500",
    currenciesAccepted: "USD",
    paymentAccepted: "Cryptocurrency, Gift Card",
  },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <script
          src="https://analytics.ahrefs.com/analytics.js"
          data-key="eaaiCjFWJryD0qKxQzgRgw"
          async
        />
      </head>
      <body className="min-h-screen bg-background text-white antialiased">
        {children}
      </body>
    </html>
  );
}
