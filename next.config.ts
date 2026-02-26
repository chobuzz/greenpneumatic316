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
};

export default nextConfig;
