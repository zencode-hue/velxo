import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-auth";
import Link from "next/link";
import { Plus, FileText, Eye, EyeOff } from "lucide-react";

export default async function AdminBlogPage() {
  await requireAdmin();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const posts = await (db as any).blogPost.findMany({
    orderBy: { createdAt: "desc" },
    select: { id: true, slug: true, title: true, category: true, emoji: true, published: true, createdAt: true },
  }) as Array<{ id: string; slug: string; title: string; category: string; emoji: string; published: boolean; createdAt: Date }>;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <FileText size={22} className="text-purple-400" /> Blog Posts
        </h1>
        <Link href="/admin/blog/new" className="btn-primary text-sm px-5 py-2 gap-2">
          <Plus size={15} /> New Post
        </Link>
      </div>

      <div className="glass-card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/5 text-gray-500 text-xs uppercase">
              <th className="text-left px-5 py-3">Title</th>
              <th className="text-left px-5 py-3">Category</th>
              <th className="text-center px-5 py-3">Status</th>
              <th className="text-left px-5 py-3">Date</th>
              <th className="text-right px-5 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {posts.map((p) => (
              <tr key={p.id} className="border-b border-white/5 hover:bg-white/2 transition-colors">
                <td className="px-5 py-3 text-white font-medium">
                  <span className="mr-2">{p.emoji}</span>{p.title}
                </td>
                <td className="px-5 py-3 text-gray-400">{p.category}</td>
                <td className="px-5 py-3 text-center">
                  {p.published
                    ? <span className="badge-green flex items-center gap-1 justify-center w-fit mx-auto"><Eye size={10} /> Published</span>
                    : <span className="badge-yellow flex items-center gap-1 justify-center w-fit mx-auto"><EyeOff size={10} /> Draft</span>}
                </td>
                <td className="px-5 py-3 text-gray-500 text-xs">{new Date(p.createdAt).toLocaleDateString()}</td>
                <td className="px-5 py-3 text-right">
                  <div className="flex items-center justify-end gap-3">
                    <Link href={`/blog/${p.slug}`} target="_blank" className="text-xs text-gray-400 hover:text-white transition-colors">View</Link>
                    <Link href={`/admin/blog/${p.id}/edit`} className="text-xs text-purple-400 hover:text-purple-300 transition-colors">Edit</Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {posts.length === 0 && (
          <div className="p-12 text-center text-gray-500">
            <FileText size={40} className="mx-auto mb-4 opacity-30" />
            <p>No blog posts yet. Create your first post.</p>
          </div>
        )}
      </div>
    </div>
  );
}
