import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "wial.org" },
      { protocol: "https", hostname: "directory.wial.org" }
    ]
  }
};

export default nextConfig;
