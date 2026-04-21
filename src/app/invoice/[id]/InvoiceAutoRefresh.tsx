"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function InvoiceAutoRefresh({ status }: { status: string }) {
  const router = useRouter();

  useEffect(() => {
    // Only poll for PENDING orders — refresh every 15 seconds
    if (status !== "PENDING") return;

    const interval = setInterval(() => {
      router.refresh();
    }, 15000);

    return () => clearInterval(interval);
  }, [status, router]);

  return null;
}
