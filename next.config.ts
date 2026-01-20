import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  async rewrites() {
    return [
      {
        source: '/api/auth/:path*',
        destination: 'http://localhost:8000/auth/:path*', // Proxy to FastAPI
      },
      {
        source: '/api/users/:path*',
        destination: 'http://localhost:8000/users/:path*',
      },
      {
        source: '/api/payments/:path*',
        destination: 'http://localhost:8000/payments/:path*',
      },
    ];
  },
};

export default nextConfig;
