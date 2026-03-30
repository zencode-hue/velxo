"use client";

import { useEffect, useState } from "react";
import { TrendingUp } from "lucide-react";

interface DayData { date: string; revenue: number; orders: number }

export default function RevenueChart() {
  const [data, setData] = useState<DayData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/analytics?range=30")
      .then((r) => r.json())
      .then((d) => { setData(d.data?.daily ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="glass-card p-6 h-48 animate-pulse" />;
  if (!data.length) return null;

  const maxRevenue = Math.max(...data.map((d) => d.revenue), 1);

  return (
    <div className="glass-card p-6">
      <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
        <TrendingUp size={15} className="text-purple-400" /> Revenue — Last 30 Days
      </h2>
      <div className="flex items-end gap-1 h-32">
        {data.map((d) => (
          <div key={d.date} className="flex-1 flex flex-col items-center gap-1 group relative">
            <div
              className="w-full rounded-t bg-purple-600/60 hover:bg-purple-500/80 transition-colors cursor-default"
              style={{ height: `${Math.max(4, (d.revenue / maxRevenue) * 100)}%` }}
            />
            <div className="absolute bottom-full mb-1 hidden group-hover:block bg-black/80 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10">
              {d.date}: ${d.revenue.toFixed(2)} ({d.orders} orders)
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-between text-xs text-gray-600 mt-1">
        <span>{data[0]?.date}</span>
        <span>{data[data.length - 1]?.date}</span>
      </div>
    </div>
  );
}
