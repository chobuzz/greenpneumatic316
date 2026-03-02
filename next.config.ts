import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: 'sscomp.kr',
      },
      {
        protocol: 'https',
        hostname: 'sscomp.kr',
      },
      {
        protocol: 'http',
        hostname: 'ailair.co.kr',
      },
      {
        protocol: 'https',
        hostname: 'ailair.co.kr',
      },
    ],
  },
  // output: 'standalone' // ❌ Vercel 배포 시 사용하면 안 됨 (Docker 전용)
};

export default nextConfig;
