"use client";

import { useEffect } from "react";

export default function TawkChat() {
  useEffect(() => {
    const s1 = document.createElement("script");
    s1.async = true;
    s1.src = "https://embed.tawk.to/69a885fb8553a21c37dadce9/1jit4mpk2";
    s1.charset = "UTF-8";
    s1.setAttribute("crossorigin", "*");
    document.head.appendChild(s1);
    return () => {
      document.head.removeChild(s1);
    };
  }, []);
  return null;
}
