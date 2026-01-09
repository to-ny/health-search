import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Security headers are now handled by proxy with dynamic nonce for CSP
  // See src/proxy.ts for CSP configuration (Next.js 16+ convention)
};

export default nextConfig;
