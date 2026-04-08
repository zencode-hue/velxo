import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createHmac, randomBytes, timingSafeEqual } from "crypto";
import { db } from "@/lib/db";

const SECRET = process.env.STAFF_JWT_SECRET ?? process.env.NEXTAUTH_SECRET ?? "staff-secret-fallback";
const COOKIE = "staff-session";
const TTL_MS = 8 * 60 * 60 * 1000; // 8 hours

export interface StaffPayload {
  id: string;
  email: string;
  name: string;
}

function sign(data: string): string {
  return createHmac("sha256", SECRET).update(data).digest("hex");
}

export function createStaffToken(payload: StaffPayload): string {
  const body = Buffer.from(
    JSON.stringify({ ...payload, exp: Date.now() + TTL_MS })
  ).toString("base64url");
  const sig = sign(body);
  return `${body}.${sig}`;
}

export function verifyStaffToken(token: string): StaffPayload | null {
  try {
    const [body, sig] = token.split(".");
    if (!body || !sig) return null;

    const expected = sign(body);
    if (!timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;

    const parsed = JSON.parse(Buffer.from(body, "base64url").toString());
    if (parsed.exp < Date.now()) return null;

    return { id: parsed.id, email: parsed.email, name: parsed.name };
  } catch {
    return null;
  }
}

export async function getStaffSession(): Promise<StaffPayload | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE)?.value;
    if (!token) return null;
    return verifyStaffToken(token);
  } catch {
    return null;
  }
}

export async function requireStaff() {
  const session = await getStaffSession();
  if (!session) redirect("/staff-login");

  const staff = await db.staffMember.findUnique({ where: { id: session.id } });
  if (!staff || staff.status !== "ACTIVE") redirect("/staff-login");

  return session;
}

export function staffCookieOptions() {
  return {
    name: COOKIE,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: 60 * 60 * 8,
  };
}
