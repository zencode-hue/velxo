"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { Zap, Eye, EyeOff } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const ref = searchParams.get("ref") ?? "";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErr(null);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, ref }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErr(data.error ?? "Registration failed");
      } else {
        setSuccess(true);
      }
    } catch {
      setErr("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="glass-card p-8 max-w-md w-full text-center">
          <div className="w-14 h-14 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">✉️</span>
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Check your email</h2>
          <p className="text-gray-400 text-sm">We sent a verification link to <strong className="text-white">{email}</strong>. Click it to activate your account.</p>
          <Link href="/auth/login" className="btn-primary mt-6 inline-flex text-sm px-6 py-2.5">Go to Login</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="absolute inset-0 pointer-events-none" style={{
        background: "radial-gradient(ellipse at 50% 30%, rgba(124,58,237,0.08) 0%, transparent 60%)"
      }} />

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 font-bold text-2xl">
            <Zap size={24} className="text-purple-500" />
            <span className="gradient-text">Velxo</span>
          </Link>
          <p className="text-gray-500 mt-2 text-sm">Create your account</p>
        </div>

        <div className="glass-card p-8">
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Name (optional)</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" className="input-field" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required className="input-field" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 8 characters"
                  required
                  minLength={8}
                  className="input-field pr-10"
                />
                <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {ref && <p className="text-xs text-purple-400">Referred by a friend 🎉</p>}
            {err && <p className="text-red-400 text-sm">{err}</p>}

            <button type="submit" disabled={loading} className="btn-primary w-full py-3">
              {loading ? "Creating account…" : "Create Account"}
            </button>
          </form>

          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5" /></div>
            <div className="relative flex justify-center text-xs text-gray-600"><span className="bg-[#111] px-3">or</span></div>
          </div>

          <button onClick={() => signIn("google", { callbackUrl: "/dashboard" })} className="btn-secondary w-full py-3 text-sm gap-3">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
              <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
              <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
              <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>

          <p className="text-center text-sm text-gray-500 mt-5">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-purple-400 hover:text-purple-300 transition-colors">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
