import { NextResponse } from "next/server";
import { staffCookieOptions } from "@/lib/staff-auth";

export async function POST() {
  const res = NextResponse.json({ data: null, error: null });
  res.cookies.set({ ...staffCookieOptions(), value: "", maxAge: 0 });
  return res;
}
