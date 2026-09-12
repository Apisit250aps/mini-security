import type { NextConfig } from 'next';
import config from '@repo/configs';

const nextConfig: NextConfig = {
  output: 'standalone',
  /* config options here */
  reactCompiler: true,
  experimental: {
    authInterrupts: true,
    optimizePackageImports: [
      'lucide-react',
      'date-fns',
      'recharts',
      'react-aria-components',
      '@internationalized/date',
    ],
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
