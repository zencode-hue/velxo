import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "@/lib/rate-limit";

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const host = request.headers.get("host") ?? "";

  // ── www → non-www canonical redirect ────────────────────────────────────
  if (host.startsWith("www.")) {
    const nonWwwHost = host.replace(/^www\./, "");
    const url = `https://${nonWwwHost}${pathname}${search}`;
    return NextResponse.redirect(url, { status: 301 });
  }

  // ── Rate limiting for /api/v1/* ──────────────────────────────────────────
  if (pathname.startsWith("/api/v1/")) {
    const ip =
      request.ip ??
      request.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
      "unknown";

    const result = rateLimit(ip);

    if (!result.success) {
      return NextResponse.json(
        {
          error: "Too many requests",
          data: null,
          meta: { retryAfter: result.reset },
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(result.reset),
            "X-RateLimit-Limit": "60",
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": String(result.reset),
          },
        }
      );
    }
  }

  // ── Admin route protection ───────────────────────────────────────────────
  if (pathname.startsWith("/admin")) {
    // NextAuth stores the session in a cookie named "next-auth.session-token"
    // (or "__Secure-next-auth.session-token" in production over HTTPS).
    const sessionCookie =
      request.cookies.get("next-auth.session-token") ??
      request.cookies.get("__Secure-next-auth.session-token");

    if (!sessionCookie) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icon|apple-icon|.*\\.png$|.*\\.ico$).*)",
  ],
};
