import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["127.0.0.1"],
  outputFileTracingIncludes: {
    "/blog/**": ["./content/blog/**/*"],
    "/sitemap.xml": ["./content/blog/**/*"],
  },
  async redirects() {
    return [
      {
        source: "/blog/all",
        destination: "/blog",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
