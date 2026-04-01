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
          background: "#0d0a07",
          borderRadius: 40,
        }}
      >
        <svg width="140" height="140" viewBox="0 0 100 100" fill="none">
          <defs>
            <linearGradient id="g1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fbbf24" />
              <stop offset="100%" stopColor="#ea580c" />
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
