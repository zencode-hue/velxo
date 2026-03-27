import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Velxo — Premium Digital Marketplace",
    template: "%s | Velxo",
  },
  description:
    "Buy streaming subscriptions, AI tools, software licenses, and gaming products with instant automated delivery.",
  keywords: [
    "digital marketplace",
    "streaming subscriptions",
    "AI tools",
    "software licenses",
    "gaming",
  ],
  authors: [{ name: "Velxo" }],
  creator: "Velxo",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: process.env.NEXT_PUBLIC_APP_URL,
    siteName: "Velxo",
    title: "Velxo — Premium Digital Marketplace",
    description:
      "Buy streaming subscriptions, AI tools, software licenses, and gaming products with instant automated delivery.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Velxo — Premium Digital Marketplace",
    description:
      "Buy streaming subscriptions, AI tools, software licenses, and gaming products with instant automated delivery.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen bg-background text-white antialiased">
        {children}
      </body>
    </html>
  );
}
