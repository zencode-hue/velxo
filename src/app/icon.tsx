import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 32,
          height: 32,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0d0a07",
          borderRadius: 8,
        }}
      >
        <svg width="28" height="28" viewBox="0 0 100 100" fill="none">
          <defs>
            <linearGradient id="g1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fbbf24" />
              <stop offset="100%" stopColor="#ea580c" />
            </linearGradient>
            <linearGradient id="g2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ea580c" />
              <stop offset="100%" stopColor="#7c3aed" stopOpacity="0.6" />
            </linearGradient>
          </defs>
          <polygon points="18,22 82,22 50,78" fill="#ea580c" opacity="0.5" transform="translate(6,4)" />
          <polygon points="18,22 82,22 50,78" fill="url(#g1)" />
          <polygon points="30,30 70,30 50,65" fill="#0d0a07" opacity="0.9" />
        </svg>
      </div>
    ),
    { ...size }
  );
}
