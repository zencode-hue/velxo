"use client";

import { useState } from "react";
import { Mail, CheckCircle } from "lucide-react";

export default function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    // In production, send to your email service
    setDone(true);
  }

  return (
    <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="rounded-2xl p-8 sm:p-10 text-center relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, rgba(124,58,237,0.15) 0%, rgba(139,92,246,0.08) 100%)", border: "1px solid rgba(124,58,237,0.25)" }}>
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: "radial-gradient(circle at 50% 50%, #5865f2 0%, transparent 70%)" }} />
        <div className="relative z-10">
          <Mail size={32} className="text-purple-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Stay in the Loop</h2>
          <p className="text-gray-400 text-sm mb-6">Get notified about new products, exclusive deals, and discount codes.</p>
          {done ? (
            <div className="flex items-center justify-center gap-2 text-green-400">
              <CheckCircle size={20} /> <span className="font-medium">You&apos;re subscribed!</span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex gap-3 max-w-md mx-auto">
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com" required
                className="input-field flex-1 text-sm py-2.5" />
              <button type="submit" className="btn-primary text-sm px-5 py-2.5 shrink-0">Subscribe</button>
            </form>
          )}
          <p className="text-xs text-gray-600 mt-3">No spam. Unsubscribe anytime.</p>
        </div>
      </div>
    </section>
  );
}

