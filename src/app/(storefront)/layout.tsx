import Navbar from "@/components/storefront/Navbar";
import Providers from "@/components/storefront/Providers";
import PageViewTracker from "@/components/PageViewTracker";
import Link from "next/link";
import { Zap } from "lucide-react";

function Footer() {
  return (
    <footer className="border-t border-white/5 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2 font-bold text-lg">
            <Zap size={18} className="text-purple-500" />
            <span className="gradient-text">Velxo</span>
          </div>
          <nav className="flex flex-wrap justify-center gap-6 text-sm text-gray-500">
            <Link href="/products" className="hover:text-white transition-colors">
              Products
            </Link>
            <Link href="/auth/login" className="hover:text-white transition-colors">
              Sign In
            </Link>
            <Link href="/auth/register" className="hover:text-white transition-colors">
              Register
            </Link>
          </nav>
          <p className="text-xs text-gray-600">
            © {new Date().getFullYear()} Velxo. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Providers>
      <PageViewTracker />
      <Navbar />
      <main className="min-h-screen">{children}</main>
      <Footer />
    </Providers>
  );
}
