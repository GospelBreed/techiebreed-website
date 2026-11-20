import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  // MDX in /content is read from disk; ship it with the server bundle.
  outputFileTracingIncludes: {
    "/**": ["./content/**/*"],
  },
  partialPrefetching: true,
  // Basic security headers on every page (HSTS is added by Vercel).
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Content-Security-Policy", value: "frame-ancestors 'self'" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
