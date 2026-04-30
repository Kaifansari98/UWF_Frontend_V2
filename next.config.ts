import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    domains: ["images.unsplash.com", "unitedwelfarefoundation.com", "localhost"],
  },
};

export default nextConfig;
