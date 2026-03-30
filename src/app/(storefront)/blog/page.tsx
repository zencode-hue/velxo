import type { Metadata } from "next";
export const dynamic = "force-dynamic";

import Link from "next/link";
import { db } from "@/lib/db";
import { FileText } from "lucide-react";

export const metadata: Metadata = {
  title: "Blog — Velxo",
  description: "Tips, guides, and news about digital products, streaming, AI tools, and more.",
};

const CATEGORY_COLORS: Record<string, string> = {
  Streaming: "text-red-400 bg-red-500/10",
  "AI Tools": "text-blue-400 bg-blue-500/10",
  Software: "text-green-400 bg-green-500/10",
  Gaming: "text-purple-400 bg-purple-500/10",
  Tips: "text-yellow-400 bg-yellow-500/10",
  News: "text-cyan-400 bg-cyan-500/10",
  General: "text-gray-400 bg-gray-500/10",
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
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold text-white mb-3">Velxo Blog</h1>
        <p className="text-gray-500 text-lg">Guides, tips, and news about digital products</p>
      </div>

      {posts.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <FileText size={48} className="mx-auto mb-4 opacity-20" />
          <p>No posts yet. Check back soon!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {posts.map((post) => (
            <Link key={post.slug} href={`/blog/${post.slug}`}
              className="group rounded-xl border border-white/8 bg-[#1a1b23] p-6 hover:border-purple-600/40 hover:shadow-lg hover:shadow-purple-600/10 transition-all duration-300">
              <div className="flex items-start justify-between mb-4">
                <span className="text-3xl">{post.emoji}</span>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${CATEGORY_COLORS[post.category] ?? "text-gray-400 bg-gray-500/10"}`}>
                  {post.category}
                </span>
              </div>
              <h2 className="text-lg font-bold text-white mb-2 group-hover:text-purple-300 transition-colors leading-snug">{post.title}</h2>
              <p className="text-sm text-gray-500 leading-relaxed mb-4 line-clamp-2">{post.excerpt}</p>
              <div className="text-xs text-gray-600">
                {new Date(post.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

