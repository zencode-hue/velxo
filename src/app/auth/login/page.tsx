"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Lock } from "lucide-react";
import MetraMartLogo from "@/components/MetraMartLogo";

function LoginPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const verified = searchParams.get("verified");
  const error = searchParams.get("error");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // Admin modal state
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");
  const [adminLoading, setAdminLoading] = useState(false);
  const [adminErr, setAdminErr] = useState<string | null>(null);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErr(null);
    const res = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);
    if (res?.error) {
      setErr(res.error === "CredentialsSignin" ? "Invalid email or password" : res.error);
    } else {
      router.push("/dashboard");
    }
  }

  async function handleGoogleLogin() {
    await signIn("google", { callbackUrl: "/dashboard" });
  }

  async function handleAdminLogin(e: React.FormEvent) {
    e.preventDefault();
    setAdminLoading(true);
    setAdminErr(null);
    try {
      const res = await fetch("/api/auth/admin-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: adminPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setAdminErr(data.error ?? "Login failed");
        setAdminLoading(false);
        return;
      }
      // Sign in as the admin user using their email
      const signInRes = await signIn("credentials", {
        email: data.data.email,
        password: adminPassword, // won't match bcrypt — we need a special flow
        redirect: false,
      });
      // Since admin uses password-only login (not bcrypt), use a special token approach
      // Store a flag and redirect
      if (signInRes?.error) {
        // Fallback: redirect to admin with a session cookie set server-side
        const tokenRes = await fetch("/api/auth/admin-session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password: adminPassword }),
        });
        if (tokenRes.ok) {
          router.push("/admin");
        } else {
          setAdminErr("Admin session creation failed");
        }
      } else {
        router.push("/admin");
      }
    } catch {
      setAdminErr("Something went wrong");
    } finally {
      setAdminLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      {/* Purple glow */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: "radial-gradient(ellipse at 50% 30%, rgba(59,130,246,0.08) 0%, transparent 60%)"
      }} />

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2.5 font-bold text-2xl">
            <MetraMartLogo size={28} />
            <span style={{ background: "linear-gradient(135deg, #fde68a, #d97706)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>MetraMart</span>
          </Link>
          <p className="text-slate-500 mt-2 text-sm">Sign in to your account</p>
        </div>

        {verified && (
          <div className="mb-4 p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-sm text-center">
            Email verified! You can now sign in.
          </div>
        )}
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
            {error === "OAuthAccountNotLinked" ? "This email is already registered. Sign in with email/password." : "Authentication error. Please try again."}
          </div>
        )}

        <div className="glass-card p-8">
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="input-field pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {err && <p className="text-red-400 text-sm">{err}</p>}

            <div className="flex items-center justify-end">
              <Link href="/auth/forgot-password" className="text-xs text-amber-400 hover:text-amber-300 transition-colors">
                Forgot password?
              </Link>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-3">
              {loading ? "Signing in…" : "Sign In"}
            </button>
          </form>

          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/5" />
            </div>
            <div className="relative flex justify-center text-xs text-gray-600">
              <span className="bg-[#111] px-3">or continue with</span>
            </div>
          </div>

          <button
            onClick={handleGoogleLogin}
            className="btn-secondary w-full py-3 text-sm gap-3"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
              <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
              <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
              <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>

          <p className="text-center text-sm text-slate-500 mt-5">
            Don&apos;t have an account?{" "}
            <Link href="/auth/register" className="text-amber-400 hover:text-amber-300 transition-colors">
              Sign up
            </Link>
          </p>

          {/* Hidden admin access button */}
          <div className="mt-6 flex justify-center">
            <button
              onClick={() => setShowAdminModal(true)}
              className="text-[10px] text-gray-700 hover:text-gray-500 transition-colors flex items-center gap-1"
            >
              <Lock size={9} />
              Admin
            </button>
          </div>
        </div>
      </div>

      {/* Admin password modal */}
      {showAdminModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
          <div className="glass-card p-6 w-full max-w-sm">
            <div className="flex items-center gap-2 mb-4">
              <Lock size={16} className="text-amber-400" />
              <h2 className="text-base font-semibold text-white">Admin Access</h2>
            </div>
            <form onSubmit={handleAdminLogin} className="space-y-4">
              <input
                type="password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                placeholder="Enter admin password"
                required
                autoFocus
                className="input-field"
              />
              {adminErr && <p className="text-red-400 text-sm">{adminErr}</p>}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => { setShowAdminModal(false); setAdminErr(null); setAdminPassword(""); }}
                  className="btn-secondary flex-1 py-2.5 text-sm"
                >
                  Cancel
                </button>
                <button type="submit" disabled={adminLoading} className="btn-primary flex-1 py-2.5 text-sm">
                  {adminLoading ? "Verifying…" : "Enter"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginPageInner />
    </Suspense>
  );
}
