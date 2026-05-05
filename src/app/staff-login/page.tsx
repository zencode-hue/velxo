"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import MetraMartLogo from "@/components/MetraMartLogo";

export default function StaffLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/staff/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Login failed");
        return;
      }
      router.push("/staff");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0b0f] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <MetraMartLogo size={40} />
          <h1 className="text-2xl font-bold text-white mt-4">Staff Portal</h1>
          <p className="text-gray-500 text-sm mt-1">Sign in to your staff account</p>
        </div>

        <div className="glass-card p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="input-field w-full"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="input-field w-full"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <p className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full py-2.5">
              {loading ? "Signing in…" : "Sign In"}
            </button>
          </form>

          <p className="text-center text-sm text-gray-600 mt-4">
            No account?{" "}
            <Link href="/staff-register" className="text-blue-400 hover:text-blue-300 transition-colors">
              Request access
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
