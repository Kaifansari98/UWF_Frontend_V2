import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  eslint: {
    ignoreDuringBuilds: true, // ⛔️ disables lint errors on build
  },
  images: {
    domains: ["images.unsplash.com", "localhost"],
  },
};

export default nextConfig;
