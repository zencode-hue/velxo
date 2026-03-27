import { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

/**
 * Extracts and validates a Bearer token from the Authorization header.
 * Returns the decoded JWT payload or null if invalid/missing.
 */
export async function getBearerSession(req: NextRequest) {
  // Support both session cookie (browser) and Authorization: Bearer <token> (API clients)
  const authHeader = req.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    // For API clients passing the NextAuth JWT directly as a Bearer token
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token) return null;
    return token;
  }
  // Fall back to cookie-based session
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  return token;
}
