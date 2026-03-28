import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Blog — Velxo",
  description: "Tips, guides, and news about digital products, streaming, AI tools, and more.",
};

const posts = [
  {
    slug: "best-streaming-services-2025",
    title: "Best Streaming Services in 2025: Complete Guide",
    excerpt: "Netflix, Disney+, HBO Max — which streaming service gives you the most value? We break down every major platform so you can decide.",
    category: "Streaming",
    date: "March 20, 2025",
    readTime: "5 min read",
    emoji: "📺",
  },
  {
    slug: "chatgpt-vs-claude-2025",
    title: "ChatGPT Pro vs Claude Pro: Which AI is Worth It?",
    excerpt: "Both are powerful AI assistants, but they excel at different things. Here's an honest comparison to help you choose.",
    category: "AI Tools",
    date: "March 15, 2025",
    readTime: "7 min read",
    emoji: "🤖",
  },
  {
    slug: "vpn-guide-2025",
    title: "Why You Need a VPN in 2025 (And Which One to Get)",
    excerpt: "Privacy online is more important than ever. We compare ExpressVPN, NordVPN, and others to find the best value.",
    category: "Software",
    date: "March 10, 2025",
    readTime: "6 min read",
    emoji: "🔒",
  },
  {
    slug: "gaming-subscriptions-worth-it",
    title: "Are Gaming Subscriptions Worth It? Xbox vs PlayStation vs PC",
    excerpt: "Game Pass, PS Plus, Ubisoft+ — we calculate the real value of each subscription based on what you actually play.",
    category: "Gaming",
    date: "March 5, 2025",
    readTime: "8 min read",
    emoji: "🎮",
  },
  {
    slug: "how-to-save-on-digital-subscriptions",
    title: "10 Ways to Save Money on Digital Subscriptions",
    excerpt: "Stop overpaying for streaming and software. These tips will cut your monthly subscription costs significantly.",
    category: "Tips",
    date: "February 28, 2025",
    readTime: "4 min read",
    emoji: "💰",
  },
  {
    slug: "adobe-creative-cloud-alternatives",
    title: "Adobe Creative Cloud Alternatives That Actually Work",
    excerpt: "Adobe is expensive. Here are the best alternatives for designers, video editors, and photographers on a budget.",
    category: "Software",
    date: "February 20, 2025",
    readTime: "6 min read",
    emoji: "🎨",
  },
];

const CATEGORY_COLORS: Record<string, string> = {
  Streaming: "text-red-400 bg-red-500/10",
  "AI Tools": "text-blue-400 bg-blue-500/10",
  Software: "text-green-400 bg-green-500/10",
  Gaming: "text-purple-400 bg-purple-500/10",
  Tips: "text-yellow-400 bg-yellow-500/10",
};

export default function BlogPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold text-white mb-3">Velxo Blog</h1>
        <p className="text-gray-500 text-lg">Guides, tips, and news about digital products</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {posts.map((post) => (
          <Link key={post.slug} href={`/blog/${post.slug}`}
            className="group rounded-xl border border-white/8 bg-[#111111] p-6 hover:border-purple-600/40 hover:shadow-lg hover:shadow-purple-600/10 transition-all duration-300">
            <div className="flex items-start justify-between mb-4">
              <span className="text-3xl">{post.emoji}</span>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${CATEGORY_COLORS[post.category] ?? "text-gray-400 bg-gray-500/10"}`}>
                {post.category}
              </span>
            </div>
            <h2 className="text-lg font-bold text-white mb-2 group-hover:text-purple-300 transition-colors leading-snug">
              {post.title}
            </h2>
            <p className="text-sm text-gray-500 leading-relaxed mb-4 line-clamp-2">{post.excerpt}</p>
            <div className="flex items-center gap-3 text-xs text-gray-600">
              <span>{post.date}</span>
              <span>·</span>
              <span>{post.readTime}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
