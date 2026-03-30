import type { Metadata } from "next";

export const metadata: Metadata = { title: "Terms of Service — Velxo Shop", description: "Read the terms of service for Velxo Shop digital marketplace." };

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-3xl font-bold text-white mb-2">Terms of Service</h1>
      <p className="text-gray-500 text-sm mb-10">Last updated: March 2025</p>
      <div className="space-y-8 text-gray-400 text-sm leading-relaxed">
        {[
          { title: "1. Acceptance of Terms", body: "By accessing and using Velxo (velxo.shop), you accept and agree to be bound by these Terms of Service. If you do not agree, please do not use our service." },
          { title: "2. Digital Products", body: "All products sold on Velxo are digital goods. Upon successful payment, credentials or license keys are delivered automatically to your registered email address. Due to the nature of digital products, all sales are final." },
          { title: "3. Refund Policy", body: "We do not offer refunds on digital products once delivered. However, if you receive invalid or non-working credentials, we will replace them at no additional cost. Contact support within 24 hours of purchase." },
          { title: "4. Account Responsibility", body: "You are responsible for maintaining the security of your account credentials. Do not share your account with others. We are not liable for any unauthorized access to your account." },
          { title: "5. Prohibited Uses", body: "You may not use Velxo for any illegal purposes, to distribute malware, to engage in fraud, or to violate any applicable laws. We reserve the right to terminate accounts that violate these terms." },
          { title: "6. Payment", body: "We accept cryptocurrency payments via NOWPayments and manual payments via Discord. All prices are listed in USD. Crypto payments are converted at the current market rate." },
          { title: "7. Affiliate Program", body: "Affiliates earn 10% commission on referred sales. Commission is credited to your wallet balance. We reserve the right to modify commission rates with 30 days notice." },
          { title: "8. Limitation of Liability", body: "Velxo is not liable for any indirect, incidental, or consequential damages arising from the use of our service. Our total liability is limited to the amount paid for the specific product in question." },
          { title: "9. Changes to Terms", body: "We reserve the right to modify these terms at any time. Continued use of the service after changes constitutes acceptance of the new terms." },
          { title: "10. Contact", body: "For questions about these terms, contact us at support@velxo.shop or via our Discord server." },
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
