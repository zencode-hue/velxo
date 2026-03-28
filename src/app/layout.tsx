import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME ?? "Velxo";

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: `${APP_NAME} — Premium Digital Marketplace`,
    template: `%s | ${APP_NAME}`,
  },
  description:
    "Buy streaming subscriptions, AI tools, software licenses, and gaming products with instant automated delivery. Secure crypto payments accepted.",
  keywords: [
    "digital marketplace",
    "streaming subscriptions",
    "AI tools",
    "software licenses",
    "gaming keys",
    "buy digital products",
    "crypto payments",
    "instant delivery",
    "Netflix subscription",
    "ChatGPT subscription",
  ],
  authors: [{ name: APP_NAME }],
  creator: APP_NAME,
  publisher: APP_NAME,
  category: "shopping",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: APP_URL,
    siteName: APP_NAME,
    title: `${APP_NAME} — Premium Digital Marketplace`,
    description:
      "Buy streaming subscriptions, AI tools, software licenses, and gaming products with instant automated delivery.",
  },
  twitter: {
    card: "summary_large_image",
    title: `${APP_NAME} — Premium Digital Marketplace`,
    description:
      "Buy streaming subscriptions, AI tools, software licenses, and gaming products with instant automated delivery.",
    creator: `@${APP_NAME.toLowerCase()}`,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    // Add your Google Search Console verification token here
    // google: "your-verification-token",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: APP_NAME,
  url: APP_URL,
  description: "Premium digital marketplace for streaming, AI tools, software, and gaming products.",
  potentialAction: {
    "@type": "SearchAction",
    target: { "@type": "EntryPoint", urlTemplate: `${APP_URL}/products?search={search_term_string}` },
    "query-input": "required name=search_term_string",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
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
