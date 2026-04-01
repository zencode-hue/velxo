import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const post = await (db as any).blogPost.findUnique({
    where: { slug: params.slug, published: true },
    select: { title: true, excerpt: true },
  }) as { title: string; excerpt: string } | null;
  if (!post) return { title: "Post Not Found — Velxo" };
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://velxo.shop";
  return {
    title: `${post.title} - Velxo Blog`,
    description: post.excerpt,
    alternates: { canonical: `${appUrl}/blog/${params.slug}` },
    openGraph: {
      title: `${post.title} - Velxo Blog`,
      description: post.excerpt,
      url: `${appUrl}/blog/${params.slug}`,
      siteName: "Velxo Shop",
      type: "article",
    },
  };
}

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const post = await (db as any).blogPost.findUnique({
    where: { slug: params.slug, published: true },
  }) as { id: string; title: string; excerpt: string; content: string; category: string; emoji: string; createdAt: Date } | null;

  if (!post) notFound();

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <Link href="/blog" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-white transition-colors mb-8">
        <ArrowLeft size={16} /> Back to Blog
      </Link>

      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-3xl">{post.emoji}</span>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-medium text-purple-400 bg-purple-500/10">{post.category}</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4 leading-tight">{post.title}</h1>
        <p className="text-gray-500 text-sm">
          {new Date(post.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
        </p>
      </div>

      <div className="space-y-4">
        {post.content.split("\n\n").map((para, i) => (
          <p key={i} className="text-gray-400 leading-relaxed text-base"
            dangerouslySetInnerHTML={{ __html: para.replace(/\*\*(.*?)\*\*/g, "<strong class='text-white font-semibold'>$1</strong>") }} />
        ))}
      </div>

      <div className="mt-12 p-6 rounded-xl border border-purple-600/20 bg-purple-600/5">
        <p className="text-white font-semibold mb-2">Ready to get started?</p>
        <p className="text-sm text-gray-500 mb-4">Browse our catalog of digital products with instant delivery.</p>
        <Link href="/products" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white"
          style={{ background: "linear-gradient(135deg, #7c3aed, #8b5cf6)" }}>
          Browse Products
        </Link>
      </div>
    </div>
  );
}
