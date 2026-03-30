
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const settings = await (db as any).siteSetting.findMany();
    const map: Record<string, string> = {};
    for (const s of settings) map[s.key] = s.value;
    return NextResponse.json({ data: map, error: null });
  } catch {
    return NextResponse.json({ data: {}, error: null });
  }
}
