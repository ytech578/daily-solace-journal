import type { NextConfig } from "next";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${API_URL}/api/:path*`,
      },
      {
        source: "/doi/:path*",
        destination: `${API_URL}/api/articles/doi/:path*`,
      },
    ];
  },
};

export default nextConfig;
