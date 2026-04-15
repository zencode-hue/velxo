import type { Metadata } from "next";
export const dynamic = "force-dynamic";

import Link from "next/link";
import { db } from "@/lib/db";
import { FileText } from "lucide-react";

export const metadata: Metadata = {
  title: "Blog — Velxo",
  description: "Tips, guides, and news about digital products, streaming, AI tools, and more.",
};

const CATEGORY_COLORS: Record<string, { text: string; bg: string }> = {
  Streaming: { text: "#fca5a5", bg: "rgba(248,113,113,0.1)" },
  "AI Tools": { text: "#93c5fd", bg: "rgba(147,197,253,0.1)" },
  Software: { text: "#6ee7b7", bg: "rgba(110,231,183,0.1)" },
  Gaming: { text: "#c4b5fd", bg: "rgba(196,181,253,0.1)" },
  Tips: { text: "#fde68a", bg: "rgba(253,230,138,0.1)" },
  News: { text: "#7dd3fc", bg: "rgba(125,211,252,0.1)" },
  General: { text: "rgba(255,255,255,0.5)", bg: "rgba(255,255,255,0.05)" },
};

export default async function BlogPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const posts = await (db as any).blogPost.findMany({
    where: { published: true },
    orderBy: { createdAt: "desc" },
    select: { id: true, slug: true, title: true, excerpt: true, category: true, emoji: true, createdAt: true },
  }) as Array<{ id: string; slug: string; title: string; excerpt: string; category: string; emoji: string; createdAt: Date }>;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="mb-14 text-center">
        <h1 className="text-4xl sm:text-5xl font-black text-white mb-3 tracking-tight">Velxo Blog</h1>
        <p className="text-lg" style={{ color: "rgba(255,255,255,0.4)" }}>Guides, tips, and news about digital products</p>
      </div>

      {posts.length === 0 ? (
        <div className="text-center py-20" style={{ color: "rgba(255,255,255,0.3)" }}>
          <FileText size={48} className="mx-auto mb-4 opacity-20" />
          <p>No posts yet. Check back soon!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {posts.map((post) => {
            const cat = CATEGORY_COLORS[post.category] ?? CATEGORY_COLORS.General;
            return (
              <Link key={post.slug} href={`/blog/${post.slug}`}
                className="group rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1"
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.07)",
                }}>
                <div className="flex items-start justify-between mb-4">
                  <span className="text-3xl">{post.emoji}</span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-medium"
                    style={{ color: cat.text, background: cat.bg }}>
                    {post.category}
                  </span>
                </div>
                <h2 className="text-base font-bold text-white mb-2 leading-snug group-hover:opacity-80 transition-opacity">
                  {post.title}
                </h2>
                <p className="text-sm leading-relaxed mb-4 line-clamp-2" style={{ color: "rgba(255,255,255,0.4)" }}>
                  {post.excerpt}
                </p>
                <div className="text-xs" style={{ color: "rgba(255,255,255,0.25)" }}>
                  {new Date(post.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
