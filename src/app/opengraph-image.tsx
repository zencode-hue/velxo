import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "MetraMart — Cheap Digital Subscriptions";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #000000 0%, #0a0800 50%, #050400 100%)",
          fontFamily: "system-ui, sans-serif",
          position: "relative",
        }}
      >
        {/* Background glow */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 600,
            height: 400,
            borderRadius: "50%",
            background: "radial-gradient(ellipse, rgba(245,158,11,0.15) 0%, transparent 70%)",
          }}
        />

        {/* Logo area */}
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 32 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 16,
              background: "rgba(245,158,11,0.2)",
              border: "2px solid rgba(245,158,11,0.4)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 28,
            }}
          >
            ⚡
          </div>
          <span
            style={{
              fontSize: 48,
              fontWeight: 800,
              background: "linear-gradient(135deg, #fde68a, #d97706)",
              backgroundClip: "text",
              color: "transparent",
              letterSpacing: "-1px",
            }}
          >
            MetraMart
          </span>
        </div>

        {/* Tagline */}
        <p
          style={{
            fontSize: 28,
            color: "rgba(255,255,255,0.85)",
            fontWeight: 600,
            marginBottom: 16,
            textAlign: "center",
          }}
        >
          Cheap Netflix, Spotify & Digital Subscriptions
        </p>

        <p
          style={{
            fontSize: 20,
            color: "rgba(255,255,255,0.45)",
            textAlign: "center",
            maxWidth: 700,
          }}
        >
          Instant delivery · Secure payments · Best prices guaranteed
        </p>

        {/* Feature pills */}
        <div style={{ display: "flex", gap: 12, marginTop: 40 }}>
          {["⚡ Instant Delivery", "🔒 Secure", "💰 Best Prices", "🌍 Worldwide"].map((label) => (
            <div
              key={label}
              style={{
                padding: "8px 20px",
                borderRadius: 100,
                background: "rgba(245,158,11,0.12)",
                border: "1px solid rgba(245,158,11,0.3)",
                color: "#fde68a",
                fontSize: 16,
                fontWeight: 500,
              }}
            >
              {label}
            </div>
          ))}
        </div>

        {/* URL */}
        <p style={{ position: "absolute", bottom: 32, color: "rgba(255,255,255,0.25)", fontSize: 16 }}>
          metramart.xyz
        </p>
      </div>
    ),
    { ...size }
  );
}
