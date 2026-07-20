import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [new URL("https://m.media-amazon.com/**")],
  },
};

export default nextConfig;
