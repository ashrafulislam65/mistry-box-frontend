import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
      { protocol: "http", hostname: "**" },
    ],
  },
  experimental: {
    staleTimes: {
      dynamic: 0, // dynamic পেজের client-side router cache সম্পূর্ণ বন্ধ
    },
  },
};

export default nextConfig;