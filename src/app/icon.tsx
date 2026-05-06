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
          background: "linear-gradient(135deg, #1a0f00, #0a0800)",
          borderRadius: 8,
          border: "1px solid rgba(245,158,11,0.3)",
        }}
      >
        <span style={{
          fontSize: 22,
          fontWeight: 900,
          fontFamily: "system-ui, sans-serif",
          background: "linear-gradient(135deg, #fde68a, #d97706)",
          backgroundClip: "text",
          color: "transparent",
          lineHeight: 1,
        }}>
          M
        </span>
      </div>
    ),
    { ...size }
  );
}
