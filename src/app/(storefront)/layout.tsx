import Navbar from "@/components/storefront/Navbar";
import Providers from "@/components/storefront/Providers";
import PageViewTracker from "@/components/PageViewTracker";
import AnnouncementBar from "@/components/storefront/AnnouncementBar";
import TawkChat from "@/components/TawkChat";
import Link from "next/link";
import { Twitter, MessageCircle, Mail } from "lucide-react";
import VelxoLogo from "@/components/VelxoLogo";

function Footer() {
  return (
    <footer className="border-t border-white/5 mt-20" style={{ background: "rgba(14,15,20,0.95)" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 mb-10">
          <div className="col-span-2 sm:col-span-1">
            <div className="flex items-center gap-2 font-bold text-xl mb-3">
              <VelxoLogo size={28} />
              <span style={{ background: "linear-gradient(135deg, #00d4ff, #5865f2)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>Velxo Shop</span>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed mb-4">Premium digital marketplace. Instant delivery, secure payments, 500+ products.</p>
            <div className="flex items-center gap-3">
              <a href="https://discord.gg/velxo" target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg text-gray-600 hover:text-indigo-400 hover:bg-indigo-500/10 transition-all">
                <MessageCircle size={16} />
              </a>
              <a href="https://twitter.com/velxoshop" target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg text-gray-600 hover:text-blue-400 hover:bg-blue-500/10 transition-all">
                <Twitter size={16} />
              </a>
              <a href="mailto:support@velxo.shop" className="p-2 rounded-lg text-gray-600 hover:text-purple-400 hover:bg-purple-500/10 transition-all">
                <Mail size={16} />
              </a>
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Products</p>
            <div className="space-y-2">
              {[["All Products", "/products"], ["Streaming", "/products?category=STREAMING"], ["AI Tools", "/products?category=AI_TOOLS"], ["Software", "/products?category=SOFTWARE"], ["Gaming", "/products?category=GAMING"], ["Hot Deals", "/deals"]].map(([label, href]) => (
                <Link key={href} href={href} className="block text-sm text-gray-600 hover:text-gray-300 transition-colors">{label}</Link>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Company</p>
            <div className="space-y-2">
              {[["About", "/about"], ["Blog", "/blog"], ["Affiliates", "/affiliate"], ["Support", "/support"], ["Terms", "/terms"], ["Privacy", "/privacy"]].map(([label, href]) => (
                <Link key={href} href={href} className="block text-sm text-gray-600 hover:text-gray-300 transition-colors">{label}</Link>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Account</p>
            <div className="space-y-2">
              {[["Sign In", "/auth/login"], ["Register", "/auth/register"], ["Dashboard", "/dashboard"], ["Search", "/search"]].map(([label, href]) => (
                <Link key={href} href={href} className="block text-sm text-gray-600 hover:text-gray-300 transition-colors">{label}</Link>
              ))}
            </div>
          </div>
        </div>
        <div className="border-t border-white/5 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-700">© {new Date().getFullYear()} Velxo. All rights reserved.</p>
          <div className="flex items-center gap-4 text-xs text-gray-700">
            <span>velxo.shop</span>
            <span>·</span>
            <span>Instant Digital Delivery</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default function StorefrontLayout({ children }: { children: React.ReactNode }) {
  return (
    <Providers>
      <PageViewTracker />
      <TawkChat />
      <AnnouncementBar />
      <Navbar />
      <main className="min-h-screen">{children}</main>
      <Footer />
    </Providers>
  );
}

