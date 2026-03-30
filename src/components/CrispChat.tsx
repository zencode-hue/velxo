"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    $crisp: unknown[];
    CRISP_WEBSITE_ID: string;
  }
}

export default function CrispChat({ websiteId }: { websiteId: string }) {
  useEffect(() => {
    if (!websiteId) return;
    window.$crisp = [];
    window.CRISP_WEBSITE_ID = websiteId;
    const s = document.createElement("script");
    s.src = "https://client.crisp.chat/l.js";
    s.async = true;
    document.head.appendChild(s);
  }, [websiteId]);

  return null;
}
