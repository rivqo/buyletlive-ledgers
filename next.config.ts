import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  transpilePackages: [
    '@bluebulb/staff-auth',
    '@bluebulb/tokens',
    '@bluebulb/ui',
    '@bluebulb/platform',
    '@bluebulb/email',
    '@bluebulb/sdk-core',
  ],
};

export default nextConfig;
