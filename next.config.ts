import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  // The root layout sits under [lang], so unmatched URLs need app/global-not-found.tsx.
  experimental: { globalNotFound: true },
  images: {
    formats: ["image/avif", "image/webp"],
    qualities: [70, 78, 85],
  },
};

export default nextConfig;
