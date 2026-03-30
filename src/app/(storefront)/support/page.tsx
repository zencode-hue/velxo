import type { Metadata } from "next";
import Link from "next/link";
import { MessageCircle, Mail, Clock, CheckCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Support — Velxo Shop",
  description: "Get help with your Velxo Shop orders, account, and products. Live chat, Discord, and email support available.",
};

const faqs = [
  { q: "How long does delivery take?", a: "Delivery is instant and automated. As soon as your payment is confirmed, your credentials are sent to your registered email address." },
  { q: "What if my credentials don't work?", a: "Contact us on Discord immediately with your order ID. We'll replace your order within 24 hours, no questions asked." },
  { q: "Can I get a refund?", a: "Due to the digital nature of our products, all sales are final. However, if you receive invalid credentials, we will replace them." },
  { q: "How do I pay with crypto?", a: "Select 'Crypto Payment' at checkout. You'll be redirected to NOWPayments where you can pay with BTC, ETH, USDT, and 100+ other coins." },
  { q: "What is Card Payment (Key)?", a: "Card Payment (Key) lets you pay using a Binance USDT Gift Card. At checkout, click 'Card Payment (Key)' and you'll be redirected to Eneba to purchase the exact gift card amount. After purchase, come back and enter the card code — we'll verify it and deliver your order." },
  { q: "What is the wallet balance?", a: "Your wallet balance can be used to purchase any product instantly without going through a payment gateway. Top up via Card Payment (Key), crypto, or Discord." },
  { q: "How does the affiliate program work?", a: "Join from your dashboard, get a unique referral link, and earn 10% commission on every sale you refer. Earnings go directly to your wallet balance." },
  { q: "Is my data secure?", a: "Yes. All inventory credentials are encrypted with AES-256-GCM. We never store plain-text passwords or credentials." },
];

export default function SupportPage() {
  const discordUrl = process.env.NEXT_PUBLIC_DISCORD_URL ?? "https://discord.gg/velxo";

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-white mb-3">Support Center</h1>
        <p className="text-gray-500">We&apos;re here to help. Get answers fast.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
        <a href={discordUrl} target="_blank" rel="noopener noreferrer"
          className="rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-6 text-center hover:border-indigo-500/40 transition-all group">
          <MessageCircle size={28} className="text-indigo-400 mx-auto mb-3" />
          <h3 className="font-bold text-white mb-1">Discord</h3>
          <p className="text-xs text-gray-500">Fastest response. Join our server and open a ticket.</p>
          <span className="inline-block mt-3 text-xs text-indigo-400 group-hover:text-indigo-300">Open Discord →</span>
        </a>
        <div className="rounded-xl border border-white/8 bg-[#1a1b23] p-6 text-center">
          <Mail size={28} className="text-purple-400 mx-auto mb-3" />
          <h3 className="font-bold text-white mb-1">Email</h3>
          <p className="text-xs text-gray-500">support@velxo.shop</p>
          <span className="inline-block mt-3 text-xs text-gray-600">Response within 24h</span>
        </div>
        <div className="rounded-xl border border-white/8 bg-[#1a1b23] p-6 text-center">
          <Clock size={28} className="text-green-400 mx-auto mb-3" />
          <h3 className="font-bold text-white mb-1">Hours</h3>
          <p className="text-xs text-gray-500">24/7 automated delivery</p>
          <span className="inline-block mt-3 text-xs text-gray-600">Human support: Mon–Fri</span>
        </div>
      </div>

      <h2 className="text-2xl font-bold text-white mb-6">Frequently Asked Questions</h2>
      <div className="space-y-3 mb-12">
        {faqs.map((item) => (
          <details key={item.q} className="group rounded-xl border border-white/8 bg-[#1a1b23] hover:border-purple-600/20 transition-all">
            <summary className="p-5 cursor-pointer font-semibold text-white text-sm flex items-center justify-between list-none">
              <span className="flex items-center gap-2"><CheckCircle size={14} className="text-purple-400 shrink-0" />{item.q}</span>
              <span className="text-gray-500 group-open:rotate-180 transition-transform shrink-0 ml-2">▾</span>
            </summary>
            <p className="px-5 pb-5 text-sm text-gray-500 leading-relaxed">{item.a}</p>
          </details>
        ))}
      </div>

      <div className="rounded-xl border border-purple-600/20 bg-purple-600/5 p-8 text-center">
        <h3 className="text-xl font-bold text-white mb-2">Still need help?</h3>
        <p className="text-gray-500 text-sm mb-4">Our team is active on Discord and responds within minutes during business hours.</p>
        <Link href={discordUrl} target="_blank"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-white text-sm"
          style={{ background: "linear-gradient(135deg, #5865F2, #7289DA)" }}>
          <MessageCircle size={16} /> Join Discord
        </Link>
      </div>
    </div>
  );
}

