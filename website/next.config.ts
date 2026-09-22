import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'export',
  assetPrefix: '/iap',
  basePath: process.env.NODE_ENV === 'development' ? '/iap' : '',
  trailingSlash: false,
};

export default nextConfig;
