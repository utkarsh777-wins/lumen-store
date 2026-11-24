import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  // Next 16.4.3 pins a devtools pill to the corner. `devIndicators: false` drops the
  // route mark, but the security advisory still counts as an error and keeps the
  // "1 Insight" toast on screen. `agentUpgrade: false` skips that advisory in dev.
  // Production `next start` does not mount devtools. Neither setting changes the footer.
  devIndicators: false,
  experimental: {
    agentUpgrade: false,
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

export default nextConfig;
