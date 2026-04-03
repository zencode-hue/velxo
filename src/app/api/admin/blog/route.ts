import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
import { z } from "zod";
import { db } from "@/lib/db";
import { getServerSession } from "@/lib/auth";

const schema = z.object({
  title: z.string().min(1).max(200),
  slug: z.string().min(1).max(200).regex(/^[a-z0-9-]+$/),
  excerpt: z.string().min(1).max(500),
  content: z.string().min(1),
  category: z.string().default("General"),
  emoji: z.string().default("📝"),
  published: z.boolean().default(false),
});

async function requireAdmin() {
  const session = await getServerSession();
  if (!session?.user?.id || session.user.role !== "ADMIN") return null;
  return session;
}

export async function POST(req: NextRequest) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const post = await (db as any).blogPost.create({ data: parsed.data });
    return NextResponse.json({ data: post, error: null }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Slug already exists" }, { status: 400 });
  }
}

export async function GET() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const posts = await (db as any).blogPost.findMany({
    where: { published: true },
    orderBy: { createdAt: "desc" },
    select: { id: true, slug: true, title: true, excerpt: true, category: true, emoji: true, createdAt: true },
  });
  return NextResponse.json({ data: posts, error: null });
}
