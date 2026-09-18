import type { NextConfig } from 'next';

import createNextIntlPlugin from 'next-intl/plugin';

const nextConfig: NextConfig = {
  output: 'standalone',
  reactStrictMode: false,
  allowedDevOrigins: ['127.0.0.1', 'localhost'],
  experimental: {
    authInterrupts: true,
  },
  images: {
    dangerouslyAllowLocalIP: true,
    minimumCacheTTL: 3600,
    unoptimized: true,
    remotePatterns: [
      {
        hostname: '**',
      },
    ],
  },
};

const withNextIntl = createNextIntlPlugin('./src/shared/i18n/request.ts');

export default withNextIntl(nextConfig);
