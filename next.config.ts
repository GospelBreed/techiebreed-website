import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  // MDX in /content is read from disk; ship it with the server bundle.
  outputFileTracingIncludes: {
    "/**": ["./content/**/*"],
  },
  partialPrefetching: true,
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
