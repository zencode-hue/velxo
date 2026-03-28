import type { Metadata } from "next";

export const metadata: Metadata = { title: "Privacy Policy — Velxo" };

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-3xl font-bold text-white mb-2">Privacy Policy</h1>
      <p className="text-gray-500 text-sm mb-10">Last updated: March 2025</p>
      <div className="space-y-8 text-gray-400 text-sm leading-relaxed">
        {[
          { title: "1. Information We Collect", body: "We collect your email address, name, and order history when you create an account. We also collect anonymous page view data to improve our service. We do not collect payment card information — all crypto payments are processed by NOWPayments." },
          { title: "2. How We Use Your Information", body: "We use your information to process orders, deliver products, send order confirmations, and provide customer support. We may send promotional emails if you opt in. You can unsubscribe at any time." },
          { title: "3. Data Security", body: "All inventory credentials are encrypted with AES-256-GCM before storage. Passwords are hashed using bcrypt. We use HTTPS for all communications. We take security seriously and regularly review our practices." },
          { title: "4. Data Sharing", body: "We do not sell your personal data to third parties. We share data only with service providers necessary to operate our platform (email delivery, payment processing). All providers are bound by confidentiality agreements." },
          { title: "5. Cookies", body: "We use session cookies for authentication and localStorage for wishlist and cart functionality. We use anonymous analytics to understand how visitors use our site. No third-party tracking cookies are used." },
          { title: "6. Your Rights", body: "You have the right to access, correct, or delete your personal data. To exercise these rights, contact us at support@velxo.shop. We will respond within 30 days." },
          { title: "7. Data Retention", body: "We retain your account data for as long as your account is active. Order history is retained for 2 years for legal compliance. You can request account deletion at any time." },
          { title: "8. Contact", body: "For privacy questions, contact us at privacy@velxo.shop or via our Discord server." },
        ].map((section) => (
          <div key={section.title}>
            <h2 className="text-base font-semibold text-white mb-2">{section.title}</h2>
            <p>{section.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
