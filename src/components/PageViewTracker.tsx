"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

function getOrCreateSessionId() {
  if (typeof window === "undefined") return null;
  let sid = sessionStorage.getItem("vsid");
  if (!sid) {
    sid = Math.random().toString(36).slice(2) + Date.now().toString(36);
    sessionStorage.setItem("vsid", sid);
  }
  return sid;
}

export default function PageViewTracker() {
  const pathname = usePathname();
  const lastTracked = useRef<string>("");

  useEffect(() => {
    if (lastTracked.current === pathname) return;
    lastTracked.current = pathname;

    // Don't track admin pages
    if (pathname.startsWith("/admin")) return;

    const sessionId = getOrCreateSessionId();
    fetch("/api/analytics/pageview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        path: pathname,
        referrer: document.referrer || null,
        sessionId,
      }),
    }).catch(() => {});
  }, [pathname]);

  return null;
}
