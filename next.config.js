/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
  },
  experimental: {
    serverActions: {
      allowedOrigins: ["localhost:3000", "velxo.shop", "*.vercel.app"],
    },
  },
};

module.exports = nextConfig;
