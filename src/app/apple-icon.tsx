import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 180,
          height: 180,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0e0f14 0%, #1a1b23 100%)",
          borderRadius: 40,
        }}
      >
        <svg width="130" height="130" viewBox="0 0 100 100" fill="none">
          <defs>
            <linearGradient id="g1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00d4ff" />
              <stop offset="100%" stopColor="#5865f2" />
            </linearGradient>
          </defs>
          <polygon points="18,22 82,22 50,78" fill="#5865f2" opacity="0.45" transform="translate(6,4)" />
          <polygon points="18,22 82,22 50,78" fill="url(#g1)" />
          <polygon points="30,30 70,30 50,65" fill="#0e0f14" opacity="0.88" />
        </svg>
      </div>
    ),
    { ...size }
  );
}
