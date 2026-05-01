import type { NextConfig } from "next";

const getHostname = (value?: string) => {
  if (!value) return null;
  try {
    return new URL(value).hostname;
  } catch {
    return null;
  }
};

const imageDomains = [
  "images.unsplash.com",
  "localhost",
  "127.0.0.1",
  getHostname(process.env.NEXT_PUBLIC_APP_URL),
  getHostname(process.env.NEXT_PUBLIC_ASSET_BASE_URL),
  getHostname(process.env.NEXT_PUBLIC_API_URL),
].filter((domain): domain is string => Boolean(domain));

const nextConfig: NextConfig = {
  output: "standalone",
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    domains: [...new Set(imageDomains)],
  },
};

export default nextConfig;
