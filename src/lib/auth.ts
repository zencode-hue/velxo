import { NextAuthOptions, Session, User, getServerSession as nextAuthGetServerSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { JWT } from "next-auth/jwt";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { sendLockoutEmail } from "@/lib/email";

const LOCKOUT_WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const MAX_FAILED_ATTEMPTS = 3;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes

async function isAccountLocked(userId: string): Promise<boolean> {
  const windowStart = new Date(Date.now() - LOCKOUT_WINDOW_MS);

  const recentFailures = await db.loginAttempt.count({
    where: {
      userId,
      success: false,
      createdAt: { gte: windowStart },
    },
  });

  if (recentFailures < MAX_FAILED_ATTEMPTS) return false;

  // Find the time of the Nth failure to determine if lockout is still active
  const nthFailure = await db.loginAttempt.findFirst({
    where: {
      userId,
      success: false,
      createdAt: { gte: windowStart },
    },
    orderBy: { createdAt: "asc" },
    skip: MAX_FAILED_ATTEMPTS - 1,
  });

  if (!nthFailure) return false;

  return Date.now() - nthFailure.createdAt.getTime() < LOCKOUT_DURATION_MS;
}

async function recordLoginAttempt(userId: string, success: boolean) {
  await db.loginAttempt.create({
    data: { userId, success },
  });
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db),
  session: { strategy: "jwt" },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required");
        }

        const user = await db.user.findUnique({
          where: { email: credentials.email.toLowerCase() },
        });

        if (!user || !user.passwordHash) {
          throw new Error("Invalid email or password");
        }

        const locked = await isAccountLocked(user.id);
        if (locked) {
          throw new Error(
            "Account is temporarily locked. Please try again in 15 minutes."
          );
        }

        const passwordValid = await bcrypt.compare(
          credentials.password,
          user.passwordHash
        );

        await recordLoginAttempt(user.id, passwordValid);

        if (!passwordValid) {
          // Check if this failure just hit the lockout threshold
          const windowStart = new Date(Date.now() - LOCKOUT_WINDOW_MS);
          const recentFailures = await db.loginAttempt.count({
            where: { userId: user.id, success: false, createdAt: { gte: windowStart } },
          });
          if (recentFailures === MAX_FAILED_ATTEMPTS) {
            await sendLockoutEmail(user.email);
          }
          throw new Error("Invalid email or password");
        }

        if (!user.emailVerified) {
          throw new Error(
            "Please verify your email address before logging in."
          );
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async jwt({ token, user }: { token: JWT; user?: User }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
  },
};

export function getServerSession() {
  return nextAuthGetServerSession(authOptions);
}
