import type { NextConfig } from "next";
import bundleAnalyzer from "@next/bundle-analyzer";

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/",
        destination: "/meetings",
        permanent: false,
      },
    ];
  },
};

export default withBundleAnalyzer(nextConfig);
