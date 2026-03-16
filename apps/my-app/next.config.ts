import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
  },
  // Disable eslint during build (we'll run it separately)
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Disable typescript errors during build (for faster iteration)
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
