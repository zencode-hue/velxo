"use client";

import { useState } from "react";
import { requireAdmin } from "@/lib/admin-auth";

// This is a server component wrapper
export default function SetupPage() {
  return <SetupClient />;
}

function SetupClient() {
  const [results, setResults] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});

  async function run(name: string, url: string) {
    setLoading((l) => ({ ...l, [name]: true }));
    try {
      const token = prompt("Enter ADMIN_SETUP_TOKEN:");
      if (!token) return;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const data = await res.json();
      setResults((r) => ({ ...r, [name]: data.message ?? data.error ?? JSON.stringify(data) }));
    } catch (e) {
      setResults((r) => ({ ...r, [name]: "Error: " + String(e) }));
    } finally {
      setLoading((l) => ({ ...l, [name]: false }));
    }
  }

  const tasks = [
    { name: "Seed Products", url: "/api/auth/seed-products", desc: "Add 29 products to the database" },
    { name: "Seed Blog Posts", url: "/api/auth/seed-blog", desc: "Add 6 blog posts to the database" },
    { name: "Set Product Ratings", url: "/api/auth/seed-ratings", desc: "Give all products 4.2–5.0 star ratings" },
    { name: "Setup Admin", url: "/api/auth/setup-admin", desc: "Create the admin account" },
  ];

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-white mb-2">One-Time Setup</h1>
      <p className="text-gray-500 text-sm mb-8">Run these tasks once to initialize your store data.</p>

      <div className="space-y-4">
        {tasks.map((task) => (
          <div key={task.name} className="glass-card p-5 flex items-center justify-between gap-4">
            <div>
              <p className="font-semibold text-white text-sm">{task.name}</p>
              <p className="text-xs text-gray-500 mt-0.5">{task.desc}</p>
              {results[task.name] && (
                <p className={`text-xs mt-1 ${results[task.name].includes("Error") ? "text-red-400" : "text-green-400"}`}>
                  {results[task.name]}
                </p>
              )}
            </div>
            <button
              onClick={() => run(task.name, task.url)}
              disabled={loading[task.name]}
              className="btn-primary text-sm px-5 py-2 shrink-0"
            >
              {loading[task.name] ? "Running…" : "Run"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
