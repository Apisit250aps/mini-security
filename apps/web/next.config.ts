import type { NextConfig } from 'next';
import config from '@repo/configs';

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  experimental: {
    authInterrupts: true,
  },
  async rewrites() {
    return [
      {
        source: '/api/auth/:path*',
        destination: `${config.backend.url}/api/auth/:path*`,
      },
      {
        source: '/api/:path*',
        destination: `${config.backend.url}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
