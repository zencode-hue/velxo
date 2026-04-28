import Navbar from "@/components/storefront/Navbar";
import Providers from "@/components/storefront/Providers";
import PageViewTracker from "@/components/PageViewTracker";
import AnnouncementBar from "@/components/storefront/AnnouncementBar";
import TawkChat from "@/components/TawkChat";
import RecentPurchasePopupWrapper from "@/components/storefront/RecentPurchasePopupWrapper";
import FloatingSupportButton from "@/components/storefront/FloatingSupportButton";
import ExitIntentPopup from "@/components/storefront/ExitIntentPopup";
import Link from "next/link";
import { MessageCircle, Mail, XIcon } from "lucide-react";
import VelxoLogo from "@/components/VelxoLogo";
import { CurrencyProvider } from "@/contexts/CurrencyContext";
import { CartProvider } from "@/contexts/CartContext";

function Footer() {
  return (
    <footer className="border-t mt-20" style={{ borderColor: "rgba(30,37,53,0.8)", background: "rgba(10,11,15,0.98)" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 mb-10">
          <div className="col-span-2 sm:col-span-1">
            <div className="flex items-center gap-2.5 font-bold text-xl mb-3">
              <VelxoLogo size={26} />
              <span style={{ background: "linear-gradient(135deg, #60a5fa, #818cf8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>Velxo</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed mb-4">Premium digital marketplace. Instant delivery, secure payments, 500+ products.</p>
            <div className="flex items-center gap-2">
              <a href="https://discord.gg/velxo" target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg text-slate-600 hover:text-indigo-400 hover:bg-indigo-500/10 transition-all">
                <MessageCircle size={15} />
              </a>
              <a href="https://twitter.com/velxoshop" target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg text-slate-600 hover:text-blue-400 hover:bg-blue-500/10 transition-all">
                <XIcon size={15} />
              </a>
              <a href="mailto:support@velxo.shop" className="p-2 rounded-lg text-slate-600 hover:text-sky-400 hover:bg-sky-500/10 transition-all">
                <Mail size={15} />
              </a>
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Products</p>
            <div className="space-y-2">
              {[["All Products", "/products"], ["Streaming", "/products?category=STREAMING"], ["AI Tools", "/products?category=AI_TOOLS"], ["Software", "/products?category=SOFTWARE"], ["Gaming", "/products?category=GAMING"], ["Hot Deals", "/deals"]].map(([label, href]) => (
                <Link key={href} href={href} className="block text-sm text-slate-600 hover:text-slate-300 transition-colors">{label}</Link>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Company</p>
            <div className="space-y-2">
              {[["About", "/about"], ["Blog", "/blog"], ["Affiliates", "/affiliate"], ["Support", "/support"], ["Terms", "/terms"], ["Privacy", "/privacy"]].map(([label, href]) => (
                <Link key={href} href={href} className="block text-sm text-slate-600 hover:text-slate-300 transition-colors">{label}</Link>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Account</p>
            <div className="space-y-2">
              {[["Sign In", "/auth/login"], ["Register", "/auth/register"], ["Dashboard", "/dashboard"], ["Search", "/search"]].map(([label, href]) => (
                <Link key={href} href={href} className="block text-sm text-slate-600 hover:text-slate-300 transition-colors">{label}</Link>
              ))}
            </div>
          </div>
        </div>
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3" style={{ borderTop: "1px solid rgba(30,37,53,0.8)" }}>
          <p className="text-xs text-slate-700">© {new Date().getFullYear()} Velxo. All rights reserved.</p>
          <div className="flex items-center gap-4 text-xs text-slate-700">
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
      <CurrencyProvider>
        <CartProvider>
          <PageViewTracker />
          <TawkChat />
          <AnnouncementBar />
          <Navbar />
          <main className="min-h-screen">{children}</main>
          <Footer />
          <RecentPurchasePopupWrapper />
          <FloatingSupportButton />
          <ExitIntentPopup />
        </CartProvider>
      </CurrencyProvider>
    </Providers>
  );
}

