import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";

const posts: Record<string, { title: string; category: string; date: string; readTime: string; emoji: string; content: string }> = {
  "best-streaming-services-2025": {
    title: "Best Streaming Services in 2025: Complete Guide",
    category: "Streaming", date: "March 20, 2025", readTime: "5 min read", emoji: "📺",
    content: `Whether you're a movie buff, sports fan, or anime lover, there's a streaming service for you. Here's our breakdown of the top platforms in 2025.

**Netflix** remains the king of original content. With shows like Stranger Things, The Crown, and a massive library of films, it's hard to beat. The Premium plan gives you 4K streaming on 4 screens simultaneously.

**Disney+** is essential if you love Marvel, Star Wars, Pixar, or National Geographic. The content library keeps growing and the price is competitive.

**HBO Max** (now just Max) has arguably the best quality-per-show ratio. Game of Thrones, The Last of Us, Succession — if you want prestige TV, this is it.

**Amazon Prime Video** is often overlooked but includes The Boys, Rings of Power, and a huge library of licensed content. Plus you get Prime shipping.

**Crunchyroll** is the go-to for anime fans. With the largest anime library online and simulcasts of new episodes, it's a must-have for the genre.

**Our recommendation:** Start with Netflix + one specialty service (Disney+ for families, HBO Max for drama, Crunchyroll for anime). You can always rotate subscriptions monthly.`,
  },
  "chatgpt-vs-claude-2025": {
    title: "ChatGPT Pro vs Claude Pro: Which AI is Worth It?",
    category: "AI Tools", date: "March 15, 2025", readTime: "7 min read", emoji: "🤖",
    content: `Both ChatGPT Pro and Claude Pro are excellent AI assistants, but they have different strengths.

**ChatGPT Pro (GPT-4o)** excels at:
- Code generation and debugging
- Image generation with DALL-E
- Web browsing and real-time information
- Voice conversations
- Plugin ecosystem

**Claude Pro** excels at:
- Long document analysis (200k token context)
- Writing and editing
- Nuanced reasoning
- Following complex instructions precisely
- Being more "honest" about limitations

**Which should you choose?**

If you're a developer or need image generation, go with ChatGPT Pro. If you work with long documents, need detailed writing assistance, or want a more conversational AI, Claude Pro is excellent.

Many power users subscribe to both — they're complementary tools rather than direct competitors.`,
  },
};

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const post = posts[params.slug];
  if (!post) return { title: "Post Not Found — Velxo" };
  return { title: `${post.title} — Velxo Blog`, description: post.content.slice(0, 160) };
}

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = posts[params.slug];
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
        <div className="flex items-center gap-3 text-sm text-gray-500">
          <span>{post.date}</span><span>·</span><span>{post.readTime}</span>
        </div>
      </div>

      <div className="prose prose-invert max-w-none">
        {post.content.split("\n\n").map((para, i) => (
          <p key={i} className="text-gray-400 leading-relaxed mb-4 text-base"
            dangerouslySetInnerHTML={{ __html: para.replace(/\*\*(.*?)\*\*/g, "<strong class='text-white'>$1</strong>") }} />
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
