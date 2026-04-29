/** @type {import('next').NextConfig} */
const nextConfig = {
  // Mark Puppeteer + serverless Chromium as external so Next.js doesn't try
  // to bundle them via webpack (which fails on the chromium binary tarball).
  // Vercel will copy these from node_modules into the lambda payload via
  // outputFileTracing.
  experimental: {
    serverComponentsExternalPackages: [
      "@sparticuz/chromium",
      "puppeteer-core",
    ],
    // Force Next.js to copy the Chromium binary tarball into the lambda
    // payload — outputFileTracing misses it because it's loaded dynamically.
    outputFileTracingIncludes: {
      "/api/recipes/[id]/pdf": [
        "./node_modules/@sparticuz/chromium/bin/**",
      ],
    },
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = config.externals || [];
      config.externals.push("@sparticuz/chromium", "puppeteer-core");
    }
    return config;
  },
};

export default nextConfig;
